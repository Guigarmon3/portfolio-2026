import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: false,
      },
      "/uploads": {
        target: "http://127.0.0.1:8787",
        changeOrigin: false,
      },
    },
  },
  build: {
    /*
     * Navegadores objetivo: Chrome/Edge 84, Firefox 78 ESR y Safari 13.1.
     * Es el suelo razonable para un Linux Mint antiguo con navegador
     * actualizado, sin renunciar a módulos nativos ni a ResizeObserver.
     */
    target: ["chrome84", "firefox78", "safari13.1", "edge84"],
    cssTarget: ["chrome84", "firefox78", "safari13.1", "edge84"],
  },
});
