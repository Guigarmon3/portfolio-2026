import type {
  JourneyItem,
  Project,
  Social,
  StackGroup,
} from "../data/content";
import { defaultContent } from "../data/content";
import {
  mergeContent,
  normalizeContent,
  safeImageUrl,
  useSite,
} from "../lib/site";
import {
  BiField,
  BiListField,
  Card,
  Field,
  Row,
  Segmented,
  Toggle,
} from "../config/fields";
import {
  ProfileEditor,
  SettingsEditor,
  TextsEditor,
} from "../config/editors";
import { useEditor } from "./EditorContext";
import type { SectionKey } from "./types";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/* --------------------------------------------------------------------------
   Imagen
   -------------------------------------------------------------------------- */

export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const { requestImage } = useEditor();
  const src = safeImageUrl(value);

  const pick = () =>
    requestImage({
      title: label,
      value,
      onChange,
    });

  return (
    <div className="edit-image-field">
      <span className="cfg-field__label">{label}</span>
      <div className="edit-image-field__row">
        <button
          type="button"
          className="edit-image-field__preview"
          onClick={pick}
          aria-label={`${label}: elegir imagen`}
        >
          {src ? (
            <img src={src} alt="" />
          ) : (
            <span className="edit-image-field__empty">
              Sin imagen
              <small>Haz clic para elegir</small>
            </span>
          )}
        </button>
        <div className="edit-image-field__actions">
          <button type="button" className="cfg-btn cfg-btn--small" onClick={pick}>
            {src ? "Cambiar imagen" : "Elegir imagen"}
          </button>
          {src ? (
            <button
              type="button"
              className="cfg-btn cfg-btn--small cfg-btn--danger"
              onClick={() => onChange("")}
            >
              Quitar
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <span className="cfg-field__hint">{hint}</span> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Perfil e inicio
   -------------------------------------------------------------------------- */

export function ProfileForm() {
  const { data, updateDraft } = useSite();
  const profile = data.profile;

  return (
    <div className="cfg-stack">
      <ImageField
        label="Retrato"
        value={profile.portrait}
        onChange={(portrait) =>
          updateDraft((draft) => ({
            ...draft,
            profile: { ...draft.profile, portrait },
          }))
        }
        hint="Se muestra en la ficha de “Sobre mí”. Puedes subir un archivo o pegar una URL."
      />
      <ProfileEditor
        profile={profile}
        onChange={(next) =>
          updateDraft((draft) => ({ ...draft, profile: next }))
        }
      />
    </div>
  );
}

export function HeroForm() {
  const { data, updateDraft } = useSite();
  const profile = data.profile;
  const hero = data.sections.hero;

  const setProfile = (patch: Partial<typeof profile>) =>
    updateDraft((draft) => ({
      ...draft,
      profile: { ...draft.profile, ...patch },
    }));

  const setHero = (patch: Partial<typeof hero>) =>
    updateDraft((draft) => ({
      ...draft,
      sections: {
        ...draft.sections,
        hero: { ...draft.sections.hero, ...patch },
      },
    }));

  return (
    <div className="cfg-stack">
      <Card
        title="Identidad del hero"
        eyebrow="Inicio"
        description="El nombre grande, el rol y la línea de disponibilidad. Los cambios se ven al momento en la web."
      >
        <Row>
          <Field
            label="Nombre completo"
            value={profile.name}
            onChange={(name) => setProfile({ name })}
          />
          <Field
            label="Nombre"
            value={profile.firstName}
            onChange={(firstName) => setProfile({ firstName })}
          />
          <Field
            label="Apellidos"
            value={profile.lastName}
            onChange={(lastName) => setProfile({ lastName })}
          />
          <Field
            label="Marca / iniciales"
            value={profile.mark}
            onChange={(mark) => setProfile({ mark })}
            hint="Máximo 3 caracteres."
          />
        </Row>
        <BiField
          label="Rol"
          value={profile.role}
          onChange={(role) => setProfile({ role })}
        />
        <BiField
          label="Eyebrow (sobre el nombre)"
          value={profile.eyebrow}
          onChange={(eyebrow) => setProfile({ eyebrow })}
        />
        <BiField
          label="Tagline"
          value={profile.tagline}
          multiline
          rows={3}
          onChange={(tagline) => setProfile({ tagline })}
        />
        <Row>
          <BiField
            label="Disponibilidad"
            value={profile.availability}
            onChange={(availability) => setProfile({ availability })}
          />
          <BiField
            label="Ubicación"
            value={profile.location}
            onChange={(location) => setProfile({ location })}
          />
        </Row>
        <BiField
          label="Nota de movilidad"
          value={profile.commuteNote}
          multiline
          rows={2}
          onChange={(commuteNote) => setProfile({ commuteNote })}
        />
      </Card>

      <Card
        title="Textos del inicio"
        eyebrow="Botones y scroll"
        description="Los textos que acompañan al hero."
      >
        <BiField
          label="Indicador de scroll"
          value={hero.scroll}
          onChange={(scroll) => setHero({ scroll })}
        />
        <BiField
          label="Hora local"
          value={hero.timeLabel}
          onChange={(timeLabel) => setHero({ timeLabel })}
        />
        <Row>
          <BiField
            label="Botón de proyectos"
            value={hero.ctaWork}
            onChange={(ctaWork) => setHero({ ctaWork })}
          />
          <BiField
            label="Botón de contacto"
            value={hero.ctaContact}
            onChange={(ctaContact) => setHero({ ctaContact })}
          />
        </Row>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Sobre mí
   -------------------------------------------------------------------------- */

export function AboutForm() {
  const { data, updateDraft } = useSite();

  return (
    <div className="cfg-stack">
      <ImageField
        label="Retrato de la ficha"
        value={data.profile.portrait}
        onChange={(portrait) =>
          updateDraft((draft) => ({
            ...draft,
            profile: { ...draft.profile, portrait },
          }))
        }
        hint="Si está vacío se muestran las iniciales. También puedes pegar una URL."
      />
      <TextsEditor
        sections={data.sections}
        only={["about"]}
        title="Sobre mí"
        eyebrow="Textos ES/EN"
        onChange={(sections) =>
          updateDraft((draft) => ({ ...draft, sections }))
        }
      />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Proyectos
   -------------------------------------------------------------------------- */

export function ProjectForm({ project }: { project: Project }) {
  const { data, updateDraft } = useSite();
  const { open, close } = useEditor();

  const patch = (next: Partial<Project>) =>
    updateDraft((draft) => ({
      ...draft,
      projects: draft.projects.map((item) =>
        item.id === project.id ? { ...item, ...next } : item,
      ),
    }));

  const remove = () => {
    if (!window.confirm(`¿Eliminar “${project.title}”?`)) return;
    updateDraft((draft) => ({
      ...draft,
      projects: draft.projects.filter((item) => item.id !== project.id),
    }));
    close();
  };

  const duplicate = () => {
    const index = data.projects.findIndex((item) => item.id === project.id);
    const copy: Project = {
      ...project,
      id: `${project.id}-copia-${Date.now()}`,
      title: `${project.title} (copia)`,
      featured: false,
    };
    updateDraft((draft) => {
      const projects = draft.projects.slice();
      projects.splice(index + 1, 0, copy);
      return { ...draft, projects };
    });
    open({ kind: "project", id: copy.id });
  };

  const move = (direction: -1 | 1) => {
    const index = data.projects.findIndex((item) => item.id === project.id);
    updateDraft((draft) => ({
      ...draft,
      projects: moveItem(draft.projects, index, direction),
    }));
  };

  const index = data.projects.findIndex((item) => item.id === project.id);

  return (
    <div className="cfg-stack">
      <div className="edit-form-actions">
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          disabled={index <= 0}
          onClick={() => move(-1)}
        >
          ↑ Subir
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          disabled={index < 0 || index >= data.projects.length - 1}
          onClick={() => move(1)}
        >
          ↓ Bajar
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          onClick={duplicate}
        >
          ⧉ Duplicar
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small cfg-btn--danger"
          onClick={remove}
        >
          × Eliminar
        </button>
      </div>

      <Card title="Ficha del proyecto" eyebrow={project.id}>
        <ImageField
          label="Imagen de portada"
          value={project.image}
          onChange={(image) => patch({ image })}
          hint="Se usa como miniatura en la lista y como portada de la ficha. Sube un archivo o pega una URL."
        />

        <Row>
          <Field
            label="Título"
            value={project.title}
            onChange={(title) => patch({ title })}
          />
          <Field
            label="Año"
            value={project.year}
            onChange={(year) => patch({ year })}
          />
          <Field
            label="Color de acento"
            type="color"
            value={project.accent}
            onChange={(accent) => patch({ accent })}
          />
        </Row>

        <Field
          label="Identificador"
          value={project.id}
          mono
          hint="Clave interna única. No la cambies si el proyecto ya está publicado."
          onChange={(id) => patch({ id })}
        />

        <Row>
          <BiField
            label="Categoría"
            value={project.category}
            onChange={(category) => patch({ category })}
          />
          <BiField
            label="Rol"
            value={project.role}
            onChange={(role) => patch({ role })}
          />
        </Row>

        <Field
          label="Stack"
          value={project.stack.join(", ")}
          hint="Separa las tecnologías con comas."
          onChange={(value) =>
            patch({ stack: value.split(",").map((item) => item.trimStart()) })
          }
          onBlur={() =>
            patch({
              stack: project.stack
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />

        <BiField
          label="Subtítulo"
          value={project.subtitle}
          onChange={(subtitle) => patch({ subtitle })}
        />

        <BiField
          label="Resumen"
          value={project.summary}
          multiline
          rows={4}
          onChange={(summary) => patch({ summary })}
        />

        <BiListField
          label="Qué hiciste (bullets)"
          value={project.bullets}
          onChange={(bullets) => patch({ bullets })}
        />

        <BiField
          label="Nota final"
          value={project.note}
          multiline
          rows={2}
          onChange={(note) => patch({ note })}
        />
      </Card>

      <Card title="Enlaces" eyebrow="GitHub y web">
        <Row>
          <Field
            label="GitHub"
            type="url"
            value={project.githubUrl}
            placeholder="https://github.com/…"
            onChange={(githubUrl) => patch({ githubUrl })}
          />
          <Field
            label="Web externa"
            type="url"
            value={project.externalUrl}
            placeholder="https://…"
            onChange={(externalUrl) => patch({ externalUrl })}
          />
        </Row>
        <Segmented
          label="Enlace principal"
          value={project.linkMode}
          hint="Decide qué enlace se abre primero y si el proyecto muestra el punto “En vivo”."
          options={[
            { value: "none", label: "Sin enlace" },
            { value: "github", label: "GitHub" },
            { value: "external", label: "Web externa" },
          ]}
          onChange={(linkMode) => patch({ linkMode })}
        />
      </Card>

      <Card title="Visibilidad" eyebrow="Lista principal">
        <div className="cfg-toggles">
          <Toggle
            label="Visible en la web"
            checked={project.visible}
            hint="Si lo apagas, desaparece sin borrar los datos."
            onChange={(visible) => patch({ visible })}
          />
          <Toggle
            label="Destacado"
            checked={project.featured}
            hint="Los destacados ocupan la lista principal; el resto va a “Más en el arcade”."
            onChange={(featured) => patch({ featured })}
          />
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Experiencia y estudios
   -------------------------------------------------------------------------- */

export function JourneyForm({
  collection,
  item,
}: {
  collection: "experience" | "education";
  item: JourneyItem;
}) {
  const { data, updateDraft } = useSite();
  const { close } = useEditor();
  const isExperience = collection === "experience";
  const items = data[collection];

  const patch = (next: Partial<JourneyItem>) =>
    updateDraft((draft) => ({
      ...draft,
      [collection]: draft[collection].map((entry) =>
        entry.id === item.id ? { ...entry, ...next } : entry,
      ),
    }));

  const index = items.findIndex((entry) => entry.id === item.id);

  const move = (direction: -1 | 1) =>
    updateDraft((draft) => ({
      ...draft,
      [collection]: moveItem(draft[collection], index, direction),
    }));

  const remove = () => {
    if (!window.confirm(`¿Eliminar “${item.title.es}”?`)) return;
    updateDraft((draft) => ({
      ...draft,
      [collection]: draft[collection].filter((entry) => entry.id !== item.id),
    }));
    close();
  };

  return (
    <div className="cfg-stack">
      <div className="edit-form-actions">
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          disabled={index <= 0}
          onClick={() => move(-1)}
        >
          ↑ Subir
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          disabled={index < 0 || index >= items.length - 1}
          onClick={() => move(1)}
        >
          ↓ Bajar
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small cfg-btn--danger"
          onClick={remove}
        >
          × Eliminar
        </button>
      </div>

      <Card
        title={isExperience ? "Experiencia" : "Estudios"}
        eyebrow={item.id}
      >
        <Row>
          <Field
            label="Año / periodo"
            value={item.year}
            onChange={(year) => patch({ year })}
          />
          <Field
            label="Identificador"
            value={item.id}
            mono
            onChange={(id) => patch({ id })}
          />
        </Row>
        <BiField
          label="Título"
          value={item.title}
          onChange={(title) => patch({ title })}
        />
        <BiField
          label="Lugar / contexto"
          value={item.place}
          onChange={(place) => patch({ place })}
        />
        <BiField
          label="Descripción"
          value={item.description}
          multiline
          rows={3}
          onChange={(description) => patch({ description })}
        />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Stack
   -------------------------------------------------------------------------- */

export function StackForm({ group }: { group: StackGroup }) {
  const { data, updateDraft } = useSite();
  const { close } = useEditor();
  const index = data.stack.findIndex((entry) => entry.id === group.id);

  const patch = (next: Partial<StackGroup>) =>
    updateDraft((draft) => ({
      ...draft,
      stack: draft.stack.map((entry) =>
        entry.id === group.id ? { ...entry, ...next } : entry,
      ),
    }));

  const move = (direction: -1 | 1) =>
    updateDraft((draft) => ({
      ...draft,
      stack: moveItem(draft.stack, index, direction),
    }));

  const remove = () => {
    if (!window.confirm(`¿Eliminar “${group.name.es}”?`)) return;
    updateDraft((draft) => ({
      ...draft,
      stack: draft.stack.filter((entry) => entry.id !== group.id),
    }));
    close();
  };

  return (
    <div className="cfg-stack">
      <div className="edit-form-actions">
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          disabled={index <= 0}
          onClick={() => move(-1)}
        >
          ↑ Subir
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small"
          disabled={index < 0 || index >= data.stack.length - 1}
          onClick={() => move(1)}
        >
          ↓ Bajar
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--small cfg-btn--danger"
          onClick={remove}
        >
          × Eliminar
        </button>
      </div>

      <Card title="Grupo del stack" eyebrow={group.id}>
        <BiField
          label="Nombre del grupo"
          value={group.name}
          onChange={(name) => patch({ name })}
        />
        <Field
          label="Herramientas"
          value={group.items.join(", ")}
          hint="Sepáralas con comas. Se muestran como etiquetas."
          onChange={(value) =>
            patch({ items: value.split(",").map((item) => item.trimStart()) })
          }
          onBlur={() =>
            patch({
              items: group.items.map((item) => item.trim()).filter(Boolean),
            })
          }
        />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Redes y contacto
   -------------------------------------------------------------------------- */

export function SocialsForm() {
  const { data, updateDraft } = useSite();
  const socials = data.profile.socials;

  const setSocials = (next: Social[]) =>
    updateDraft((draft) => ({
      ...draft,
      profile: { ...draft.profile, socials: next },
    }));

  const setSocial = (index: number, patch: Partial<Social>) =>
    setSocials(
      socials.map((social, i) =>
        i === index ? { ...social, ...patch } : social,
      ),
    );

  return (
    <div className="cfg-stack">
      <div className="edit-form-actions">
        <button
          type="button"
          className="cfg-btn cfg-btn--primary cfg-btn--small"
          onClick={() =>
            setSocials([
              ...socials,
              { label: "Nueva red", url: "https://" },
            ])
          }
        >
          + Añadir red
        </button>
      </div>

      <Card
        title="Redes"
        eyebrow={`${socials.length} enlaces`}
        description="Aparecen en la sección de contacto. El orden se respeta en la web."
      >
        <div className="cfg-stack">
          {socials.map((social, index) => (
            <div className="cfg-inline" key={`${social.label}-${index}`}>
              <Field
                label="Nombre"
                value={social.label}
                onChange={(label) => setSocial(index, { label })}
              />
              <Field
                label="URL"
                type="url"
                value={social.url}
                onChange={(url) => setSocial(index, { url })}
              />
              <div className="cfg-inline__actions">
                <button
                  type="button"
                  className="cfg-icon"
                  title="Subir"
                  disabled={index === 0}
                  onClick={() => setSocials(moveItem(socials, index, -1))}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="cfg-icon"
                  title="Bajar"
                  disabled={index === socials.length - 1}
                  onClick={() => setSocials(moveItem(socials, index, 1))}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="cfg-icon cfg-icon--danger"
                  title="Eliminar"
                  onClick={() =>
                    setSocials(socials.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {socials.length === 0 ? (
            <p className="cfg-empty">No hay redes todavía.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export function ContactForm() {
  const { data, updateDraft } = useSite();
  const profile = data.profile;

  const setProfile = (patch: Partial<typeof profile>) =>
    updateDraft((draft) => ({
      ...draft,
      profile: { ...draft.profile, ...patch },
    }));

  return (
    <div className="cfg-stack">
      <Card
        title="Contacto"
        eyebrow="Email y disponibilidad"
        description="El email se usa en el enlace grande, en el botón de copiar y en el pie de contacto."
      >
        <Field
          label="Email"
          type="email"
          value={profile.email}
          onChange={(email) => setProfile({ email })}
        />
        <Row>
          <BiField
            label="Disponibilidad"
            value={profile.availability}
            onChange={(availability) => setProfile({ availability })}
          />
          <BiField
            label="Ubicación"
            value={profile.location}
            onChange={(location) => setProfile({ location })}
          />
        </Row>
        <BiField
          label="Nota de movilidad"
          value={profile.commuteNote}
          multiline
          rows={2}
          onChange={(commuteNote) => setProfile({ commuteNote })}
        />
      </Card>

      <TextsEditor
        sections={data.sections}
        only={["contact"]}
        title="Textos de contacto"
        eyebrow="ES/EN"
        onChange={(sections) =>
          updateDraft((draft) => ({ ...draft, sections }))
        }
      />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Textos y ajustes
   -------------------------------------------------------------------------- */

export const GROUP_TITLES: Record<SectionKey, string> = {
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

export function TextsForm({ group }: { group: SectionKey }) {
  const { data, updateDraft } = useSite();

  return (
    <TextsEditor
      sections={data.sections}
      only={[group]}
      title={GROUP_TITLES[group]}
      eyebrow="Textos ES/EN"
      onChange={(sections) =>
        updateDraft((draft) => ({ ...draft, sections }))
      }
    />
  );
}

export function SettingsForm() {
  const { data, updateDraft, notify } = useSite();

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `portfolio-contenido-${date}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Contenido exportado.");
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const candidate =
        typeof parsed === "object" && parsed !== null && "content" in parsed
          ? (parsed as { content: unknown }).content
          : parsed;
      const next = normalizeContent(mergeContent(defaultContent, candidate));
      updateDraft(() => next);
      notify("JSON cargado en el editor. Pulsa Guardar cambios.");
    } catch {
      notify("El archivo no es un JSON válido.");
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Se cargarán los valores originales en el editor. La web no cambia hasta que guardes.",
      )
    ) {
      return;
    }
    updateDraft(() => structuredClone(defaultContent));
    notify("Contenido original cargado en el editor.");
  };

  return (
    <div className="cfg-stack">
      <SettingsEditor
        settings={data.settings}
        onChange={(settings) =>
          updateDraft((draft) => ({ ...draft, settings }))
        }
        onExport={exportJson}
        onImport={(file) => void importJson(file)}
        onReset={reset}
      />
      <TextsEditor
        sections={data.sections}
        only={["meta"]}
        title="SEO y metadatos"
        eyebrow="Título y descripción"
        onChange={(sections) =>
          updateDraft((draft) => ({ ...draft, sections }))
        }
      />
    </div>
  );
}
