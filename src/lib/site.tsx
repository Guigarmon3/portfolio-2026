import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultContent, type SiteContent } from "../data/content";

interface SiteContextValue {
  data: SiteContent;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  refresh: () => Promise<void>;
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  toast: string | null;
  startEditing: () => void;
  stopEditing: () => void;
  updateDraft: (updater: (draft: SiteContent) => SiteContent) => void;
  save: () => Promise<boolean>;
  notify: (message: string) => void;
  clearSaveError: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Mezcla el contenido remoto con los valores por defecto para que un JSON
 * antiguo o incompleto nunca rompa la web. Los arrays se sustituyen enteros.
 */
export function mergeContent<T>(base: T, patch: unknown): T {
  if (patch === undefined || patch === null) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as T;
  }
  if (isRecord(base) && isRecord(patch)) {
    const next: Record<string, unknown> = { ...base };
    for (const key of Object.keys(patch)) {
      next[key] = mergeContent(
        (base as Record<string, unknown>)[key],
        patch[key],
      );
    }
    return next as T;
  }
  if (typeof base === typeof patch) return patch as T;
  return base;
}

/**
 * Los arrays se sustituyen enteros al mezclar, así que los campos nuevos de
 * cada proyecto se añaden aquí para que el contenido antiguo siga funcionando.
 */
export function normalizeContent(content: SiteContent): SiteContent {
  return {
    ...content,
    profile: {
      ...content.profile,
      portrait:
        typeof content.profile.portrait === "string"
          ? content.profile.portrait
          : "",
    },
    projects: content.projects.map((project) => ({
      ...project,
      image: typeof project.image === "string" ? project.image : "",
    })),
  };
}

function cloneContent(content: SiteContent): SiteContent {
  return structuredClone(content);
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<SiteContent>(() =>
    cloneContent(defaultContent),
  );
  const [draft, setDraft] = useState<SiteContent>(() =>
    cloneContent(defaultContent),
  );
  const [savedJson, setSavedJson] = useState(() =>
    JSON.stringify(defaultContent),
  );
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadedRef = useRef(false);
  const editingRef = useRef(false);
  const dirtyRef = useRef(false);
  const toastTimer = useRef(0);

  const dirty = useMemo(
    () => editing && JSON.stringify(draft) !== savedJson,
    [editing, draft, savedJson],
  );
  dirtyRef.current = dirty;
  editingRef.current = editing;

  const notify = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      if (!loadedRef.current) setLoading(true);
      setError(null);
      const response = await fetch("/api/content", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      const payload = (await response.json()) as {
        content?: unknown;
        updatedAt?: string | null;
      };
      const next = normalizeContent(
        mergeContent(defaultContent, payload.content),
      );
      setPublished(next);
      if (!editingRef.current || !dirtyRef.current) {
        setDraft(next);
        setSavedJson(JSON.stringify(next));
      }
      setUpdatedAt(payload.updatedAt ?? null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cargar el contenido",
      );
      if (!editingRef.current) {
        setPublished(defaultContent);
        setDraft(defaultContent);
        setSavedJson(JSON.stringify(defaultContent));
      }
    } finally {
      loadedRef.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /*
   * Si otra pestaña guarda cambios, la web abierta se actualiza sola.
   * Mientras hay un borrador con cambios sin guardar no se pisa: se avisa.
   */
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("gg-content");
    channel.onmessage = (event) => {
      if (event.data?.type !== "content-updated") return;
      if (editingRef.current && dirtyRef.current) {
        notify(
          "Hay cambios nuevos publicados en otra pestaña. Guarda o descarta los tuyos.",
        );
        return;
      }
      void refresh();
    };
    return () => channel.close();
  }, [refresh, notify]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const startEditing = useCallback(() => {
    setDraft(cloneContent(published));
    setSavedJson(JSON.stringify(published));
    setEditing(true);
    setSaveError(null);
  }, [published]);

  const stopEditing = useCallback(() => {
    setEditing(false);
    setDraft(cloneContent(published));
    setSavedJson(JSON.stringify(published));
    setSaveError(null);
  }, [published]);

  const updateDraft = useCallback(
    (updater: (current: SiteContent) => SiteContent) => {
      setDraft((current) => updater(current));
    },
    [],
  );

  const save = useCallback(async () => {
    if (saving) return false;
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || `API ${response.status}`);
      }
      const next = normalizeContent(
        mergeContent(defaultContent, payload.content),
      );
      setPublished(next);
      setDraft(next);
      setSavedJson(JSON.stringify(next));
      setUpdatedAt(payload.updatedAt ?? null);
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("gg-content");
        channel.postMessage({ type: "content-updated" });
        channel.close();
      }
      notify("Cambios guardados. La web ya los muestra.");
      return true;
    } catch (cause) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron guardar los cambios.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, notify, saving]);

  const value = useMemo<SiteContextValue>(
    () => ({
      data: editing ? draft : published,
      loading,
      error,
      updatedAt,
      refresh,
      editing,
      dirty,
      saving,
      saveError,
      toast,
      startEditing,
      stopEditing,
      updateDraft,
      save,
      notify,
      clearSaveError: () => setSaveError(null),
    }),
    [
      editing,
      draft,
      published,
      loading,
      error,
      updatedAt,
      refresh,
      dirty,
      saving,
      saveError,
      toast,
      startEditing,
      stopEditing,
      updateDraft,
      save,
      notify,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite debe usarse dentro de SiteProvider");
  return value;
}

function isRelativePath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

export function safeUrl(url: string | undefined, fallback = "#"): string {
  if (!url) return fallback;
  if (isRelativePath(url)) return url;
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) return url;
  } catch {
    /* URL inválida */
  }
  return fallback;
}

export function isSafeUrl(url: string): boolean {
  if (!url) return true;
  if (isRelativePath(url)) return true;
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Solo rutas locales de /uploads o URLs http(s). Nunca javascript: ni data:. */
export function safeImageUrl(url: string | undefined): string {
  if (!url) return "";
  if (isRelativePath(url)) return url;
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol)) return url;
  } catch {
    /* URL inválida */
  }
  return "";
}
