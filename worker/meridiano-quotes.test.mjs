import assert from "node:assert/strict";
import test from "node:test";

import {
  MERIDIAN_BONDS,
  MERIDIAN_CRYPTO,
  meridianMarketState,
  meridianPositive,
  parseMeridianChart,
} from "./meridiano-quotes.mjs";

const NOW = Date.UTC(2026, 10, 13, 15, 0, 0); // 13 nov 2026, 15:00 UTC
const QUOTE_TIME = Math.floor(Date.UTC(2026, 10, 13, 14, 55, 0) / 1000);

function chart(overrides = {}) {
  return {
    chart: {
      result: [
        {
          meta: {
            symbol: "AAPL",
            currency: "USD",
            fullExchangeName: "NasdaqGS",
            regularMarketPrice: 100,
            chartPreviousClose: 98,
            regularMarketTime: QUOTE_TIME,
            regularMarketOpen: 99,
            regularMarketDayHigh: 101,
            regularMarketDayLow: 97,
            regularMarketVolume: 123456,
            currentTradingPeriod: {
              regular: {
                start: Math.floor(Date.UTC(2026, 10, 13, 14, 30, 0) / 1000),
                end: Math.floor(Date.UTC(2026, 10, 13, 21, 0, 0) / 1000),
              },
            },
            ...overrides,
          },
          indicators: { quote: [{ close: [97, 98, 99, 100] }] },
        },
      ],
      error: null,
    },
  };
}

test("parsea una cotización normal y calcula la variación", () => {
  const quote = parseMeridianChart(chart(), "AAPL", "AAPL", NOW);
  assert.equal(quote.ticker, "AAPL");
  assert.equal(quote.price, 100);
  assert.equal(quote.previousClose, 98);
  assert.equal(quote.change, 2);
  assert.ok(Math.abs(quote.changePct - 2 / 98) < 1e-12);
  assert.equal(quote.currency, "USD");
  assert.equal(quote.exchange, "NasdaqGS");
  assert.equal(quote.marketState, "open");
  assert.equal(quote.isYield, false);
  assert.equal(quote.source, "Yahoo Finance");
  assert.equal(quote.dataMode, "live");
  assert.equal(quote.asOf, new Date(QUOTE_TIME * 1000).toISOString());
});

test("usa el último cierre válido si falta el precio de mercado", () => {
  const quote = parseMeridianChart(
    chart({ regularMarketPrice: null, chartPreviousClose: null, previousClose: null }),
    "AAPL",
    "AAPL",
    NOW,
  );
  assert.equal(quote.price, 100);
  assert.equal(quote.previousClose, 100);
  assert.equal(quote.change, 0);
  assert.equal(quote.changePct, 0);
});

test("descarta un previousClose fuera de rango y usa el candidato válido", () => {
  const quote = parseMeridianChart(
    chart({ chartPreviousClose: 1, previousClose: 95 }),
    "AAPL",
    "AAPL",
    NOW,
  );
  assert.equal(quote.price, 100);
  assert.equal(quote.previousClose, 95);
  assert.equal(quote.change, 5);
});

test("si todos los cierres anteriores son inválidos, la variación es cero", () => {
  const quote = parseMeridianChart(
    chart({ chartPreviousClose: -5, previousClose: 0 }),
    "AAPL",
    "AAPL",
    NOW,
  );
  assert.equal(quote.previousClose, 100);
  assert.equal(quote.change, 0);
});

test("marca los bonos como rendimiento", () => {
  assert.equal(MERIDIAN_BONDS.has("US10Y"), true);
  const quote = parseMeridianChart(chart(), "US10Y", "^TNX", NOW);
  assert.equal(quote.isYield, true);
});

test("la cripto siempre se considera mercado abierto", () => {
  assert.equal(MERIDIAN_CRYPTO.has("BTC"), true);
  const quote = parseMeridianChart(
    chart({ currentTradingPeriod: {} }),
    "BTC",
    "BTC-USD",
    NOW,
  );
  assert.equal(quote.marketState, "open");
});

test("calcula pre, open, closed y unknown", () => {
  const period = {
    currentTradingPeriod: {
      regular: { start: 1000, end: 2000 },
    },
  };
  assert.equal(meridianMarketState(period, "AAPL", 500 * 1000), "pre");
  assert.equal(meridianMarketState(period, "AAPL", 1500 * 1000), "open");
  assert.equal(meridianMarketState(period, "AAPL", 2500 * 1000), "closed");
  assert.equal(meridianMarketState({}, "AAPL", NOW), "unknown");
  assert.equal(meridianMarketState({}, "BTC", NOW), "open");
});

test("meridianPositive solo acepta números positivos finitos", () => {
  assert.equal(meridianPositive(12.5), 12.5);
  assert.equal(meridianPositive("12.5"), 12.5);
  assert.equal(meridianPositive(0), null);
  assert.equal(meridianPositive(-1), null);
  assert.equal(meridianPositive("no"), null);
  assert.equal(meridianPositive(null), null);
});

test("propaga el error descriptivo de Yahoo si no hay resultado", () => {
  assert.throws(
    () => parseMeridianChart({ chart: { result: [], error: { description: "No data found" } } }, "AAPL", "AAPL", NOW),
    /No data found/,
  );
  assert.throws(
    () => parseMeridianChart({ chart: { result: [] } }, "AAPL", "AAPL", NOW),
    /Yahoo no devolvió datos/,
  );
});

test("usa la hora de consulta si Yahoo no envía regularMarketTime", () => {
  const quote = parseMeridianChart(
    chart({ regularMarketTime: null }),
    "AAPL",
    "AAPL",
    NOW,
  );
  assert.equal(quote.asOf, new Date(NOW).toISOString());
});
