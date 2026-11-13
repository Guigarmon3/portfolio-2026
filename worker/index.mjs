import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import seed from "../server/data/content.json";

const scrypt = promisify(scryptCallback);

const SESSION_MS = 12 * 60 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const CODE_TTL_MS = 5 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;
const MAX_JSON_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
};

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

function fail(status, message) {
  return json({ error: message }, status);
}

function parseCookies(header) {
  if (!header) return {};
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const name = part.slice(0, index).trim();
    try {
      cookies[name] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      cookies[name] = "";
    }
  }
  return cookies;
}

function hashCode(code) {
  return createHash("sha256").update(String(code)).digest();
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "local";
}

async function readJson(request, limit = MAX_JSON_BYTES) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > limit) {
    throw new ApiError(413, "El contenido supera el límite permitido.");
  }
  const text = await request.text();
  if (text.length > limit) {
    throw new ApiError(413, "El contenido supera el límite permitido.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "El cuerpo de la petición no es JSON válido.");
  }
}

/* --------------------------------------------------------------------------
   Sesión: cookie firmada con HMAC, sin estado en memoria.
   -------------------------------------------------------------------------- */

function signSession(expiresAt, env) {
  const payload = Buffer.from(
    JSON.stringify({ exp: expiresAt, v: 1 }),
  ).toString("base64url");
  const signature = createHmac("sha256", env.SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function readSession(request, env) {
  const token = parseCookies(request.headers.get("Cookie")).gg_session;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", env.SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (!data?.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function sessionCookie(token, url) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `gg_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
    SESSION_MS / 1000
  }${secure}`;
}

/* --------------------------------------------------------------------------
   Autenticación: contraseña (scrypt) + código de un solo uso por ntfy.
   -------------------------------------------------------------------------- */

async function verifyPassword(password, env) {
  let config;
  try {
    config = JSON.parse(env.ADMIN_PASSWORD);
  } catch {
    throw new ApiError(500, "La contraseña de administración no está configurada.");
  }
  const salt = Buffer.from(config.salt, "hex");
  const expected = Buffer.from(config.hash, "hex");
  const derived = await scrypt(
    password,
    salt,
    config.keylen || expected.length,
    {
      N: config.N || 16384,
      r: config.r || 8,
      p: config.p || 1,
      maxmem: 64 * 1024 * 1024,
    },
  );
  return safeEqual(derived, expected);
}

async function tooManyLoginAttempts(env, ip) {
  const since = Date.now() - LOGIN_WINDOW_MS;
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM login_attempts WHERE ip = ? AND ts > ?",
  )
    .bind(ip, since)
    .first();
  return Number(row?.count || 0) >= LOGIN_MAX_ATTEMPTS;
}

async function registerLoginAttempt(env, ip) {
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM login_attempts WHERE ts < ?").bind(
      now - LOGIN_WINDOW_MS,
    ),
    env.DB.prepare("INSERT INTO login_attempts (ip, ts) VALUES (?, ?)").bind(
      ip,
      now,
    ),
  ]);
}

async function createChallenge(env) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const token = randomBytes(24).toString("hex");
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM challenges WHERE expires < ?").bind(now),
    env.DB.prepare(
      "INSERT INTO challenges (token, hash, expires, attempts) VALUES (?, ?, ?, 0)",
    ).bind(token, hashCode(code).toString("hex"), now + CODE_TTL_MS),
  ]);
  return { code, token };
}

async function checkChallenge(env, token, code) {
  const row = await env.DB.prepare(
    "SELECT hash, expires, attempts FROM challenges WHERE token = ?",
  )
    .bind(token)
    .first();

  if (!row) return { ok: false, reason: "expired" };
  if (Number(row.expires) < Date.now()) {
    await env.DB.prepare("DELETE FROM challenges WHERE token = ?")
      .bind(token)
      .run();
    return { ok: false, reason: "expired" };
  }

  const attempts = Number(row.attempts || 0) + 1;
  const matches = safeEqual(
    Buffer.from(row.hash, "hex"),
    hashCode(code),
  );

  if (!matches) {
    const attemptsLeft = CODE_MAX_ATTEMPTS - attempts;
    if (attemptsLeft <= 0) {
      await env.DB.prepare("DELETE FROM challenges WHERE token = ?")
        .bind(token)
        .run();
      return { ok: false, reason: "blocked" };
    }
    await env.DB.prepare(
      "UPDATE challenges SET attempts = ? WHERE token = ?",
    )
      .bind(attempts, token)
      .run();
    return { ok: false, reason: "wrong", attemptsLeft };
  }

  await env.DB.prepare("DELETE FROM challenges WHERE token = ?")
    .bind(token)
    .run();
  return { ok: true };
}

async function sendCodeByNtfy(code, env) {
  const topic = env.NTFY_TOPIC;
  if (!topic) throw new Error("Falta el topic de ntfy.");
  const base = String(env.NTFY_SERVER || "https://ntfy.sh").replace(/\/+$/, "");
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    Title: "Acceso al portfolio",
    Tags: "lock,key",
    Priority: "high",
  };
  if (env.SITE_URL) headers.Click = `${env.SITE_URL}/?edit=1`;
  const response = await fetch(`${base}/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers,
    body: `Código de acceso: ${code}\nCaduca en 5 minutos.`,
  });
  if (!response.ok) {
    throw new Error(`ntfy respondió ${response.status}`);
  }
}

