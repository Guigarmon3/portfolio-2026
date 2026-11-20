import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLang } from "../lib/lang";
import { useSite } from "../lib/site";
import { formatMadridTime } from "../lib/time";
import { scrollToBlock } from "../lib/scroll";
import { useEditor } from "../edit/EditorContext";
import { EditBar, EditButton } from "../edit/controls";
import { Marquee } from "./Marquee";
import { PixelStar } from "./Decor";

const HeroObject = lazy(() =>
  import("./HeroObject").then((module) => ({ default: module.HeroObject })),
);

function useLocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () => formatMadridTime();

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function Hero({ ready }: { ready: boolean }) {
  const { lang, t } = useLang();
  const { data } = useSite();
  const { open } = useEditor();
  const time = useLocalTime();
  const [showObject, setShowObject] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const root = useRef<HTMLElement>(null);

  /*
   * El degradado del apellido anima background-position (repintado continuo).
   * Cuando el hero sale de pantalla no hay motivo para mantenerlo activo.
   */
  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /*
   * Por debajo de 1180px el objeto 3D está oculto por CSS. No tiene sentido
   * descargar Three.js (545 kB) ni crear un contexto WebGL para nada.
   */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1181px)");
    const sync = () => setShowObject(query.matches);
    sync();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }
    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  const go = (id: string) => {
    window.setTimeout(() => scrollToBlock(id), 10);
  };

  return (
    <section
      className={`hero block${ready ? " is-ready" : ""}${
        onScreen ? "" : " is-offscreen"
      }`}
      id="top"
      data-block
      ref={root}
      aria-labelledby="hero-title"
    >
      <div className="hero__object" aria-hidden="true">
        {showObject ? (
          <Suspense fallback={null}>
            <HeroObject />
          </Suspense>
        ) : null}
      </div>

      <div className="shell hero__inner">
        <div className="hero__top">
          <p className="pixel-label">{t.hero.eyebrow}</p>
          <p className="mono">{t.hero.role}</p>
        </div>

        <EditBar label="Inicio">
          <EditButton
            label="Editar inicio"
            onClick={() => open({ kind: "hero" })}
          />
        </EditBar>

        <div className="hero__center">
          <p className="hero__kicker">
            <span className="status__dot" aria-hidden="true" />
            {t.hero.availability}
            <span className="hero__kicker-sep" aria-hidden="true">
              /
            </span>
            {t.hero.location}
          </p>

          <h1 className="hero__name" id="hero-title">
            <span className="hero__line">
              <span className="hero__word" style={{ transitionDelay: "0s" }}>
                {data.profile.firstName}
              </span>
            </span>
            <span className="hero__line hero__line--chrome">
              <span
                className="hero__word"
                style={{ transitionDelay: "0.08s" }}
              >
                {data.profile.lastName}
              </span>
              <PixelStar className="hero__star" />
            </span>
          </h1>

          <p className="hero__tagline">{t.hero.tagline}</p>

          <div className="hero__actions">
            <a
              className="btn btn--primary"
              href="#work"
              onClick={(event) => {
                event.preventDefault();
                go("work");
              }}
              data-cursor
              data-cursor-label={t.hero.ctaWork}
            >
              {t.hero.ctaWork}
              <span aria-hidden="true">↘</span>
            </a>
            <a
              className="btn btn--ghost"
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                go("contact");
              }}
              data-cursor
              data-cursor-label={t.hero.ctaContact}
            >
              {t.hero.ctaContact}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="hero__foot">
          <dl className="hero__meta">
            <div>
              <dt className="mono">{t.hero.timeLabel}</dt>
              <dd>{time || "—"}</dd>
            </div>
            <div>
              <dt className="mono">
                {lang === "es" ? "Ubicación" : "Location"}
              </dt>
              <dd>{t.hero.location}</dd>
            </div>
            <div className="hero__commute">
              <dt className="mono">
                {lang === "es" ? "Movilidad" : "Commute"}
              </dt>
              <dd>{t.hero.commuteNote}</dd>
            </div>
          </dl>

          <a
            className="hero__scroll"
            href="#work"
            onClick={(event) => {
              event.preventDefault();
              go("work");
            }}
            data-cursor
            data-cursor-label={t.hero.scroll}
          >
            <span>{t.hero.scroll}</span>
            <span className="hero__scroll-arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </div>

      {data.settings.marquee && (
        <div className="hero__marquee">
          <Marquee />
        </div>
      )}
    </section>
  );
}
