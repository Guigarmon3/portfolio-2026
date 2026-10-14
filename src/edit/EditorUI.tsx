import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSite } from "../lib/site";
import { useEditor } from "./EditorContext";
import { LoginGate } from "./LoginGate";
import { ImagePicker } from "./ImagePicker";
import {
  AboutForm,
  ContactForm,
  GROUP_TITLES,
  HeroForm,
  JourneyForm,
  ProfileForm,
  ProjectForm,
  SettingsForm,
  SocialsForm,
  StackForm,
  TextsForm,
} from "./forms";
import type { EditorTarget } from "./types";
import "./edit.css";

function targetLabel(target: EditorTarget, data: ReturnType<typeof useSite>["data"]) {
  switch (target.kind) {
    case "profile":
      return { eyebrow: "Perfil", title: "Tu identidad" };
    case "hero":
      return { eyebrow: "Inicio", title: "Hero y presentación" };
    case "about":
      return { eyebrow: "Sobre mí", title: "Retrato y textos" };
    case "project": {
      const project = data.projects.find((item) => item.id === target.id);
      return {
        eyebrow: "Proyecto",
        title: project?.title || "Proyecto",
      };
    }
    case "journey": {
      const item = data[target.collection].find(
        (entry) => entry.id === target.id,
      );
      return {
        eyebrow: target.collection === "experience" ? "Experiencia" : "Estudios",
        title: item?.title.es || "Entrada",
      };
    }
    case "stack": {
      const group = data.stack.find((entry) => entry.id === target.id);
      return {
        eyebrow: "Stack",
        title: group?.name.es || "Grupo",
      };
    }
    case "texts":
      return { eyebrow: "Textos", title: GROUP_TITLES[target.group] };
    case "socials":
      return { eyebrow: "Contacto", title: "Redes y enlaces" };
    case "contact":
      return { eyebrow: "Contacto", title: "Email y disponibilidad" };
    case "settings":
      return { eyebrow: "Ajustes", title: "Comportamiento y datos" };
    default:
      return { eyebrow: "Edición", title: "Contenido" };
  }
}

function DrawerContent({ target }: { target: EditorTarget }) {
  const { data } = useSite();

  switch (target.kind) {
    case "profile":
      return <ProfileForm />;
    case "hero":
      return <HeroForm />;
    case "about":
      return <AboutForm />;
    case "project": {
      const project = data.projects.find((item) => item.id === target.id);
      if (!project) {
        return <p className="cfg-empty">Este proyecto ya no existe.</p>;
      }
      return <ProjectForm project={project} />;
    }
    case "journey": {
      const item = data[target.collection].find(
        (entry) => entry.id === target.id,
      );
      if (!item) {
        return <p className="cfg-empty">Esta entrada ya no existe.</p>;
      }
      return <JourneyForm collection={target.collection} item={item} />;
    }
    case "stack": {
      const group = data.stack.find((entry) => entry.id === target.id);
      if (!group) {
        return <p className="cfg-empty">Este grupo ya no existe.</p>;
      }
      return <StackForm group={group} />;
    }
    case "texts":
      return <TextsForm group={target.group} />;
    case "socials":
      return <SocialsForm />;
    case "contact":
      return <ContactForm />;
    case "settings":
      return <SettingsForm />;
    default:
      return null;
  }
}

function EditToolbar() {
  const { dirty, saving, saveError, save, clearSaveError } = useSite();
  const { open, exit, logout } = useEditor();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return (
    <div className="edit-toolbar" role="region" aria-label="Modo edición">
      <div className="edit-toolbar__state">
        <span
          className={`edit-toolbar__dot${dirty ? " is-dirty" : ""}${
            saving ? " is-saving" : ""
          }`}
          aria-hidden="true"
        />
        <span className="edit-toolbar__label">
          {saving ? "Guardando…" : dirty ? "Sin guardar" : "Todo guardado"}
        </span>
        <span className="edit-toolbar__hint">Ctrl + S</span>
      </div>

      {saveError ? (
        <div className="edit-toolbar__error" role="alert">
          <span>{saveError}</span>
          <button type="button" onClick={clearSaveError} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      ) : null}

      <div className="edit-toolbar__actions">
        <button
          type="button"
          className="cfg-btn cfg-btn--ghost cfg-btn--small"
          onClick={() => open({ kind: "settings" })}
        >
          Ajustes
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--ghost cfg-btn--small"
          onClick={() => void logout()}
        >
          Cerrar sesión
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--ghost cfg-btn--small"
          onClick={exit}
        >
          Salir
        </button>
        <button
          type="button"
          className="cfg-btn cfg-btn--primary cfg-btn--small"
          onClick={() => void save()}
          disabled={!dirty || saving}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function EditorDrawer({ target }: { target: EditorTarget }) {
  const { data, dirty, saving, save } = useSite();
  const { close } = useEditor();
  const { eyebrow, title } = targetLabel(target, data);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [close]);

  return createPortal(
    <div
      className="edit-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-drawer-title"
    >
      <div className="edit-drawer__backdrop" onClick={close} />
      <aside className="edit-drawer__panel">
        <header className="edit-drawer__head">
          <div>
            <p className="edit-drawer__eyebrow">{eyebrow}</p>
            <h2 className="edit-drawer__title" id="edit-drawer-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="edit-modal__close"
            onClick={close}
            aria-label="Cerrar editor"
          >
            ×
          </button>
        </header>

        <div className="edit-drawer__body">
          <DrawerContent target={target} />
        </div>

        <footer className="edit-drawer__foot">
          <p>
            Los cambios se publican con <b>Guardar cambios</b>. Nada cambia en
            la web hasta que guardes.
          </p>
          <div className="edit-drawer__foot-actions">
            <button
              type="button"
              className="cfg-btn cfg-btn--small cfg-btn--ghost"
              onClick={close}
            >
              Listo
            </button>
            <button
              type="button"
              className="cfg-btn cfg-btn--small cfg-btn--primary"
              onClick={() => void save()}
              disabled={!dirty || saving}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}

export function EditorUI() {
  const { editing, gateOpen, target, imageRequest } = useEditor();
  const { toast } = useSite();

  return (
    <>
      {gateOpen ? <LoginGate /> : null}
      {editing ? <EditToolbar /> : null}
      {editing && target ? <EditorDrawer target={target} /> : null}
      {imageRequest ? <ImagePicker /> : null}
      {toast ? (
        <div className="edit-toast" role="status">
          <span className="edit-toast__dot" aria-hidden="true" />
          {toast}
        </div>
      ) : null}
    </>
  );
}