/* --------------------------------------------------------------------------
   Contenido
   -------------------------------------------------------------------------- */

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validContent(content) {
  if (!isRecord(content)) return false;
  if (content.version !== 1) return false;
  if (!isRecord(content.profile)) return false;
  if (!isRecord(content.sections)) return false;
  if (!Array.isArray(content.projects)) return false;
  if (!Array.isArray(content.experience)) return false;
  if (!Array.isArray(content.education)) return false;
  if (!Array.isArray(content.stack)) return false;
  if (!isRecord(content.settings)) return false;
  return true;
}

async function loadContent(env) {
  const row = await env.DB.prepare(
    "SELECT json, updated_at FROM content WHERE id = 'site'",
  ).first();

  if (row) {
    return { content: JSON.parse(row.json), updatedAt: row.updated_at };
  }

  const content = seed.content;
  const updatedAt = seed.updatedAt || new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO content (id, json, updated_at) VALUES ('site', ?, ?) ON CONFLICT(id) DO NOTHING",
  )
    .bind(JSON.stringify(content), updatedAt)
    .run();
  return { content, updatedAt };
}

async function saveContent(content, env) {
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO content (id, json, updated_at) VALUES ('site', ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
  )
    .bind(JSON.stringify(content), updatedAt)
    .run();
  return { content, updatedAt };
}

/* --------------------------------------------------------------------------
   Imágenes: se guardan en KV y se sirven desde /uploads.
   -------------------------------------------------------------------------- */

function detectImage(buffer) {
  if (!buffer || buffer.length < 12) return null;

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }

  const head = new TextDecoder().decode(buffer.subarray(0, 6));
  if (head === "GIF87a" || head === "GIF89a") {
    return { ext: "gif", mime: "image/gif" };
  }

  if (
    new TextDecoder().decode(buffer.subarray(0, 4)) === "RIFF" &&
    new TextDecoder().decode(buffer.subarray(8, 12)) === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  const brand = new TextDecoder().decode(buffer.subarray(4, 12));
  if (brand.startsWith("ftypavif") || brand.startsWith("ftypavis")) {
    return { ext: "avif", mime: "image/avif" };
  }

  return null;
}

async function handleUpload(request, env) {
  if (!readSession(request, env)) {
    throw new ApiError(401, "Sesión caducada. Vuelve a entrar.");
  }

  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "El archivo supera el límite permitido (12 MB).");
  }

  const body = await request.arrayBuffer();
  if (!body.byteLength) {
    throw new ApiError(400, "No se recibió ninguna imagen.");
  }
  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "El archivo supera el límite permitido (12 MB).");
  }

  const buffer = new Uint8Array(body);
  const kind = detectImage(buffer);
  if (!kind) {
    throw new ApiError(415, "Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.");
  }

  const filename = `${Date.now().toString(36)}-${randomBytes(8).toString(
    "hex",
  )}.${kind.ext}`;
  await env.UPLOADS.put(`uploads/${filename}`, body, {
    metadata: { contentType: kind.mime },
  });

  return json(
    { url: `/uploads/${filename}`, bytes: body.byteLength, type: kind.mime },
    201,
  );
}

