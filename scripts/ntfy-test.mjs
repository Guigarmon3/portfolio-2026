import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsFile = path.resolve(
  __dirname,
  "..",
  "server",
  "data",
  "credentials.json",
);

if (!fs.existsSync(credentialsFile)) {
  console.error(
    "No existe server/data/credentials.json. Créalo primero con `npm run auth:setup`.",
  );
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsFile, "utf8"));
const server = String(credentials.ntfy?.server || "https://ntfy.sh").replace(
  /\/+$/,
  "",
);
const topic = credentials.ntfy?.topic;

if (!topic) {
  console.error("El archivo de credenciales no tiene un topic de ntfy.");
  process.exit(1);
}

const response = await fetch(`${server}/${encodeURIComponent(topic)}`, {
  method: "POST",
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    Title: "Prueba de ntfy",
    Tags: "white_check_mark",
    Priority: "high",
  },
  body: "Si ves esta notificación, el móvil está suscrito al topic del portfolio.",
});

if (!response.ok) {
  console.error(`ntfy respondió ${response.status}. Revisa el topic y la conexión.`);
  process.exit(1);
}

console.log("Notificación de prueba enviada. Debería llegar al móvil en unos segundos.");
