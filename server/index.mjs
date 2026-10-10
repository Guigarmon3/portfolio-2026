import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, "data");
const contentFile = path.join(dataDir, "content.json");
const backupFile = path.join(dataDir, "content.backup.json");
const credentialsFile = path.join(dataDir, "credentials.json");
const uploadDir = path.join(__dirname, "uploads");
const distDir = path.join(root, "dist");
const distIndex = path.join(distDir, "index.html");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const SESSION_MS = 12 * 60 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const CODE_TTL_MS = 5 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;
const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";
const scryptAsync = promisify(crypto.scrypt);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "1" ? 1 : false);
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "same-origin");
  if (req.path.startsWith("/api")) res.set("Cache-Control", "no-store");
  next();
});

/** @type {Map<string, number>} */
const sessions = new Map();
/** @type {Map<string, number[]>} */
const loginAttempts = new Map();
/**
 * Retos de segundo factor: token -> { hash, expires, attempts }
 * @type {Map<string, { hash: Buffer, expires: number, attempts: number }>}
 */
const challenges = new Map();

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const index = part.indexOf("=");
      if (index < 0) return [part.trim(), ""];
      return [
        part.slice(0, index).trim(),
        decodeURIComponent(part.slice(index + 1).trim()),
      ];
    }),
  );
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sessionToken(req) {
  const token = parseCookies(req).gg_session;
  if (!token) return null;
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return token;
}

function requireAuth(req, res, next) {
  if (!sessionToken(req)) {
    return res.status(401).json({ error: "Sesión caducada. Vuelve a entrar." });
  }
  return next();
}

function registerLoginAttempt(ip) {
  const now = Date.now();
  const list = (loginAttempts.get(ip) || []).filter(
    (time) => now - time < LOGIN_WINDOW_MS,
  );
  list.push(now);
  loginAttempts.set(ip, list);
  return list.length;
}

function tooManyLoginAttempts(ip) {
  const now = Date.now();
  const list = (loginAttempts.get(ip) || []).filter(
    (time) => now - time < LOGIN_WINDOW_MS,
  );
  loginAttempts.set(ip, list);
  return list.length >= LOGIN_MAX_ATTEMPTS;
}

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

async function readStored() {
  try {
    const raw = await fs.readFile(contentFile, "utf8");
    const payload = JSON.parse(raw);
    if (payload && validContent(payload.content)) return payload;
    return { content: null, updatedAt: null };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("[api] No se pudo leer content.json:", error.message);
    }
    return { content: null, updatedAt: null };
  }
}

async function writeStored(content) {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.copyFile(contentFile, backupFile);
  } catch {
    /* Todavía no hay contenido previo. */
  }
  const payload = {
    content,
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${contentFile}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tmp, contentFile);
  return payload;
}

async function loadCredentials() {
  try {
    const raw = await fs.readFile(credentialsFile, "utf8");
    const parsed = JSON.parse(raw);
    if (
      !parsed?.password?.hash ||
      !parsed?.password?.salt ||
      !parsed?.ntfy?.topic
    ) {
      throw new Error("El archivo de credenciales está incompleto.");
    }
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Falta server/data/credentials.json. Ejecuta `npm run auth:setup` con ADMIN_PASSWORD definida.",
      );
    }
    throw error;
  }
}

const credentials = await loadCredentials();

async function verifyPassword(password) {
  const config = credentials.password;
  const salt = Buffer.from(config.salt, "hex");
  const expected = Buffer.from(config.hash, "hex");
  const derived = await scryptAsync(
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
  return (
    derived.length === expected.length &&
    crypto.timingSafeEqual(derived, expected)
  );
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest();
}

function createChallenge() {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const token = crypto.randomBytes(24).toString("hex");
  challenges.set(token, {
    hash: hashCode(code),
    expires: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });
  return { code, token };
}

function checkChallenge(token, code) {
  const challenge = challenges.get(token);
  if (!challenge) return { ok: false, reason: "expired" };
  if (challenge.expires < Date.now()) {
    challenges.delete(token);
    return { ok: false, reason: "expired" };
  }

  challenge.attempts += 1;
  const expected = challenge.hash;
  const received = hashCode(code);
  const matches =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!matches) {
    const left = CODE_MAX_ATTEMPTS - challenge.attempts;
    if (left <= 0) {
      challenges.delete(token);
      return { ok: false, reason: "blocked" };
    }
    return { ok: false, reason: "wrong", attemptsLeft: left };
  }

  challenges.delete(token);
  return { ok: true };
}

async function sendCodeByNtfy(code) {
  const { server, topic } = credentials.ntfy;
  const base = String(server || "https://ntfy.sh").replace(/\/+$/, "");
  const siteUrl = String(process.env.SITE_URL || "").replace(/\/+$/, "");
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    Title: "Acceso al portfolio",
    Tags: "lock,key",
    Priority: "high",
  };
  if (siteUrl) headers.Click = `${siteUrl}/?edit=1`;
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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "portfolio-api", time: new Date().toISOString() });
});

app.get("/api/content", async (_req, res) => {
  const payload = await readStored();
  res.set("Cache-Control", "no-store");
  res.json(payload);
});

app.put("/api/content", requireAuth, async (req, res) => {
  const content = req.body?.content;
  if (!validContent(content)) {
    return res.status(400).json({
      error:
        "El contenido no tiene el formato esperado (version 1, profile, sections, projects, experience, education, stack, settings).",
    });
  }
  try {
    const payload = await writeStored(content);
    res.json(payload);
  } catch (error) {
    console.error("[api] Error guardando contenido:", error);
    res.status(500).json({ error: "No se pudo guardar el contenido" });
  }
});

