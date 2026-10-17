import { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  born: number;
  size: number;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const visibleRef = useRef(false);
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!canvas || !dot || !ring) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: width / 2, y: height / 2 };
    const points: TrailPoint[] = [];
    let raf = 0;
    let lastX = pointer.x;
    let lastY = pointer.y;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }

      const speed = Math.hypot(pointer.x - lastX, pointer.y - lastY);
      lastX = pointer.x;
      lastY = pointer.y;
      if (speed > 1.5) {
        points.push({
          x: pointer.x,
          y: pointer.y,
          born: performance.now(),
          size: Math.min(5.5, 2 + speed * 0.12),
        });
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]",
      );
      if (!target) return;
      const next = target.dataset.cursorLabel ?? "";
      setLabel(next);
      setActive(true);
    };

    const onOut = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]",
      );
      if (!target) return;
      const related = event.relatedTarget as HTMLElement | null;
      if (related && target.contains(related)) return;
      setLabel("");
      setActive(false);
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onEnter = () => {
      visibleRef.current = true;
      setVisible(true);
    };

    const draw = (now: number) => {
      /*
       * El aro va pegado al puntero, sin interpolación. Antes se quedaba
       * atrás al mover el ratón y se veía lejos al hacer clic.
       */
      const position = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      dot.style.transform = position;
      ring.style.transform = position;

      ctx.clearRect(0, 0, width, height);
      while (points.length && now - points[0].born > 280) points.shift();

      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        const age = (now - point.born) / 280;
        const alpha = Math.max(0, 1 - age) * 0.5;
        ctx.beginPath();
        ctx.fillStyle =
          i % 5 === 0
            ? `rgba(255, 122, 102, ${alpha.toFixed(3)})`
            : `rgba(230, 195, 106, ${alpha.toFixed(3)})`;
        ctx.arc(point.x, point.y, point.size * (1 - age * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("resize", resize);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      className={`cursor${visible ? " is-visible" : ""}${
        active ? " is-active" : ""
      }${pressed ? " is-pressed" : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="cursor__trail" />
      <div ref={ringRef} className="cursor__ring">
        <span ref={labelRef} className="cursor__label">
          {label}
        </span>
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
}
