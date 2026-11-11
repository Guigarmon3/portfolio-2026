import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { useLang } from "../lib/lang";
import { useSite } from "../lib/site";
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
    const format = () =>
      new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Madrid",
      }).format(new Date());

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
  const root = useRef<HTMLElement>(null);
  const time = useLocalTime();

  useLayoutEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".hero__word");
      if (reduce) {
        gsap.set(words, { y: 0 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(words, { y: 0, duration: 1.05, stagger: 0.08 })
        .from(
          ".hero__kicker, .hero__tagline, .hero__actions, .hero__foot",
          { y: 18, opacity: 0, duration: 0.8, stagger: 0.06 },
          0.3,
        );
    }, root);
    return () => ctx.revert();
  }, [ready]);

  const go = (id: string) => {
    window.setTimeout(() => scrollToBlock(id), 10);
  };

  return (
    <section
      className="hero block"
      id="top"
      data-block
      ref={root}
      aria-labelledby="hero-title"
    >
      <div className="hero__object" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroObject />
        </Suspense>
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
              <span className="hero__word">{data.profile.firstName}</span>
            </span>
            <span className="hero__line hero__line--chrome">
              <span className="hero__word">{data.profile.lastName}</span>
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
