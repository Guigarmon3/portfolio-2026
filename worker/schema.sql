-- Contenido publicado del portfolio (una sola fila: id = 'site').
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Retos de segundo factor. Cada fila vive 5 minutos.
CREATE TABLE IF NOT EXISTS challenges (
  token TEXT PRIMARY KEY,
  hash TEXT NOT NULL,
  expires INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

-- Intentos de acceso para limitar la fuerza bruta por IP.
CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT NOT NULL,
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_ts
  ON login_attempts (ip, ts);
