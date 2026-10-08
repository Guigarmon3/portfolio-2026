import { createContext, useContext } from "react";
import type { Copy, Lang } from "../data/content";

export interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
}

export const LangContext = createContext<LangContextValue | null>(null);

export function detectLang(fallback: Lang = "es"): Lang {
  try {
    const saved = localStorage.getItem("gg-lang");
    if (saved === "es" || saved === "en") return saved;
  } catch {
    /* almacenamiento no disponible */
  }
  if (typeof navigator !== "undefined") {
    return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
  }
  return fallback;
}

export function useLang(): LangContextValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang debe usarse dentro de LangProvider");
  return value;
}
