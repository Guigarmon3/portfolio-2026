import { useEffect, useRef } from "react";

/**
 * Campo de líneas generativo. 2D canvas, sin dependencias.
 * Se pausa fuera de pantalla, con la pestaña oculta y con reduced-motion.
 */
export function FlowField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    let width = 0;
    let height = 0;
    let raf = 0;
    let onScreen = true;
    let running = false;

    function draw(time: number) {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const count = Math.max(24, Math.min(54, Math.round(height / 17)));
      const gap = height / count;

      for (let i = 0; i < count; i += 1) {
        const base = gap * i + gap * 0.5;
        ctx.beginPath();

        for (let x = 0; x <= width; x += 6) {
          const nx = x / width;
          const amplitude = 5 + 11 * Math.sin(i * 0.42 + 0.8);
          const wave =
            Math.sin(nx * 3.3 + time * 0.00013 + i * 0.22) * amplitude;
          const bulge =
            Math.exp(-Math.pow((nx - pointer.x) * 2.4, 2)) *
            (pointer.y - 0.5) *
            130;
          const y = base + wave + bulge;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha =
          0.035 + 0.075 * (0.5 + 0.5 * Math.sin(i * 0.33 + time * 0.0002));
        const palette = [
          [230, 195, 106],
          [130, 199, 255],
          [255, 122, 102],
        ];
        const [r, g, b] = palette[i % palette.length];
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
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
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
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
      pointer.tx = event.clientX / window.innerWidth;
      pointer.ty = event.clientY / window.innerHeight;
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
