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

console.log("");
console.log("  Datos para suscribirte desde el móvil");
console.log("  --------------------------------------");
console.log(`  Servidor: ${server}`);
console.log(`  Topic:    ${topic}`);
console.log("");
console.log(`  Página del topic: ${server}/${topic}`);
console.log(`  Enlace para la app: ntfy://${server.replace(/^https?:\/\//, "")}/${topic}`);
console.log("");
console.log("  Pasos:");
console.log("  1. Instala la app ntfy (Android / iOS).");
console.log('  2. Pulsa "+" y elige suscribirte a un topic.');
console.log(`  3. Servidor: ${server}`);
console.log(`  4. Topic: ${topic}`);
console.log("  5. Confirma y envía una prueba con `npm run ntfy:test`.");
console.log("");
console.log("  No compartas el topic: quien lo tenga puede leer los códigos.");
console.log("");
