import { useEffect, useRef } from "react";

/**
 * Campo de líneas generativo. 2D canvas, sin dependencias.
 * Se pausa fuera de pantalla, con la pestaña oculta y con reduced-motion.
 *
 * El puntero deforma las líneas a su alrededor, deja un halo de luz y
 * gana intensidad mientras más rápido se mueve el ratón.
 */
export function FlowField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = {
      x: 0.5,
      y: 0.5,
      tx: 0.5,
      ty: 0.5,
      presence: 0,
      targetPresence: 0,
      energy: 0,
    };

    let width = 0;
    let height = 0;
    let raf = 0;
    let onScreen = true;
    let running = false;

    function draw(time: number) {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const px = pointer.x * width;
      const py = pointer.y * height;
      const reach = Math.max(220, Math.min(width, height) * 0.46);
      const presence = pointer.presence;
      const power = 1 + pointer.energy * 1.35;

      /* Halo que sigue al cursor: hace evidente dónde está actuando. */
      if (presence > 0.01) {
        const halo = ctx.createRadialGradient(px, py, 0, px, py, reach);
        halo.addColorStop(
          0,
          `rgba(230, 195, 106, ${(0.2 * presence).toFixed(3)})`,
        );
        halo.addColorStop(
          0.42,
          `rgba(130, 199, 255, ${(0.08 * presence).toFixed(3)})`,
        );
        halo.addColorStop(1, "rgba(130, 199, 255, 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(px - reach, py - reach, reach * 2, reach * 2);
      }

      const count = Math.max(24, Math.min(58, Math.round(height / 17)));
      const gap = height / count;

      for (let i = 0; i < count; i += 1) {
        const base = gap * i + gap * 0.5;
        ctx.beginPath();

        for (let x = 0; x <= width; x += 6) {
          const nx = x / width;
          const dx = x - px;
          const dy = base - py;
          const dist = Math.hypot(dx, dy);
          const near =
            Math.exp(-Math.pow(dist / (reach * 0.55), 2)) *
            presence *
            power;

          const amplitude = 5 + 11 * Math.sin(i * 0.42 + 0.8);
          const wave =
            Math.sin(nx * 3.3 + time * 0.00013 + i * 0.22) * amplitude;
          const bulge =
            Math.exp(-Math.pow((nx - pointer.x) * 2.1, 2)) *
            (pointer.y - 0.5) *
            230 *
            power;
          const pull = -dy * near * 0.6;
          const ripple = near * Math.sin(time * 0.003 - dist * 0.022) * 24;
          const y = base + wave + bulge + pull + ripple;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const nearLine =
          Math.exp(-Math.pow((base - py) / (height * 0.2), 2)) *
          presence *
          power;
        const alpha =
          0.035 +
          0.075 * (0.5 + 0.5 * Math.sin(i * 0.33 + time * 0.0002)) +
          nearLine * 0.2;
        const palette = [
          [230, 195, 106],
          [130, 199, 255],
          [255, 122, 102],
        ];
        const [r, g, b] = palette[i % palette.length];
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(alpha, 0.34).toFixed(3)})`;
        ctx.lineWidth = 1 + nearLine * 0.9;
        ctx.stroke();
      }
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw(0);
    }

    function loop(time: number) {
      pointer.x += (pointer.tx - pointer.x) * 0.075;
      pointer.y += (pointer.ty - pointer.y) * 0.075;
      pointer.presence +=
        (pointer.targetPresence - pointer.presence) * 0.06;
      pointer.energy *= 0.94;
      draw(time);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduce || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function onPointerMove(event: PointerEvent) {
      const nx = event.clientX / window.innerWidth;
      const ny = event.clientY / window.innerHeight;
      const travel = Math.hypot(nx - pointer.tx, ny - pointer.ty);
      pointer.energy = Math.min(1, pointer.energy + travel * 5);
      pointer.tx = nx;
      pointer.ty = ny;
      pointer.targetPresence = 1;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) draw(0);
    else start();

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