async function serveUpload(url, env, request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  let name;
  try {
    name = decodeURIComponent(url.pathname.slice("/uploads/".length));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!/^[a-z0-9]+-[a-f0-9]+\.(png|jpg|gif|webp|avif)$/i.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  const { value, metadata } = await env.UPLOADS.getWithMetadata(
    `uploads/${name}`,
    "arrayBuffer",
  );
  if (!value) return new Response("Not found", { status: 404 });

  return new Response(request.method === "HEAD" ? null : value, {
    headers: {
      "Content-Type": metadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/* --------------------------------------------------------------------------
   Rutas de la API
   -------------------------------------------------------------------------- */

async function handleApi(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/health") {
    if (method !== "GET") return fail(405, "Método no permitido");
    return json({
      ok: true,
      service: "portfolio-api",
      time: new Date().toISOString(),
    });
  }

  if (path === "/api/content") {
    if (method === "GET") {
      return json(await loadContent(env));
    }
    if (method === "PUT") {
      if (!readSession(request, env)) {
        return fail(401, "Sesión caducada. Vuelve a entrar.");
      }
      const payload = await readJson(request);
      if (!validContent(payload?.content)) {
        return fail(
          400,
          "El contenido no tiene el formato esperado (version 1, profile, sections, projects, experience, education, stack, settings).",
        );
      }
      return json(await saveContent(payload.content, env));
    }
    return fail(405, "Método no permitido");
  }

  if (path === "/api/auth/login") {
    if (method !== "POST") return fail(405, "Método no permitido");
    const ip = clientIp(request);
    if (await tooManyLoginAttempts(env, ip)) {
      return fail(
        429,
        "Demasiados intentos. Espera unos minutos antes de volver a probar.",
      );
    }

    const body = await readJson(request);
    if (typeof body?.password !== "string" || !body.password) {
      return fail(400, "Falta la contraseña");
    }

    let valid = false;
    try {
      valid = await verifyPassword(body.password, env);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("[auth] Error comprobando la contraseña:", error);
      return fail(500, "No se pudo comprobar la contraseña");
    }

    if (!valid) {
      await registerLoginAttempt(env, ip);
      return fail(401, "Contraseña incorrecta");
    }

    const { code, token } = await createChallenge(env);
    let sent = false;
    try {
      await sendCodeByNtfy(code, env);
      sent = true;
    } catch (error) {
      console.error("[auth] No se pudo enviar el código por ntfy:", error.message);
      if (env.AUTH_DEBUG !== "1") {
        await env.DB.prepare("DELETE FROM challenges WHERE token = ?")
          .bind(token)
          .run();
        return fail(
          502,
          "La contraseña es correcta, pero no se pudo enviar el código a ntfy. Revisa la conexión o el topic.",
        );
      }
    }

    if (env.AUTH_DEBUG === "1") {
      console.log(`[auth] Código de acceso (debug): ${code}`);
    }

    return json({
      challenge: token,
      sent,
      expiresIn: Math.round(CODE_TTL_MS / 1000),
      ...(env.AUTH_DEBUG === "1" ? { debugCode: code } : {}),
    });
  }

  if (path === "/api/auth/verify") {
    if (method !== "POST") return fail(405, "Método no permitido");
    const body = await readJson(request);
    if (typeof body?.challenge !== "string" || typeof body?.code !== "string") {
      return fail(400, "Faltan datos para verificar el código");
    }

    const result = await checkChallenge(env, body.challenge, body.code);
    if (!result.ok) {
      if (result.reason === "blocked") {
        return fail(
          429,
          "Demasiados códigos incorrectos. Vuelve a empezar el acceso.",
        );
      }
      if (result.reason === "expired") {
        return fail(401, "El código ha caducado. Vuelve a introducir la contraseña.");
      }
      return fail(
        401,
        `Código incorrecto. Te quedan ${result.attemptsLeft} intentos.`,
      );
    }

    await env.DB.prepare("DELETE FROM login_attempts WHERE ip = ?")
      .bind(clientIp(request))
      .run();

    const expiresAt = Date.now() + SESSION_MS;
    const token = signSession(expiresAt, env);
    return json(
      { authenticated: true },
      200,
      { "Set-Cookie": sessionCookie(token, url) },
    );
  }

  if (path === "/api/auth/logout") {
    if (method !== "POST") return fail(405, "Método no permitido");
    return json(
      { authenticated: false },
      200,
      {
        "Set-Cookie":
          "gg_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      },
    );
  }

  if (path === "/api/auth/me") {
    if (method !== "GET") return fail(405, "Método no permitido");
    const session = readSession(request, env);
    return json({
      authenticated: Boolean(session),
      expiresAt: session ? new Date(session.exp).toISOString() : null,
    });
  }

  if (path === "/api/upload") {
    if (method !== "POST") return fail(405, "Método no permitido");
    return handleUpload(request, env);
  }

  return fail(404, "Ruta no encontrada");
}

/* --------------------------------------------------------------------------
   Meridiano · cotizaciones ligeras para /investing
   --------------------------------------------------------------------------
   El snapshot de Meridiano trae fichas, fundamentales y gráficos. Este
   endpoint añade solo la cotización del día para que la interfaz pueda
   refrescar precios sin depender de FastAPI. Yahoo Finance sigue siendo una
   fuente gratuita y no oficial: no se promete tiempo real consolidado. */

const MERIDIAN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MERIDIAN_BONDS = new Set([
  "US10Y", "US2Y", "US30Y", "DE10Y", "ES10Y", "TBILL3M",
]);
const MERIDIAN_CRYPTO = new Set(["BTC", "ETH", "SOL", "XRP", "ADA"]);
const MERIDIAN_QUOTE_TTL_MS = 8000;
const MERIDIAN_MANIFEST_TTL_MS = 5 * 60 * 1000;
const meridianQuoteCache = new Map();
let meridianManifest = { at: 0, symbols: null };

function meridianPositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function meridianMarketState(meta, ticker) {
  if (MERIDIAN_CRYPTO.has(ticker)) return "open";
  const period = meta?.currentTradingPeriod?.regular || {};
  const start = Number(period.start);
  const end = Number(period.end);
  const now = Date.now() / 1000;
  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    if (now < start) return "pre";
    if (now <= end) return "open";
    return "closed";
  }
  return "unknown";
}

async function meridianSymbols(env, url) {
  if (
    meridianManifest.symbols &&
    Date.now() - meridianManifest.at < MERIDIAN_MANIFEST_TTL_MS
  ) {
    return meridianManifest.symbols;
  }
  const assetUrl = new URL("/investing/data/live/manifest.json", url);
  const response = await env.ASSETS.fetch(
    new Request(assetUrl.toString(), {
      headers: { Accept: "application/json" },
    }),
  );
  if (!response.ok) throw new Error(`Manifiesto ${response.status}`);
  const manifest = await response.json();
  meridianManifest = {
    at: Date.now(),
    symbols: manifest.symbols || {},
  };
  return meridianManifest.symbols;
}

async function meridianYahooQuote(ticker, symbol) {
  const cached = meridianQuoteCache.get(ticker);
  if (cached && Date.now() - cached.at < MERIDIAN_QUOTE_TTL_MS) {
    return cached.quote;
  }

  const endpoint =
    "https://query1.finance.yahoo.com/v8/finance/chart/" +
    `${encodeURIComponent(symbol)}?interval=1d&range=1d&includePrePost=false`;
  const response = await fetch(endpoint, {
    headers: { "User-Agent": MERIDIAN_UA, Accept: "application/json" },
    cf: { cacheTtl: 8, cacheEverything: true },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`Yahoo ${response.status}`);

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  if (!result) {
    throw new Error(
      payload?.chart?.error?.description || "Yahoo no devolvió datos",
    );
  }

  const meta = result.meta || {};
  const closes = result.indicators?.quote?.[0]?.close || [];
  let price = meridianPositive(meta.regularMarketPrice);
  if (price === null) {
    for (let index = closes.length - 1; index >= 0; index -= 1) {
      price = meridianPositive(closes[index]);
      if (price !== null) break;
    }
  }
  if (price === null) throw new Error("Sin precio válido");

  let previous = meridianPositive(meta.chartPreviousClose);
  if (previous !== null && !(previous / price >= 0.1 && previous / price <= 10)) {
    previous = null;
  }
  if (previous === null) {
    const candidate = meridianPositive(meta.previousClose);
    if (candidate !== null && candidate / price >= 0.1 && candidate / price <= 10) {
      previous = candidate;
    }
  }
  if (previous === null) previous = price;

  const change = price - previous;
  const quoteTime = Number(meta.regularMarketTime);
  const quote = {
    ticker,
    symbol: meta.symbol || symbol,
    price,
    change,
    changePct: previous ? change / previous : 0,
    changePp: change,
    previousClose: previous,
    open: meridianPositive(meta.regularMarketOpen),
    dayHigh: meridianPositive(meta.regularMarketDayHigh),
    dayLow: meridianPositive(meta.regularMarketDayLow),
    volume: Number.isFinite(Number(meta.regularMarketVolume))
      ? Number(meta.regularMarketVolume)
      : null,
    currency: meta.currency || "USD",
    exchange: meta.fullExchangeName || meta.exchangeName || "",
    asOf: Number.isFinite(quoteTime)
      ? new Date(quoteTime * 1000).toISOString()
      : new Date().toISOString(),
    marketState: meridianMarketState(meta, ticker),
    isYield: MERIDIAN_BONDS.has(ticker),
    source: "Yahoo Finance",
    delay: "Cotización con retraso (habitualmente 15-20 minutos).",
    dataMode: "live",
  };

  meridianQuoteCache.set(ticker, { at: Date.now(), quote });
  return quote;
}

async function meridianMapLimit(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await task(items[index], index);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

async function handleMeridianoQuotes(request, env, url) {
  if (request.method !== "GET") return fail(405, "Método no permitido");

  const tickers = [
    ...new Set(
      (url.searchParams.get("tickers") || "")
        .split(",")
        .map((ticker) => ticker.trim().toUpperCase())
        .filter(Boolean),
    ),
  ].slice(0, 30);

  if (!tickers.length) {
    return json({
      fetchedAt: new Date().toISOString(),
      quotes: {},
      errors: {},
      requested: 0,
      count: 0,
    });
  }

  let symbols;
  try {
    symbols = await meridianSymbols(env, url);
  } catch (error) {
    console.error("[meridiano] No se pudo leer el manifiesto:", error);
    return fail(503, "Meridiano no tiene el manifiesto de símbolos disponible.");
  }

  const quotes = {};
  const errors = {};
  await meridianMapLimit(tickers, 6, async (ticker) => {
    const symbol = symbols[ticker];
    if (!symbol) {
      errors[ticker] = "Ticker desconocido";
      return;
    }
    try {
      quotes[ticker] = await meridianYahooQuote(ticker, symbol);
    } catch (error) {
      errors[ticker] = error?.message || "Sin datos";
    }
  });

  return json({
    fetchedAt: new Date().toISOString(),
    quotes,
    errors,
    requested: tickers.length,
    count: Object.keys(quotes).length,
    source: "Yahoo Finance",
    delay:
      "Cotizaciones con retraso (habitualmente 15-20 minutos; " +
      "Yahoo Finance no garantiza tiempo real).",
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env, url);
      }
      if (url.pathname.startsWith("/uploads/")) {
        return await serveUpload(url, env, request);
      }
      if (url.pathname === "/investing/api/health") {
        return json({
          status: "ok",
          service: "meridiano-quotes",
          mode: "hybrid",
          time: new Date().toISOString(),
        });
      }
      if (url.pathname === "/investing/api/quotes") {
        return await handleMeridianoQuotes(request, env, url);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.status, error.message);
      }
      console.error("[worker] Error no controlado:", error);
      return fail(500, "Error interno del servidor");
    }
  },
};
