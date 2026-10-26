import { useEffect, useState } from "react";
import { SiteProvider, useSite } from "./lib/site";
import { LangProvider } from "./lib/LangProvider";
import { EditorProvider } from "./edit/EditorProvider";
import { useLang } from "./lib/lang";
import { useReveal } from "./hooks/useReveal";
import { useSectionSnap } from "./hooks/useSectionSnap";
import { Preloader } from "./components/Preloader";
import { CustomCursor } from "./components/CustomCursor";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Work } from "./components/Work";
import { About } from "./components/About";
import { Stack } from "./components/Stack";
import { Journey } from "./components/Journey";
import { Contact } from "./components/Contact";
import { SectionNav, type SectionNavItem } from "./components/SectionNav";

function Site() {
  const { data, editing } = useSite();
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const { active, goTo } = useSectionSnap(editing);
  useReveal();

  useEffect(() => {
    document.documentElement.dataset.energy = data.settings.energy;
  }, [data.settings.energy]);

  /*
   * Enlaces del tipo /?go=work abren la web directamente en esa sección.
   * Se usa desde el panel para revisar lo que acabas de editar.
   */
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("go");
    if (!target) return;
    const ids = ["top", "work", "about", "stack", "journey", "contact"];
    const index = ids.indexOf(target);
    if (index < 0) return;
    const timer = window.setTimeout(() => {
      window.history.replaceState({}, "", window.location.pathname);
      goTo(index);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [goTo]);

  useEffect(() => {
    if (!data.settings.preloader) setReady(true);
  }, [data.settings.preloader]);

  const navItems: SectionNavItem[] = [
    { id: "top", label: t.nav.home, index: "00" },
    { id: "work", label: t.nav.work, index: "01" },
    { id: "about", label: t.nav.about, index: "02" },
    { id: "stack", label: t.nav.stack, index: "03" },
    { id: "journey", label: t.nav.journey, index: "04" },
    { id: "contact", label: t.nav.contact, index: "05" },
  ];

  return (
    <>
      <Preloader
        enabled={data.settings.preloader && !editing}
        onDone={() => setReady(true)}
      />
      {!editing && <CustomCursor />}
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <a className="skip" href="#main">
        {t.nav.home === "Inicio" ? "Saltar al contenido" : "Skip to content"}
      </a>

      <Header />
      <SectionNav items={navItems} active={active} onGo={goTo} />

      <main id="main" tabIndex={-1}>
        <Hero ready={ready} />
        <Work />
        <About />
        <Stack />
        <Journey />
        <Contact />
      </main>
    </>
  );
}

export function App() {
  return (
    <SiteProvider>
      <LangProvider>
        <EditorProvider>
          <Site />
        </EditorProvider>
      </LangProvider>
    </SiteProvider>
  );
}
