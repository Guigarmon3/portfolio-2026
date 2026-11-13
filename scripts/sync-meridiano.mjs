/* Copia el frontend de Meridiano dentro del build del portfolio.

   Meridiano vive en un proyecto hermano (../meridiano/web). Este script lo
   publica en dist/investing y adapta el HTML para que funcione bajo un
   subpath: base href, modo estático y endpoint de cotizaciones del Worker. */

import { cp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(
  process.env.MERIDIAN_WEB || path.join(root, "..", "meridiano", "web"),
);
const dest = path.join(root, "dist", "investing");

if (!existsSync(path.join(source, "index.html"))) {
  throw new Error(
    `No encuentro Meridiano en ${source}. Define MERIDIAN_WEB con la ruta a su carpeta web.`,
  );
}
if (!existsSync(path.join(source, "data", "live", "manifest.json"))) {
  throw new Error(
    `Meridiano no tiene el snapshot live en ${source}. Genera data/live antes de publicar.`,
  );
}

await cp(source, dest, { recursive: true });

const indexPath = path.join(dest, "index.html");
let html = await readFile(indexPath, "utf8");

if (!html.includes('<base href="/investing/">')) {
  html = html.replace(
    '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n  <base href="/investing/">',
  );
}

if (!html.includes("MERIDIAN_CONFIG")) {
  html = html.replace(
    '<script type="module"',
    '<script>window.MERIDIAN_CONFIG = { static: true, quotesUrl: "api/quotes" };</script>\n  <script type="module"',
  );
}

if (!html.includes('rel="canonical"')) {
  html = html.replace(
    '<meta property="og:type" content="website">',
    '<meta property="og:type" content="website">\n' +
      '  <meta property="og:url" content="https://guigarmon3.online/investing/">\n' +
      '  <link rel="canonical" href="https://guigarmon3.online/investing/">',
  );
}

await writeFile(indexPath, html, "utf8");
console.log(
  `[meridiano] Copiado a ${path.relative(root, dest)} (${html.length} bytes de HTML).`,
);
