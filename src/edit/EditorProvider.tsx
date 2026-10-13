import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSite } from "../lib/site";
import {
  EditorContext,
  type AuthState,
  type EditorContextValue,
} from "./EditorContext";
import { EditorUI } from "./EditorUI";
import type { EditorTarget, ImageRequest } from "./types";

function removeEditQuery() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("edit")) return;
  url.searchParams.delete("edit");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", next || "/");
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const {
    editing,
    dirty,
    startEditing,
    stopEditing,
    notify,
  } = useSite();
  const [auth, setAuth] = useState<AuthState>("checking");
  const [gateOpen, setGateOpen] = useState(false);
  const [target, setTarget] = useState<EditorTarget | null>(null);
  const [imageRequest, setImageRequest] = useState<ImageRequest | null>(null);
  const autoOpened = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((payload) => {
        if (alive) setAuth(payload?.authenticated ? "in" : "out");
      })
      .catch(() => {
        if (alive) setAuth("out");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-editing", editing);
  }, [editing]);

  useEffect(() => {
    if (editing) return;
    setTarget(null);
    setImageRequest(null);
  }, [editing]);

  /*
   * ?edit=1 (y la antigua ruta /config, que redirige aquí) abre el acceso
   * o entra directamente si la sesión sigue viva.
   */
  useEffect(() => {
    if (autoOpened.current || auth === "checking") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") !== "1") return;
    autoOpened.current = true;
    if (auth === "in") {
      startEditing();
    } else {
      setGateOpen(true);
    }
  }, [auth, startEditing]);

  useEffect(() => {
    if (!gateOpen || auth !== "in") return;
    setGateOpen(false);
    startEditing();
  }, [auth, gateOpen, startEditing]);

  const requestEdit = useCallback(() => {
    if (auth === "in") {
      startEditing();
      return;
    }
    setGateOpen(true);
  }, [auth, startEditing]);

  const authenticated = useCallback(() => {
    setAuth("in");
    setGateOpen(false);
    startEditing();
    notify("Acceso verificado. Modo edición activado.");
  }, [notify, startEditing]);

  const closeGate = useCallback(() => {
    setGateOpen(false);
    removeEditQuery();
  }, []);

  const exit = useCallback(() => {
    if (
      dirty &&
      !window.confirm(
        "Tienes cambios sin guardar. ¿Salir del modo edición y descartarlos?",
      )
    ) {
      return;
    }
    stopEditing();
    setTarget(null);
    setImageRequest(null);
    removeEditQuery();
    notify(
      dirty
        ? "Has salido del modo edición. Los cambios sin guardar se han descartado."
        : "Has salido del modo edición.",
    );
  }, [dirty, notify, stopEditing]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setAuth("out");
    stopEditing();
    setTarget(null);
    setImageRequest(null);
    setGateOpen(false);
    removeEditQuery();
    notify("Sesión cerrada.");
  }, [notify, stopEditing]);

  const open = useCallback(
    (next: EditorTarget) => {
      if (!editing) return;
      setTarget(next);
    },
    [editing],
  );

  const close = useCallback(() => setTarget(null), []);

  const requestImage = useCallback(
    (request: ImageRequest) => {
      if (!editing) return;
      setImageRequest(request);
    },
    [editing],
  );

  const closeImage = useCallback(() => setImageRequest(null), []);

  const value = useMemo<EditorContextValue>(
    () => ({
      editing,
      target,
      open,
      close,
      requestImage,
      requestEdit,
      exit,
      logout,
      auth,
      gateOpen,
      closeGate,
      authenticated,
      imageRequest,
      closeImage,
    }),
    [
      editing,
      target,
      open,
      close,
      requestImage,
      requestEdit,
      exit,
      logout,
      auth,
      gateOpen,
      closeGate,
      authenticated,
      imageRequest,
      closeImage,
    ],
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
      <EditorUI />
    </EditorContext.Provider>
  );
}
