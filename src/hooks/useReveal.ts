import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-reveal]";

/**
 * Revela los bloques marcados con data-reveal cuando entran en pantalla.
 *
 * El contenido no es estático: la API añade proyectos después del primer
 * render, el editor crea tarjetas nuevas y el cambio de idioma remonta
 * algunos nodos. Por eso, además de observar lo que ya existe, vigilamos
 * el DOM y registramos los elementos que aparezcan más tarde. Sin esto,
 * cualquier nodo nuevo se quedaba con opacity: 0 para siempre.
 */
export function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!("IntersectionObserver" in window) || reduce) {
      document
        .querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
        .forEach((element) => element.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    const register = (element: HTMLElement) => {
      if (element.classList.contains("is-in")) return;
      observer.observe(element);
    };

    const scan = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(REVEAL_SELECTOR)) {
        register(root);
      }
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(register);
    };

    scan(document);

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            scan(node as HTMLElement);
          }
        });
      });
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);
}
