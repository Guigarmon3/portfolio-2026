import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface DialogOptions {
  /** Permite montar el hook aunque el diálogo todavía no esté abierto. */
  enabled?: boolean;
  /** Oculta #root a los lectores de pantalla mientras el diálogo está abierto. */
  hideRoot?: boolean;
  /** Selector del elemento que debe recibir el foco al abrir. */
  initialFocus?: string;
}

interface OpenDialog {
  id: symbol;
  node: HTMLElement;
}

/*
 * Estado compartido entre diálogos. El último en abrirse es el único que
 * responde a Escape y a Tab; los demás esperan. Así el selector de imágenes
 * no cierra también el drawer que tiene debajo.
 */
const openDialogs: OpenDialog[] = [];
let scrollLocks = 0;
let rootHides = 0;

function lockScroll() {
  if (scrollLocks === 0) {
    document.documentElement.classList.add("is-locked");
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) {
    document.documentElement.classList.remove("is-locked");
  }
}

function hideRoot() {
  if (rootHides === 0) {
    document.getElementById("root")?.setAttribute("aria-hidden", "true");
  }
  rootHides += 1;
}

function showRoot() {
  rootHides = Math.max(0, rootHides - 1);
  if (rootHides === 0) {
    document.getElementById("root")?.removeAttribute("aria-hidden");
  }
}

function getFocusable(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => {
      const style = window.getComputedStyle(element);
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        element.getClientRects().length > 0
      );
    },
  );
}

function isTopDialog(id: symbol): boolean {
  return openDialogs[openDialogs.length - 1]?.id === id;
}

/**
 * Comportamiento común de los diálogos: foco atrapado, Escape solo en el
 * diálogo superior, bloqueo del scroll y restauración del foco al cerrar.
 *
 * El efecto depende únicamente de si el diálogo está abierto, no de la
 * identidad de onClose, así que escribir en el editor no lo reinicia.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(
  onClose: () => void,
  { enabled = true, hideRoot: hideMainRoot = true, initialFocus }: DialogOptions = {},
) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const id = Symbol("dialog");
    const previousFocus = document.activeElement as HTMLElement | null;

    openDialogs.push({ id, node });
    lockScroll();

    const onKey = (event: KeyboardEvent) => {
      if (!isTopDialog(id)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = getFocusable(node);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      if (!active || !node.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? items[items.length - 1] : items[0]).focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    /*
     * Primero movemos el foco dentro del diálogo y después ocultamos #root:
     * Chrome ignora aria-hidden si el elemento enfocado sigue dentro.
     */
    if (!node.contains(document.activeElement)) {
      const preferred = initialFocus
        ? node.querySelector<HTMLElement>(initialFocus)
        : null;
      (preferred ?? getFocusable(node)[0] ?? node).focus();
    }

    if (hideMainRoot) hideRoot();

    return () => {
      document.removeEventListener("keydown", onKey);

      const index = openDialogs.findIndex((entry) => entry.id === id);
      if (index >= 0) openDialogs.splice(index, 1);
      if (hideMainRoot) showRoot();
      unlockScroll();

      /*
       * Si el diálogo ya movió el foco fuera (por ejemplo, el menú móvil
       * devuelve el foco a la hamburguesa antes de cerrarse), no lo pisamos
       * con la restauración automática.
       */
      const active = document.activeElement as HTMLElement | null;
      const focusMovedOut = Boolean(
        active &&
          active !== document.body &&
          !node.contains(active) &&
          document.contains(active),
      );
      if (focusMovedOut) return;

      const top = openDialogs[openDialogs.length - 1];
      if (top) {
        /*
         * Al cerrar un diálogo hijo, devolvemos el foco al disparador si
         * sigue dentro del diálogo padre; si no, al primer elemento suyo.
         */
        if (previousFocus && top.node.contains(previousFocus)) {
          previousFocus.focus();
        } else {
          (getFocusable(top.node)[0] ?? top.node).focus();
        }
        return;
      }

      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [enabled, hideMainRoot, initialFocus]);

  return ref;
}
