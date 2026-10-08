import { useEffect, useMemo, useState, type ReactNode } from "react";
import { buildCopy, type Lang } from "../data/content";
import { detectLang, LangContext, type LangContextValue } from "./lang";
import { useSite } from "./site";

export function LangProvider({ children }: { children: ReactNode }) {
  const { data } = useSite();
  const [lang, setLang] = useState<Lang>(() =>
    detectLang(data.settings.defaultLang),
  );

  const t = useMemo(() => buildCopy(data, lang), [data, lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    const setMeta = (selector: string, value: string) => {
      const node = document.querySelector(selector);
      if (node) node.setAttribute("content", value);
    };
    setMeta('meta[name="description"]', t.meta.description);
    setMeta('meta[property="og:title"]', t.meta.title);
    setMeta('meta[property="og:description"]', t.meta.description);
    setMeta('meta[name="twitter:title"]', t.meta.title);
    setMeta('meta[name="twitter:description"]', t.meta.description);
    try {
      localStorage.setItem("gg-lang", lang);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [lang, t.meta.title, t.meta.description]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t }),
    [lang, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
