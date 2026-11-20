import { useEffect, useState, type CSSProperties } from "react";
import {
  sideRailCopy,
  sideRailLabels,
  sideRailStatus,
} from "../data/sideRail";
import { useLang } from "../lib/lang";
import { hexToRgbChannels } from "../lib/color";
import { safeImageUrl, safeUrl, useSite } from "../lib/site";
import { formatMadridTime } from "../lib/time";
import type { SectionNavItem } from "./SectionNav";

/*
 * Los acentos viven en global.css por sección. El rail está fuera de ellas,
 * así que repetimos aquí los mismos valores para poder heredarlos.
 */
const ACCENTS: Record<string, { color: string; rgb: string }> = {
  top: { color: "#e6c36a", rgb: "230, 195, 106" },
  work: { color: "#ff8a75", rgb: "255, 138, 117" },
  about: { color: "#82c7ff", rgb: "130, 199, 255" },
  stack: { color: "#f3a6d4", rgb: "243, 166, 212" },
  journey: { color: "#a9be8c", rgb: "169, 190, 140" },
  contact: { color: "#e6c36a", rgb: "230, 195, 106" },
};

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

interface Props {
  items: SectionNavItem[];
  active: number;
}

/**
 * Rail fijo del margen izquierdo. Solo se muestra en pantallas anchas:
 * a partir de 1920px enseña el bloque completo; entre 1440 y 1919px queda
 * reducido a una espina con el capítulo y el progreso.
 */
export function SideRail({ items, active }: Props) {
  const { lang } = useLang();
  const { data, editing } = useSite();
  const time = useLocalTime();

  if (editing || items.length === 0) return null;

  const current = items[active] ?? items[0];
  const copy = sideRailCopy[current.id] ?? sideRailCopy.top;
  const accent = ACCENTS[current.id] ?? ACCENTS.top;
  const labels = sideRailLabels[lang];

  const projects = data.projects.filter((project) => project.visible).slice(0, 4);
  const isWork = current.id === "work";

  const openProject = (id: string) => {
    window.dispatchEvent(new CustomEvent("gg:open-project", { detail: id }));
  };

  return (
    <aside
      className="side-rail"
      aria-label={
        lang === "es" ? "Contexto de la sección" : "Section context"
      }
      style={
        {
          "--rail-accent": accent.color,
          "--rail-accent-rgb": accent.rgb,
        } as CSSProperties
      }
    >
      <div className="side-rail__head">
        <span className="side-rail__mark">{data.profile.mark || "GG"}</span>
        <span className="side-rail__tag">PORTFOLIO / 2026</span>
      </div>

      <div className="side-rail__chapter" key={current.id}>
        <span className="side-rail__index">{current.index}</span>
        <span className="side-rail__label">{current.label}</span>
        <p className="side-rail__note">{copy.note[lang]}</p>
        <p className="side-rail__quote">{copy.quote[lang]}</p>

        {isWork ? (
          <div className="side-rail__film">
            <div className="side-rail__film-grid">
              {projects.map((project, index) => {
                const thumb = safeImageUrl(project.image);
                return (
                  <button
                    key={project.id}
                    type="button"
                    className={`side-rail__film-item${thumb ? "" : " is-empty"}`}
                    style={
                      {
                        "--film-accent": project.accent || "#e6c36a",
                        "--film-accent-rgb": hexToRgbChannels(project.accent),
                      } as CSSProperties
                    }
                    onClick={() => openProject(project.id)}
                    aria-label={`${
                      lang === "es" ? "Abrir proyecto" : "Open project"
                    }: ${project.title}`}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="side-rail__film-fallback" aria-hidden="true">
                        <span className="side-rail__film-fallback-name">
                          {project.title}
                        </span>
                      </span>
                    )}
                    <span className="side-rail__film-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="side-rail__film-label">
              <span>{String(projects.length).padStart(2, "0")}</span>{" "}
              {labels.projects}
            </p>
          </div>
        ) : null}
      </div>

      <div className="side-rail__progress" aria-hidden="true">
        <span className="side-rail__track">
          {items.map((item, index) => (
            <span
              key={item.id}
              className={`side-rail__tick${
                index === active ? " is-active" : ""
              }${index < active ? " is-past" : ""}`}
              style={{
                top: `${
                  items.length > 1 ? (index / (items.length - 1)) * 100 : 0
                }%`,
              }}
            />
          ))}
        </span>
        <span className="side-rail__count">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      <div className="side-rail__foot">
        <p className="side-rail__status">
          <span className="side-rail__status-dot" aria-hidden="true" />
          {sideRailStatus[lang]}
        </p>
        <p className="side-rail__place">
          <span>VALENCIA</span>
          <span>39.47°N / 0.38°W</span>
        </p>
        <p className="side-rail__time">
          <span>{labels.time}</span>
          <span>{time || "—"} CET</span>
        </p>

        <ul className="side-rail__socials">
          {data.profile.socials.slice(0, 3).map((social) => (
            <li key={social.url}>
              <a
                href={safeUrl(social.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
          {data.profile.email ? (
            <li>
              <a href={`mailto:${data.profile.email}`}>
                EMAIL
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </aside>
  );
}
