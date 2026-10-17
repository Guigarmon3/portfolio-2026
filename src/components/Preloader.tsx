import { useEffect, useRef, useState } from "react";
import { PixelStar } from "./Decor";

interface Props {
  enabled?: boolean;
  onDone: () => void;
}

export function Preloader({ enabled = true, onDone }: Props) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadyLoaded = false;
    try {
      alreadyLoaded = sessionStorage.getItem("gg-loaded") === "1";
    } catch {
      alreadyLoaded = false;
    }

    if (!enabled || reduce || alreadyLoaded) {
      setCount(100);
      setDone(true);
      setHidden(true);
      doneRef.current();
      return;
    }

    document.documentElement.classList.add("is-loading");
    let raf = 0;
    let hideTimer = 0;
    const start = performance.now();
    const duration = 1250;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 100));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      try {
        sessionStorage.setItem("gg-loaded", "1");
      } catch {
        /* almacenamiento no disponible */
      }
      setDone(true);
      doneRef.current();
      hideTimer = window.setTimeout(() => {
        setHidden(true);
        document.documentElement.classList.remove("is-loading");
      }, 850);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      document.documentElement.classList.remove("is-loading");
    };
  }, [enabled]);

  if (hidden) return null;

  return (
    <div
      className={`preloader${done ? " is-done" : ""}`}
      aria-hidden={done}
      role="presentation"
    >
      <div className="preloader__top">
        <span className="pixel-label">
          <PixelStar />
          GG / SYSTEM BOOT
        </span>
        <span className="mono">2026</span>
      </div>

      <div className="preloader__center">
        <PixelStar className="preloader__star" />
        <p className="preloader__name">LOADING PLAYER 01</p>
        <p className="preloader__count" aria-label={`${count}%`}>
          {String(count).padStart(3, "0")}
        </p>
        <div className="preloader__bar" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={index}
              className={index / 20 < count / 100 ? "is-on" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="preloader__foot">
        <span className="mono">Guillermo García</span>
        <span className="mono">PORTFOLIO v2.0</span>
      </div>
    </div>
  );
}
