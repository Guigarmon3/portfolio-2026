/* Parser puro de las cotizaciones de Meridiano.
   Vive fuera de index.mjs para poder probarlo sin red ni Workers. */

export const MERIDIAN_BONDS = new Set([
  "US10Y", "US2Y", "US30Y", "US5Y", "DE10Y", "ES10Y", "IT10Y", "FR10Y",
  "TBILL3M",
]);

export const MERIDIAN_CRYPTO = new Set([
  "BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "AVAX", "LINK",
]);

export function meridianPositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function meridianMarketState(meta, ticker, nowMs = Date.now()) {
  if (MERIDIAN_CRYPTO.has(ticker)) return "open";
  const period = meta?.currentTradingPeriod?.regular || {};
  const start = Number(period.start);
  const end = Number(period.end);
  const now = nowMs / 1000;
  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    if (now < start) return "pre";
    if (now <= end) return "open";
    return "closed";
  }
  return "unknown";
}

export function parseMeridianChart(payload, ticker, symbol, nowMs = Date.now()) {
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
  const quoteTime = meridianPositive(meta.regularMarketTime);
  return {
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
      : new Date(nowMs).toISOString(),
    marketState: meridianMarketState(meta, ticker, nowMs),
    isYield: MERIDIAN_BONDS.has(ticker),
    source: "Yahoo Finance",
    delay: "Cotización con retraso (habitualmente 15-20 minutos).",
    dataMode: "live",
  };
}
