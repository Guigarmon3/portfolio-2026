import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "server", "data");
const credentialsFile = path.join(dataDir, "credentials.json");

const password = process.env.ADMIN_PASSWORD;
const force = process.argv.includes("--force");

if (!password) {
  console.error(
    [
      "Falta ADMIN_PASSWORD.",
      "",
      "PowerShell:",
      '  $env:ADMIN_PASSWORD="tu-contraseña"; npm run auth:setup',
      "",
      "Si quieres conservar el topic de ntfy actual, pásalo también:",
      '  $env:NTFY_TOPIC="gg-tu-topic"; npm run auth:setup -- --force',
    ].join("\n"),
  );
  process.exit(1);
}

if (fs.existsSync(credentialsFile) && !force) {
  console.error(
    "Ya existe server/data/credentials.json. Usa `npm run auth:setup -- --force` para reemplazarlo.",
  );
  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;
const keylen = 64;
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, keylen, {
  N,
  r,
  p,
  maxmem: 64 * 1024 * 1024,
});

let topic = process.env.NTFY_TOPIC;
if (!topic) {
  topic = `gg-${crypto.randomBytes(24).toString("base64url")}`;
}

const payload = {
  password: {
    algo: "scrypt",
    N,
    r,
    p,
    keylen,
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
  },
  ntfy: {
    server: process.env.NTFY_SERVER || "https://ntfy.sh",
    topic,
  },
};

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(credentialsFile, JSON.stringify(payload, null, 2), {
  mode: 0o600,
});

console.log("Credenciales creadas en server/data/credentials.json");
console.log(`Topic de ntfy: ${topic}`);
console.log(
  "Suscríbete a ese topic desde la app de ntfy. No lo compartas: quien lo tenga puede ver los códigos.",
);
