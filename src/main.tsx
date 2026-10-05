import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter-tight/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";

import "./styles/global.css";
import { App } from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No se encontró el nodo #root");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
