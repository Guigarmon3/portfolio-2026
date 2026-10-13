import { useState } from "react";
import type {
  JourneyItem,
  L,
  LList,
  Project,
  SiteContent,
  Social,
  StackGroup,
} from "../data/content";
import {
  BiField,
  BiListField,
  Card,
  Field,
  Row,
  Segmented,
  Toggle,
} from "./fields";

type Profile = SiteContent["profile"];
type Sections = SiteContent["sections"];
type Settings = SiteContent["settings"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalized(value: unknown): value is L {
  return (
    isRecord(value) &&
    typeof value.es === "string" &&
    typeof value.en === "string"
  );
}

function isLocalizedList(value: unknown): value is LList {
  return (
    isRecord(value) &&
    Array.isArray(value.es) &&
    Array.isArray(value.en)
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/* --------------------------------------------------------------------------
   Perfil
   -------------------------------------------------------------------------- */

export function ProfileEditor({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
}) {
  const set = <K extends keyof Profile,>(key: K, value: Profile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  const setSocial = (index: number, patch: Partial<Social>) => {
    onChange({
      ...profile,
      socials: profile.socials.map((social, i) =>
        i === index ? { ...social, ...patch } : social,
      ),
    });
  };

  return (
    <div className="cfg-stack">
      <Card
        title="Identidad"
        eyebrow="Perfil"
        description="Lo que aparece en el hero, la ficha y los metadatos de la web."
      >
        <Row>
          <Field
            label="Nombre completo"
            value={profile.name}
            onChange={(value) => set("name", value)}
          />
          <Field
            label="Nombre"
            value={profile.firstName}
            onChange={(value) => set("firstName", value)}
          />
          <Field
            label="Apellidos"
            value={profile.lastName}
            onChange={(value) => set("lastName", value)}
          />
          <Field
            label="Marca / iniciales"
            value={profile.mark}
            onChange={(value) => set("mark", value)}
            hint="Máximo 3 caracteres."
          />
        </Row>

        <Row>
          <Field
            label="Email"
            type="email"
            value={profile.email}
            onChange={(value) => set("email", value)}
          />
        </Row>

        <BiField
          label="Rol"
          value={profile.role}
          onChange={(value) => set("role", value)}
        />
        <BiField
          label="Eyebrow (sobre el nombre)"
          value={profile.eyebrow}
          onChange={(value) => set("eyebrow", value)}
        />
        <BiField
          label="Tagline"
          value={profile.tagline}
          onChange={(value) => set("tagline", value)}
          multiline
          rows={3}
        />
        <Row>
          <BiField
            label="Disponibilidad"
            value={profile.availability}
            onChange={(value) => set("availability", value)}
          />
          <BiField
            label="Ubicación"
            value={profile.location}
            onChange={(value) => set("location", value)}
          />
        </Row>
        <BiField
          label="Nota de movilidad"
          value={profile.commuteNote}
          onChange={(value) => set("commuteNote", value)}
          multiline
          rows={2}
        />
      </Card>

      <Card
        title="Redes"
        eyebrow="Enlaces"
        description="Se muestran en la sección de contacto."
        actions={
          <button
            type="button"
            className="cfg-btn cfg-btn--small"
            onClick={() =>
              onChange({
                ...profile,
                socials: [
                  ...profile.socials,
                  { label: "Nueva red", url: "https://" },
                ],
              })
            }
          >
            + Añadir red
          </button>
        }
      >
        <div className="cfg-stack">
          {profile.socials.map((social, index) => (
            <div className="cfg-inline" key={`${social.label}-${index}`}>
              <Field
                label="Nombre"
                value={social.label}
                onChange={(value) => setSocial(index, { label: value })}
              />
              <Field
                label="URL"
                type="url"
                value={social.url}
                onChange={(value) => setSocial(index, { url: value })}
              />
              <div className="cfg-inline__actions">
                <button
                  type="button"
                  className="cfg-icon"
                  title="Subir"
                  disabled={index === 0}
                  onClick={() =>
                    onChange({
                      ...profile,
                      socials: moveItem(profile.socials, index, -1),
                    })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="cfg-icon"
                  title="Bajar"
                  disabled={index === profile.socials.length - 1}
                  onClick={() =>
                    onChange({
                      ...profile,
                      socials: moveItem(profile.socials, index, 1),
                    })
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="cfg-icon cfg-icon--danger"
                  title="Eliminar"
                  onClick={() =>
                    onChange({
                      ...profile,
                      socials: profile.socials.filter((_, i) => i !== index),
                    })
                  }
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {profile.socials.length === 0 ? (
            <p className="cfg-empty">No hay redes todavía.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Proyectos
   -------------------------------------------------------------------------- */

function blankProject(index: number): Project {
  return {
    id: `proyecto-${Date.now()}`,
    title: `Proyecto ${index + 1}`,
    image: "",
    year: String(new Date().getFullYear()),
    category: { es: "Proyecto personal", en: "Personal project" },
    role: { es: "Desarrollo web", en: "Web development" },
    stack: [],
    accent: "#c9f26b",
    subtitle: { es: "", en: "" },
    summary: { es: "", en: "" },
    bullets: { es: [], en: [] },
    note: { es: "", en: "" },
    githubUrl: "",
    externalUrl: "",
    linkMode: "none",
    featured: false,
    visible: true,
  };
}

export function ProjectsEditor({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(
    projects[0]?.id ?? null,
  );

  const patchProject = (index: number, patch: Partial<Project>) => {
    onChange(
      projects.map((project, i) =>
        i === index ? { ...project, ...patch } : project,
      ),
    );
  };

  const addProject = () => {
    const project = blankProject(projects.length);
    onChange([...projects, project]);
    setOpenId(project.id);
  };

  const duplicateProject = (index: number) => {
    const source = projects[index];
    if (!source) return;
    const copy: Project = {
      ...source,
      id: `${source.id}-copia-${Date.now()}`,
      title: `${source.title} (copia)`,
      featured: false,
    };
    const next = projects.slice();
    next.splice(index + 1, 0, copy);
    onChange(next);
    setOpenId(copy.id);
  };

  const removeProject = (index: number) => {
    const project = projects[index];
    if (!project) return;
    if (!window.confirm(`¿Eliminar “${project.title}”?`)) return;
    onChange(projects.filter((_, i) => i !== index));
    if (openId === project.id) setOpenId(null);
  };

  return (
    <div className="cfg-stack">
      <Card
        title="Proyectos"
        eyebrow={`${projects.length} en total`}
        description="El orden de esta lista es el orden de la web. Los destacados salen en la lista principal; el resto, en “Más en el arcade”."
        actions={
          <button
            type="button"
            className="cfg-btn cfg-btn--primary cfg-btn--small"
            onClick={addProject}
          >
            + Añadir proyecto
          </button>
        }
      >
        <div className="cfg-stack">
          {projects.map((project, index) => {
            const open = openId === project.id;
            return (
              <article
                className={`cfg-item${open ? " is-open" : ""}`}
                key={project.id}
              >
                <header className="cfg-item__head">
                  <span className="cfg-item__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="cfg-item__title">
                    <h3>{project.title || "Proyecto sin título"}</h3>
                    <p>
                      {project.year || "Sin año"} ·{" "}
                      {project.category.es || "Sin categoría"}
                    </p>
                  </div>
                  <div className="cfg-item__badges">
                    <span
                      className={`cfg-badge${project.visible ? " is-on" : ""}`}
                    >
                      {project.visible ? "Visible" : "Oculto"}
                    </span>
                    <span
                      className={`cfg-badge cfg-badge--accent${
                        project.featured ? " is-on" : ""
                      }`}
                    >
                      {project.featured ? "Destacado" : "Secundario"}
                    </span>
                    <span className="cfg-badge cfg-badge--link">
                      {project.linkMode === "github"
                        ? "GitHub"
                        : project.linkMode === "external"
                          ? "Web"
                          : "Sin enlace"}
                    </span>
                  </div>
                  <div className="cfg-item__actions">
                    <button
                      type="button"
                      className="cfg-icon"
                      title="Subir"
                      disabled={index === 0}
                      onClick={() => onChange(moveItem(projects, index, -1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="cfg-icon"
                      title="Bajar"
                      disabled={index === projects.length - 1}
                      onClick={() => onChange(moveItem(projects, index, 1))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="cfg-icon"
                      title="Duplicar"
                      onClick={() => duplicateProject(index)}
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      className="cfg-icon cfg-icon--danger"
                      title="Eliminar"
                      onClick={() => removeProject(index)}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      className="cfg-btn cfg-btn--small"
                      onClick={() => setOpenId(open ? null : project.id)}
                    >
                      {open ? "Cerrar" : "Editar"}
                    </button>
                  </div>
                </header>

                {open ? (
                  <div className="cfg-item__body">
                    <Row>
                      <Field
                        label="Título"
                        value={project.title}
                        onChange={(value) =>
                          patchProject(index, { title: value })
                        }
                      />
                      <Field
                        label="Año"
                        value={project.year}
                        onChange={(value) =>
                          patchProject(index, { year: value })
                        }
                      />
                      <Field
                        label="Color de acento"
                        type="color"
                        value={project.accent}
                        onChange={(value) =>
                          patchProject(index, { accent: value })
                        }
                      />
                    </Row>

                    <Field
                      label="Identificador"
                      value={project.id}
                      mono
                      hint="Clave interna única. No la cambies si el proyecto ya está publicado."
                      onChange={(value) =>
                        patchProject(index, { id: value })
                      }
                    />

                    <Row>
                      <BiField
                        label="Categoría"
                        value={project.category}
                        onChange={(value) =>
                          patchProject(index, { category: value })
                        }
                      />
                      <BiField
                        label="Rol"
                        value={project.role}
                        onChange={(value) =>
                          patchProject(index, { role: value })
                        }
                      />
                    </Row>

                    <Field
                      label="Stack"
                      value={project.stack.join(", ")}
                      hint="Separa las tecnologías con comas."
                      onChange={(value) =>
                        patchProject(index, {
                          stack: value.split(",").map((item) => item.trimStart()),
                        })
                      }
                      onBlur={() =>
                        patchProject(index, {
                          stack: project.stack
                            .map((item) => item.trim())
                            .filter(Boolean),
                        })
                      }
                    />

                    <BiField
                      label="Subtítulo"
                      value={project.subtitle}
                      onChange={(value) =>
                        patchProject(index, { subtitle: value })
                      }
                    />

                    <BiField
                      label="Resumen"
                      value={project.summary}
                      multiline
                      rows={4}
                      onChange={(value) =>
                        patchProject(index, { summary: value })
                      }
                    />

                    <BiListField
                      label="Qué hiciste (bullets)"
                      value={project.bullets}
                      onChange={(value) =>
                        patchProject(index, { bullets: value })
                      }
                    />

                    <BiField
                      label="Nota final"
                      value={project.note}
                      multiline
                      rows={2}
                      onChange={(value) =>
                        patchProject(index, { note: value })
                      }
                    />

                    <div className="cfg-links">
                      <h4>Enlaces</h4>
                      <Row>
                        <Field
                          label="GitHub"
                          type="url"
                          value={project.githubUrl}
                          placeholder="https://github.com/…"
                          onChange={(value) =>
                            patchProject(index, { githubUrl: value })
                          }
                        />
                        <Field
                          label="Web externa"
                          type="url"
                          value={project.externalUrl}
                          placeholder="https://…"
                          onChange={(value) =>
                            patchProject(index, { externalUrl: value })
                          }
                        />
                      </Row>
                      <Segmented
                        label="Enlace principal"
                        value={project.linkMode}
                        hint="El enlace principal se abre primero desde la ficha y decide si el proyecto muestra el punto “En vivo”."
                        options={[
                          { value: "none", label: "Sin enlace" },
                          { value: "github", label: "GitHub" },
                          { value: "external", label: "Web externa" },
                        ]}
                        onChange={(value) =>
                          patchProject(index, { linkMode: value })
                        }
                      />
                    </div>

                    <div className="cfg-toggles">
                      <Toggle
                        label="Visible en la web"
                        checked={project.visible}
                        hint="Si lo apagas, desaparece sin borrar los datos."
                        onChange={(value) =>
                          patchProject(index, { visible: value })
                        }
                      />
                      <Toggle
                        label="Destacado"
                        checked={project.featured}
                        hint="Los destacados ocupan la lista principal."
                        onChange={(value) =>
                          patchProject(index, { featured: value })
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
          {projects.length === 0 ? (
            <p className="cfg-empty">
              No hay proyectos. Añade el primero para que aparezca en la web.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Experiencia y estudios
   -------------------------------------------------------------------------- */

export function JourneyEditor({
  items,
  onChange,
  kind,
}: {
  items: JourneyItem[];
  onChange: (items: JourneyItem[]) => void;
  kind: "experience" | "education";
}) {
  const isExperience = kind === "experience";
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const patchItem = (index: number, patch: Partial<JourneyItem>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    const item: JourneyItem = {
      id: `${kind}-${Date.now()}`,
      year: String(new Date().getFullYear()),
      title: {
        es: isExperience ? "Nuevo puesto" : "Nuevos estudios",
        en: isExperience ? "New role" : "New studies",
      },
      place: { es: "", en: "" },
      description: { es: "", en: "" },
    };
    onChange([...items, item]);
    setOpenId(item.id);
  };

  return (
    <Card
      title={isExperience ? "Experiencia" : "Estudios"}
      eyebrow={`${items.length} ${items.length === 1 ? "entrada" : "entradas"}`}
      description={
        isExperience
          ? "Proyectos propios, prácticas o trabajos. Aparecen en la columna de experiencia."
          : "Formación reglada y cursos. Aparecen en la columna de estudios."
      }
      actions={
        <button
          type="button"
          className="cfg-btn cfg-btn--primary cfg-btn--small"
          onClick={addItem}
        >
          + Añadir
        </button>
      }
    >
      <div className="cfg-stack">
        {items.map((item, index) => {
          const open = openId === item.id;
          return (
            <article
              className={`cfg-item${open ? " is-open" : ""}`}
              key={item.id}
            >
              <header className="cfg-item__head">
                <span className="cfg-item__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="cfg-item__title">
                  <h3>{item.title.es || "Sin título"}</h3>
                  <p>
                    {item.year || "Sin año"} · {item.place.es || "Sin lugar"}
                  </p>
                </div>
                <div className="cfg-item__actions">
                  <button
                    type="button"
                    className="cfg-icon"
                    title="Subir"
                    disabled={index === 0}
                    onClick={() => onChange(moveItem(items, index, -1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="cfg-icon"
                    title="Bajar"
                    disabled={index === items.length - 1}
                    onClick={() => onChange(moveItem(items, index, 1))}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="cfg-icon cfg-icon--danger"
                    title="Eliminar"
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar “${item.title.es}”?`)) {
                        return;
                      }
                      onChange(items.filter((_, i) => i !== index));
                      if (openId === item.id) setOpenId(null);
                    }}
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    className="cfg-btn cfg-btn--small"
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    {open ? "Cerrar" : "Editar"}
                  </button>
                </div>
              </header>

              {open ? (
                <div className="cfg-item__body">
                  <Row>
                    <Field
                      label="Año / periodo"
                      value={item.year}
                      onChange={(value) =>
                        patchItem(index, { year: value })
                      }
                    />
                    <Field
                      label="Identificador"
                      value={item.id}
                      mono
                      onChange={(value) => patchItem(index, { id: value })}
                    />
                  </Row>
                  <BiField
                    label="Título"
                    value={item.title}
                    onChange={(value) => patchItem(index, { title: value })}
                  />
                  <BiField
                    label="Lugar / contexto"
                    value={item.place}
                    onChange={(value) => patchItem(index, { place: value })}
                  />
                  <BiField
                    label="Descripción"
                    value={item.description}
                    multiline
                    rows={3}
                    onChange={(value) =>
                      patchItem(index, { description: value })
                    }
                  />
                </div>
              ) : null}
            </article>
          );
        })}
        {items.length === 0 ? (
          <p className="cfg-empty">No hay entradas todavía.</p>
        ) : null}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
   Stack
   -------------------------------------------------------------------------- */

export function StackEditor({
  groups,
  onChange,
}: {
  groups: StackGroup[];
  onChange: (groups: StackGroup[]) => void;
}) {
  const patchGroup = (index: number, patch: Partial<StackGroup>) => {
    onChange(
      groups.map((group, i) => (i === index ? { ...group, ...patch } : group)),
    );
  };

  return (
    <Card
      title="Caja de herramientas"
      eyebrow={`${groups.length} grupos`}
      description="Cada grupo es un estante de la caja. El orden se respeta en la web."
      actions={
        <button
          type="button"
          className="cfg-btn cfg-btn--primary cfg-btn--small"
          onClick={() =>
            onChange([
              ...groups,
              {
                id: `grupo-${Date.now()}`,
                name: { es: "Nuevo grupo", en: "New group" },
                items: [],
              },
            ])
          }
        >
          + Añadir grupo
        </button>
      }
    >
      <div className="cfg-stack">
        {groups.map((group, index) => (
          <article className="cfg-item is-open" key={group.id}>
            <header className="cfg-item__head">
              <span className="cfg-item__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="cfg-item__title">
                <h3>{group.name.es || "Grupo sin nombre"}</h3>
                <p>{group.items.length} herramientas</p>
              </div>
              <div className="cfg-item__actions">
                <button
                  type="button"
                  className="cfg-icon"
                  title="Subir"
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(groups, index, -1))}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="cfg-icon"
                  title="Bajar"
                  disabled={index === groups.length - 1}
                  onClick={() => onChange(moveItem(groups, index, 1))}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="cfg-icon cfg-icon--danger"
                  title="Eliminar"
                  onClick={() => {
                    if (!window.confirm(`¿Eliminar “${group.name.es}”?`)) {
                      return;
                    }
                    onChange(groups.filter((_, i) => i !== index));
                  }}
                >
                  ×
                </button>
              </div>
            </header>
            <div className="cfg-item__body">
              <BiField
                label="Nombre del grupo"
                value={group.name}
                onChange={(value) => patchGroup(index, { name: value })}
              />
              <Field
                label="Herramientas"
                value={group.items.join(", ")}
                hint="Sepáralas con comas. Se muestran como etiquetas."
                onChange={(value) =>
                  patchGroup(index, {
                    items: value.split(",").map((item) => item.trimStart()),
                  })
                }
                onBlur={() =>
                  patchGroup(index, {
                    items: group.items
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </article>
        ))}
        {groups.length === 0 ? (
          <p className="cfg-empty">No hay grupos todavía.</p>
        ) : null}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
   Textos
   -------------------------------------------------------------------------- */

const GROUP_LABELS: Record<keyof Sections, string> = {
  meta: "Metadatos y SEO",
  nav: "Navegación",
  hero: "Inicio",
  work: "Trabajo",
  about: "Sobre mí",
  stack: "Caja de herramientas",
  journey: "Trayectoria",
  contact: "Contacto",
  footer: "Pie de página",
  modal: "Ficha de proyecto",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  description: "Descripción",
  home: "Inicio",
  work: "Trabajo",
  about: "Sobre mí",
  stack: "Stack",
  journey: "Trayectoria",
  contact: "Contacto",
  menu: "Menú",
  close: "Cerrar",
  scroll: "Indicador de scroll",
  timeLabel: "Hora local",
  ctaWork: "Botón de proyectos",
  ctaContact: "Botón de contacto",
  label: "Etiqueta",
  hint: "Texto de apoyo",
  more: "Más en el arcade",
  open: "Abrir proyecto",
  external: "Enlace externo",
  live: "En vivo",
  paragraphs: "Párrafos",
  quote: "Cita",
  playerLabel: "Etiqueta de la ficha",
  playerClass: "Clase / estado",
  nowLabel: "Etiqueta “ahora”",
  now: "Ahora",
  sideQuestsLabel: "Etiqueta de misiones",
  sideQuests: "Misiones secundarias",
  note: "Nota",
  experience: "Experiencia",
  education: "Estudios",
  nextLabel: "Etiqueta siguiente nivel",
  nextTitle: "Título siguiente nivel",
  nextText: "Texto siguiente nivel",
  nextCta: "Botón siguiente nivel",
  big: "Titular grande",
  emailLabel: "Etiqueta de email",
  copy: "Copiar",
  copied: "Copiado",
  availabilityLabel: "Etiqueta de disponibilidad",
  socials: "Redes",
  rights: "Derechos",
  built: "Créditos",
  backTop: "Volver arriba",
  stackNote: "Nota de stack",
  role: "Rol",
  year: "Año",
  whatIDid: "Qué hice",
  links: "Enlaces",
  github: "GitHub",
};

const MULTILINE_TEXT_KEYS = new Set([
  "description",
  "tagline",
  "summary",
  "note",
  "quote",
  "nextText",
  "now",
  "whatIDid",
  "built",
]);

function humanize(key: string) {
  const spaced = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function TextsEditor({
  sections,
  onChange,
  only,
  title = "Textos de la web",
  eyebrow = "Español e inglés",
}: {
  sections: Sections;
  onChange: (sections: Sections) => void;
  only?: (keyof Sections)[];
  title?: string;
  eyebrow?: string;
}) {
  const groups =
    only ?? (Object.keys(sections) as (keyof Sections)[]);

  const updateField = (group: keyof Sections, key: string, value: unknown) => {
    onChange({
      ...sections,
      [group]: {
        ...(sections[group] as Record<string, unknown>),
        [key]: value,
      },
    });
  };

  return (
    <Card
      title={title}
      eyebrow={eyebrow}
      description={
        only
          ? "Edita la versión en español e inglés. Los cambios se ven al momento en la web."
          : "Todos los textos de la interfaz. Los campos vacíos se quedan vacíos: revísalos en los dos idiomas."
      }
    >
      <div className="cfg-texts">
        {groups.map((group) => {
          const entries = Object.entries(
            sections[group] as Record<string, unknown>,
          );
          return (
            <details
              className="cfg-texts__group"
              key={group}
              open={Boolean(only) || group === "hero" || group === "meta"}
            >
              <summary>
                <span>{GROUP_LABELS[group] ?? group}</span>
                <span className="cfg-texts__count">{entries.length}</span>
              </summary>
              <div className="cfg-texts__fields">
                {entries.map(([key, value]) => {
                  const label = FIELD_LABELS[key] ?? humanize(key);
                  if (isLocalized(value)) {
                    const multiline = MULTILINE_TEXT_KEYS.has(key);
                    return (
                      <BiField
                        key={key}
                        label={label}
                        value={value}
                        multiline={multiline}
                        rows={multiline ? 3 : undefined}
                        onChange={(next) => updateField(group, key, next)}
                      />
                    );
                  }
                  if (isLocalizedList(value)) {
                    return (
                      <BiListField
                        key={key}
                        label={label}
                        value={value}
                        onChange={(next) => updateField(group, key, next)}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </details>
          );
        })}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
   Ajustes
   -------------------------------------------------------------------------- */

export function SettingsEditor({
  settings,
  onChange,
  onExport,
  onImport,
  onReset,
}: {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}) {
  return (
    <div className="cfg-stack">
      <Card
        title="Ajustes generales"
        eyebrow="Comportamiento"
        description="Cambios que afectan a cómo arranca y se mueve la web."
      >
        <Segmented
          label="Idioma por defecto"
          value={settings.defaultLang}
          options={[
            { value: "es", label: "Español" },
            { value: "en", label: "English" },
          ]}
          onChange={(value) => onChange({ ...settings, defaultLang: value })}
        />
        <Segmented
          label="Energía visual"
          value={settings.energy}
          options={[
            { value: "normal", label: "Normal" },
            { value: "extra", label: "Extra" },
          ]}
          hint="“Extra” intensifica el grano y los brillos."
          onChange={(value) => onChange({ ...settings, energy: value })}
        />
        <div className="cfg-toggles">
          <Toggle
            label="Preloader"
            checked={settings.preloader}
            hint="Pantalla de carga con el contador antes de entrar."
            onChange={(value) => onChange({ ...settings, preloader: value })}
          />
          <Toggle
            label="Marquee"
            checked={settings.marquee}
            hint="Cinta de texto en movimiento bajo el hero."
            onChange={(value) => onChange({ ...settings, marquee: value })}
          />
        </div>
      </Card>

      <Card
        title="Datos"
        eyebrow="Copia de seguridad"
        description="Exporta el contenido antes de hacer cambios grandes. También puedes restaurar los valores originales."
      >
        <div className="cfg-data-actions">
          <button type="button" className="cfg-btn" onClick={onExport}>
            Exportar JSON
          </button>
          <label className="cfg-btn cfg-file">
            Importar JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImport(file);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="cfg-btn cfg-btn--danger"
            onClick={onReset}
          >
            Restaurar contenido original
          </button>
        </div>
        <p className="cfg-field__hint">
          Restaurar solo cambia el editor: la web no se actualiza hasta que
          pulses “Guardar cambios”.
        </p>
      </Card>
    </div>
  );
}
