import { useEffect, useState } from "react";
import { useLang } from "../lib/lang";
import { scrollToBlock } from "../lib/scroll";
import type { Lang } from "../data/content";

const LANGS: Lang[] = ["es", "en"];

export function Header() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", menuOpen);
    return () => document.documentElement.classList.remove("is-locked");
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToBlock(id), 10);
  };

  const navItems = [
    { id: "work", label: t.nav.work, index: "01" },
    { id: "about", label: t.nav.about, index: "02" },
    { id: "stack", label: t.nav.stack, index: "03" },
    { id: "journey", label: t.nav.journey, index: "04" },
    { id: "contact", label: t.nav.contact, index: "05" },
  ];

  const menuItems = [
    { id: "top", label: t.nav.home, index: "00" },
    ...navItems,
  ];

  return (
    <>
      <header className={`header${scrolled ? " is-scrolled" : ""}`}>
        <div className="header__inner">
          <a
            className="brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              go("top");
            }}
            aria-label={`${t.nav.home} — Guillermo García`}
          >
            <span className="brand__mark">GG</span>
            <span className="brand__name">Guillermo García</span>
            <span className="brand__version">v2.0</span>
          </a>

          <nav
            className="nav"
            aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                className="nav__link"
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  go(item.id);
                }}
              >
                <span className="nav__index">{item.index}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header__side">
            <span className="status">
              <span className="status__dot" aria-hidden="true" />
              {t.hero.availability}
            </span>

            <div className="lang" role="group" aria-label="Idioma / Language">
              {LANGS.map((code, index) => (
                <span key={code} style={{ display: "contents" }}>
                  {index > 0 && (
                    <span className="lang__sep" aria-hidden="true">
                      /
                    </span>
                  )}
                  <button
                    type="button"
                    className="lang__btn"
                    aria-pressed={lang === code}
                    onClick={() => setLang(code)}
                  >
                    {code.toUpperCase()}
                  </button>
                </span>
              ))}
            </div>

            <button
              type="button"
              className="burger"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.nav.close : t.nav.menu}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="menu__top">
          <span className="pixel-label">MENU / 2026</span>
          <span className="mono">{t.hero.location}</span>
        </div>

        <nav aria-label={lang === "es" ? "Navegación móvil" : "Mobile navigation"}>
          {menuItems.map((item) => (
            <a
              key={item.id}
              className="menu__link"
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                go(item.id);
              }}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span>{item.label}</span>
              <span className="menu__index">{item.index}</span>
            </a>
          ))}
        </nav>

        <div className="menu__foot">
          <p className="mono">{t.hero.commuteNote}</p>
          <p className="menu__status">
            <span className="status__dot" aria-hidden="true" />
            {t.hero.availability}
          </p>
        </div>
      </div>
    </>
  );
}
