import { useState, type CSSProperties } from "react";
import { useLang } from "../lib/lang";
import { safeImageUrl, safeUrl, useSite } from "../lib/site";
import { useEditor } from "../edit/EditorContext";
import { AddButton, EditBar, EditButton } from "../edit/controls";
import { blankProject } from "../edit/factories";
import { ProjectModal } from "./ProjectModal";
import { PixelStar } from "./Decor";

export function Work() {
  const { lang, t } = useLang();
  const { data, updateDraft } = useSite();
  const { open } = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);

  const featured = data.projects.filter(
    (project) => project.visible && project.featured,
  );
  const secondary = data.projects.filter(
    (project) => project.visible && !project.featured,
  );

  const active = activeId
    ? data.projects.find((project) => project.id === activeId) ?? null
    : null;

  const addProject = () => {
    const project = blankProject(data.projects.length);
    updateDraft((draft) => ({
      ...draft,
      projects: [...draft.projects, project],
    }));
    open({ kind: "project", id: project.id });
  };

  return (
    <section
      className="block work"
      id="work"
      data-block
      aria-labelledby="work-title"
    >
      <span className="block__ghost" aria-hidden="true">
        01
      </span>

      <div className="shell">
        <header className="block__head">
          <div className="block__head-main">
            <p className="pixel-label" data-reveal>
              {t.work.label}
            </p>
            <h2 className="block__title" id="work-title" data-reveal>
              {t.work.title}
            </h2>
          </div>
          <p className="block__hint" data-reveal>
            {t.work.hint}
          </p>
        </header>

        <EditBar label="Proyectos">
          <EditButton
            label="Textos de la sección"
            onClick={() => open({ kind: "texts", group: "work" })}
          />
          <AddButton label="Añadir proyecto" onClick={addProject} />
        </EditBar>

        <ul className="work__list">
          {featured.map((project, index) => {
            const thumb = safeImageUrl(project.image);
            return (
              <li
                className="work__row"
                key={project.id}
                style={{ "--p-accent": project.accent } as CSSProperties}
                data-reveal
              >
                <button
                  type="button"
                  className={`work__btn${thumb ? " has-thumb" : ""}`}
                  onClick={() => setActiveId(project.id)}
                  aria-haspopup="dialog"
                  aria-label={`${t.work.open}: ${project.title}`}
                  data-cursor
                  data-cursor-label={t.work.open}
                >
                  <span className="work__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {thumb ? (
                    <span className="work__thumb">
                      <img src={thumb} alt="" loading="lazy" />
                    </span>
                  ) : null}
                  <span className="work__main">
                    <span className="work__title">{project.title}</span>
                    <span className="work__sub">{project.subtitle[lang]}</span>
                  </span>
                  <span className="work__meta">
                    <b>{project.category[lang]}</b>
                    <span className="work__year">{project.year}</span>
                  </span>
                  {project.linkMode === "external" && project.externalUrl ? (
                    <span className="work__live">
                      <span className="work__live-dot" aria-hidden="true" />
                      {t.work.live}
                    </span>
                  ) : (
                    <span className="work__stack">
                      {project.stack.slice(0, 3).join(" · ")}
                    </span>
                  )}
                  <span className="work__arrow" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 11L11 3M11 3H5M11 3V9"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                </button>

                <EditButton
                  className="work__edit edit-hover"
                  label="Editar proyecto"
                  onClick={() => open({ kind: "project", id: project.id })}
                />
              </li>
            );
          })}
        </ul>

        {secondary.length > 0 && (
          <div className="work__more" data-reveal>
            <p className="pixel-label work__more-label">
              <PixelStar />
              {t.work.more}
            </p>
            <ul className="work__more-list">
              {secondary.map((project) => {
                const url =
                  project.linkMode === "external" && project.externalUrl
                    ? project.externalUrl
                    : project.githubUrl || project.externalUrl;
                return (
                  <li className="work__more-item" key={project.id}>
                    <a
                      href={safeUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor
                      data-cursor-label={t.work.external}
                    >
                      <span className="work__more-name">{project.title}</span>
                      <span className="work__more-detail">
                        {project.stack.join(" · ")}
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                    <EditButton
                      className="work__more-edit edit-hover"
                      label="Editar proyecto"
                      onClick={() =>
                        open({ kind: "project", id: project.id })
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {active && (
        <ProjectModal project={active} onClose={() => setActiveId(null)} />
      )}
    </section>
  );
}