/* --------------------------------------------------------------------------
   Autenticación: contraseña + código por ntfy
   -------------------------------------------------------------------------- */

app.post("/api/auth/login", async (req, res) => {
  const ip = req.ip || "local";
  if (tooManyLoginAttempts(ip)) {
    return res.status(429).json({
      error: "Demasiados intentos. Espera unos minutos antes de volver a probar.",
    });
  }

  const password = req.body?.password;
  if (typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Falta la contraseña" });
  }

  let valid = false;
  try {
    valid = await verifyPassword(password);
  } catch (error) {
    console.error("[auth] Error comprobando la contraseña:", error);
    return res.status(500).json({ error: "No se pudo comprobar la contraseña" });
  }

  if (!valid) {
    registerLoginAttempt(ip);
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  const { code, token } = createChallenge();
  let sent = false;
  try {
    await sendCodeByNtfy(code);
    sent = true;
  } catch (error) {
    console.error("[auth] No se pudo enviar el código por ntfy:", error.message);
    if (!AUTH_DEBUG) {
      challenges.delete(token);
      return res.status(502).json({
        error:
          "La contraseña es correcta, pero no se pudo enviar el código a ntfy. Revisa la conexión o el topic.",
      });
    }
  }

  if (AUTH_DEBUG) {
    console.log(`[auth] Código de acceso (debug): ${code}`);
  }

  res.json({
    challenge: token,
    sent,
    expiresIn: Math.round(CODE_TTL_MS / 1000),
    ...(AUTH_DEBUG ? { debugCode: code } : {}),
  });
});

app.post("/api/auth/verify", (req, res) => {
  const challenge = req.body?.challenge;
  const code = req.body?.code;
  if (typeof challenge !== "string" || typeof code !== "string") {
    return res.status(400).json({ error: "Faltan datos para verificar el código" });
  }

  const result = checkChallenge(challenge, code);
  if (!result.ok) {
    if (result.reason === "blocked") {
      return res.status(429).json({
        error: "Demasiados códigos incorrectos. Vuelve a empezar el acceso.",
      });
    }
    if (result.reason === "expired") {
      return res.status(401).json({
        error: "El código ha caducado. Vuelve a introducir la contraseña.",
      });
    }
    return res.status(401).json({
      error: `Código incorrecto. Te quedan ${result.attemptsLeft} intentos.`,
    });
  }

  loginAttempts.delete(req.ip || "local");
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  res.cookie("gg_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ authenticated: true });
});

app.post("/api/auth/logout", (req, res) => {
  const token = parseCookies(req).gg_session;
  if (token) sessions.delete(token);
  res.clearCookie("gg_session", { path: "/" });
  res.json({ authenticated: false });
});

app.get("/api/auth/me", (req, res) => {
  const token = sessionToken(req);
  res.json({
    authenticated: Boolean(token),
    expiresAt: token ? new Date(sessions.get(token)).toISOString() : null,
  });
});

/* --------------------------------------------------------------------------
   Subida de imágenes
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

  const head = buffer.subarray(0, 6).toString("ascii");
  if (head === "GIF87a" || head === "GIF89a") {
    return { ext: "gif", mime: "image/gif" };
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  const brand = buffer.subarray(4, 12).toString("ascii");
  if (brand.startsWith("ftypavif") || brand.startsWith("ftypavis")) {
    return { ext: "avif", mime: "image/avif" };
  }

  return null;
}

app.post(
  "/api/upload",
  requireAuth,
  express.raw({
    type: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "application/octet-stream",
    ],
    limit: "12mb",
  }),
  async (req, res) => {
    const buffer = Buffer.isBuffer(req.body) ? req.body : null;
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    const kind = detectImage(buffer);
    if (!kind) {
      return res.status(415).json({
        error: "Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.",
      });
    }

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now().toString(36)}-${crypto
        .randomBytes(8)
        .toString("hex")}.${kind.ext}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      res.status(201).json({
        url: `/uploads/${filename}`,
        bytes: buffer.length,
        type: kind.mime,
      });
    } catch (error) {
      console.error("[upload] Error guardando la imagen:", error);
      res.status(500).json({ error: "No se pudo guardar la imagen" });
    }
  },
);

/* --------------------------------------------------------------------------
   Estáticos
   -------------------------------------------------------------------------- */

await fs.mkdir(uploadDir, { recursive: true });
app.use(
  "/uploads",
  express.static(uploadDir, {
    index: false,
    dotfiles: "deny",
    maxAge: "30d",
    immutable: true,
  }),
);
app.use("/uploads", (_req, res) => {
  res.status(404).json({ error: "Imagen no encontrada" });
});

try {
  await fs.access(distIndex);
  app.use(express.static(distDir, { index: false, maxAge: "1h" }));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    if (!req.accepts("html")) return next();
    res.sendFile(distIndex);
  });
} catch {
  app.get("/", (_req, res) => {
    res
      .status(200)
      .type("text/plain")
      .send(
        "API del portfolio en marcha. Arranca Vite con `npm run dev` o genera la web con `npm run build`.",
      );
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      error: "El archivo supera el límite permitido (12 MB para imágenes).",
    });
  }
  console.error("[api] Error no controlado:", error);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, HOST, () => {
  console.log(`[api] http://${HOST}:${PORT}`);
  console.log("[api] Contraseña protegida con scrypt (sin texto plano).");
  console.log(
    "[api] 2FA activo por ntfy. Topic guardado en server/data/credentials.json.",
  );
  if (AUTH_DEBUG) {
    console.log(
      "[api] AUTH_DEBUG activo: los códigos se muestran en esta consola.",
    );
  }
});
