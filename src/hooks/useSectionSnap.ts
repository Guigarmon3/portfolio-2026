import { useCallback, useEffect, useRef, useState } from "react";
import { SCROLL_EVENT } from "../lib/scroll";

const BLOCK_SELECTOR = "[data-block]";

function easeInOutQuint(value: number) {
  return value < 0.5
    ? 16 * value * value * value * value * value
    : 1 - Math.pow(-2 * value + 2, 5) / 2;
}

function animateScrollTo(
  target: number,
  duration: number,
  onDone: () => void,
) {
  const start = window.scrollY;
  const distance = target - start;
  if (Math.abs(distance) < 2) {
    onDone();
    return () => undefined;
  }

  const startedAt = performance.now();
  let raf = 0;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    window.scrollTo(0, start + distance * easeInOutQuint(progress));
    if (progress < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      onDone();
    }
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export function useSectionSnap(paused = false) {
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const blocksRef = useRef<HTMLElement[]>([]);
  const activeRef = useRef(0);
  const enabledRef = useRef(false);
  const lockRef = useRef(false);
  const lastNavRef = useRef(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const measureRaf = useRef(0);
  const wheelAccumRef = useRef(0);
  const wheelLastRef = useRef(0);
  const idleRef = useRef(0);

  const setActiveIndex = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const blocks = blocksRef.current;
      if (!blocks.length) return;
      const target = Math.max(0, Math.min(blocks.length - 1, index));
      const block = blocks[target];
      if (!block) return;

      cancelRef.current?.();
      wheelAccumRef.current = 0;
      lockRef.current = true;
      lastNavRef.current = performance.now();
      cancelRef.current = animateScrollTo(block.offsetTop, 880, () => {
        lockRef.current = false;
        cancelRef.current = null;
        setActiveIndex(target);
      });
      setActiveIndex(target);
    },
    [setActiveIndex],
  );

  useEffect(() => {
    const measure = () => {
      const blocks = Array.from(
        document.querySelectorAll<HTMLElement>(BLOCK_SELECTOR),
      );
      blocksRef.current = blocks;
      if (!blocks.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia(
        "(min-width: 1024px) and (min-height: 700px) and (pointer: fine)",
      ).matches;
      const fits = blocks.every(
        (block) => block.offsetHeight <= window.innerHeight + 2,
      );
      const nextEnabled = desktop && fits && !reduce && !paused;

      enabledRef.current = nextEnabled;
      setEnabled(nextEnabled);
      document.documentElement.classList.toggle("snap-on", nextEnabled);

      const y = window.scrollY + window.innerHeight * 0.35;
      let index = 0;
      blocks.forEach((block, i) => {
        if (block.offsetTop <= y) index = i;
      });
      setActiveIndex(index);
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(measureRaf.current);
      measureRaf.current = requestAnimationFrame(measure);
    };

    measure();

    const snapToNearest = () => {
      const blocks = blocksRef.current;
      if (!blocks.length) return;
      const y = window.scrollY;
      let nearest = 0;
      let distance = Infinity;
      blocks.forEach((block, i) => {
        const delta = Math.abs(block.offsetTop - y);
        if (delta < distance) {
          distance = delta;
          nearest = i;
        }
      });
      if (distance > 3) goTo(nearest);
    };

    let scrollRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const blocks = blocksRef.current;
        if (!blocks.length) return;
        /*
         * Mientras dura el salto animado no recalculamos el activo:
         * si no, el menú lateral parpadea entre el bloque de origen y
         * el de destino hasta que termina el scroll.
         */
        if (lockRef.current) return;
        const y = window.scrollY + window.innerHeight * 0.35;
        let index = 0;
        blocks.forEach((block, i) => {
          if (block.offsetTop <= y) index = i;
        });
        if (index !== activeRef.current) setActiveIndex(index);

        if (!enabledRef.current || lockRef.current) return;
        window.clearTimeout(idleRef.current);
        idleRef.current = window.setTimeout(() => {
          if (!lockRef.current) snapToNearest();
        }, 180);
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (!enabledRef.current) return;
      if (
        document.documentElement.classList.contains("is-locked") ||
        document.documentElement.classList.contains("is-loading")
      ) {
        return;
      }

      /*
       * Bloqueo total del scroll libre. Las ruedas de ratón y los trackpads
       * acumulan delta; cuando el gesto supera el umbral se salta un bloque
       * entero. Nunca se queda a mitad entre dos secciones.
       */
      event.preventDefault();

      const now = performance.now();
      if (now - wheelLastRef.current > 220) wheelAccumRef.current = 0;
      wheelLastRef.current = now;

      if (lockRef.current || now - lastNavRef.current < 1050) {
        wheelAccumRef.current = 0;
        return;
      }

      wheelAccumRef.current += event.deltaY;
      if (Math.abs(wheelAccumRef.current) < 34) return;

      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      goTo(activeRef.current + direction);
    };

    const onKey = (event: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (document.documentElement.classList.contains("is-locked")) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const keys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        " ",
        "Home",
        "End",
      ];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      if (event.key === "Home") {
        goTo(0);
        return;
      }
      if (event.key === "End") {
        goTo(blocksRef.current.length - 1);
        return;
      }
      if (lockRef.current) return;
      const forward = event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";
      goTo(activeRef.current + (forward ? 1 : -1));
    };

    const onRequest = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const blocks = blocksRef.current;
      const index = blocks.findIndex((block) => block.id === id);
      if (index < 0) return;

      if (enabledRef.current) {
        goTo(index);
      } else {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        blocks[index]?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    blocksRef.current.forEach((block) => resizeObserver.observe(block));
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener(SCROLL_EVENT, onRequest);

    return () => {
      cancelAnimationFrame(measureRaf.current);
      cancelAnimationFrame(scrollRaf);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SCROLL_EVENT, onRequest);
      cancelRef.current?.();
      document.documentElement.classList.remove("snap-on");
    };
  }, [goTo, paused, setActiveIndex]);

  return { active, enabled, goTo };
}
