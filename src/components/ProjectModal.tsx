import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../data/content";
import { useLang } from "../lib/lang";
import { safeImageUrl, safeUrl, useSite } from "../lib/site";
import { useEditor } from "../edit/EditorContext";
import { EditButton } from "../edit/controls";
import { PixelStar } from "./Decor";

interface Props {
  project: Project;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectModal({ project, onClose }: Props) {
  const { lang, t } = useLang();
  const { updateDraft } = useSite();
  const { editing, open, requestImage } = useEditor();
  const rootRef = useRef<HTMLDivElement>(null);
  const cover = safeImageUrl(project.image);

  const changeCover = () =>
    requestImage({
      title: "Portada del proyecto",
      value: project.image,
      onChange: (image) =>
        updateDraft((draft) => ({
          ...draft,
          projects: draft.projects.map((item) =>
            item.id === project.id ? { ...item, image } : item,
          ),
        })),
    });

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const root = document.getElementById("root");

    const getFocusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );

    getFocusable()[0]?.focus();
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("is-locked");
    root?.setAttribute("aria-hidden", "true");

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("is-locked");
      root?.removeAttribute("aria-hidden");
      previousFocus?.focus();
    };
  }, [onClose]);

  const links = [
    project.githubUrl
      ? { label: t.modal.github, url: project.githubUrl, primary: project.linkMode !== "external" }
      : null,
    project.externalUrl
      ? { label: t.modal.external, url: project.externalUrl, primary: project.linkMode === "external" }
      : null,
  ]
    .filter((link): link is { label: string; url: string; primary: boolean } =>
      Boolean(link),
    )
    .sort((a, b) => Number(b.primary) - Number(a.primary));

  const note = project.note[lang];

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      aria-describedby="project-modal-summary"
      ref={rootRef}
      style={{ "--p-accent": project.accent } as CSSProperties}
    >
      <div className="modal__noise" aria-hidden="true" />
      <div className="modal__inner">
        <div className="modal__bar">
          <p className="mono modal__kicker">
            <span className="modal__accent" aria-hidden="true" />
            {project.category[lang]} · {project.year}
          </p>
          <div className="modal__bar-actions">
            <EditButton
              label="Editar proyecto"
              onClick={() => open({ kind: "project", id: project.id })}
            />
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              data-cursor
              data-cursor-label={t.modal.close}
            >
              {t.modal.close}
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </button>
          </div>
        </div>

        {cover || editing ? (
          <div className={`modal__cover${cover ? "" : " is-empty"}`}>
            {cover ? (
              <img src={cover} alt={`${project.title} — portada`} />
            ) : (
              <span className="modal__cover-empty">
                Este proyecto todavía no tiene portada.
              </span>
            )}
            {editing ? (
              <button
                type="button"
                className="modal__cover-edit"
                onClick={changeCover}
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 11.5V13h1.5L12.8 4.7a1.1 1.1 0 0 0 0-1.5l-.4-.4a1.1 1.1 0 0 0-1.5 0L3 11.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                {cover ? "Cambiar portada" : "Añadir portada"}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="modal__hero">
          <div>
            <h2 className="modal__title" id="project-modal-title">
              {project.title}
            </h2>
            <p className="modal__sub">{project.subtitle[lang]}</p>
          </div>
          <PixelStar className="modal__star" />
        </div>

        <dl className="modal__meta">
          <div>
            <dt className="mono">{t.modal.role}</dt>
            <dd>{project.role[lang]}</dd>
          </div>
          <div>
            <dt className="mono">{t.modal.year}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt className="mono">{t.modal.stack}</dt>
            <dd>{project.stack.join(" · ")}</dd>
          </div>
        </dl>

        <p className="modal__summary" id="project-modal-summary">
          {project.summary[lang]}
        </p>

        <p className="pixel-label modal__label">{t.modal.whatIDid}</p>
        <ul className="modal__list">
          {project.bullets[lang].map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <div className="modal__tags" aria-hidden="true">
          {project.stack.map((tech) => (
            <span className="modal__tag" key={tech}>
              {tech}
            </span>
          ))}
        </div>

        {links.length > 0 && (
          <div className="modal__links">
            {links.map((link) => (
              <a
                className={`modal__link${link.primary ? " is-primary" : ""}`}
                key={link.url}
                href={safeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                data-cursor-label={link.label}
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}

        {note && <p className="modal__note">{note}</p>}
      </div>
    </div>,
    document.body,
  );
}
