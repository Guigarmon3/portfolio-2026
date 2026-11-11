import { useEffect, useRef } from "react";

/**
 * Campo de líneas generativo. 2D canvas, sin dependencias.
 *
 * En reposo el dibujo está completamente quieto: solo reacciona (de forma
 * suave) cuando el puntero se mueve, y se queda con el halo de luz alrededor
 * del cursor. Se pausa con la pestaña oculta y con reduced-motion.
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
    };

    let width = 0;
    let height = 0;
    let raf = 0;
    let onScreen = true;
    let running = false;

    function draw() {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const px = pointer.x * width;
      const py = pointer.y * height;
      const reach = Math.max(200, Math.min(width, height) * 0.42);
      const presence = pointer.presence;

      /* Halo suave que acompaña al cursor. */
      if (presence > 0.01) {
        const halo = ctx.createRadialGradient(px, py, 0, px, py, reach);
        halo.addColorStop(
          0,
          `rgba(230, 195, 106, ${(0.12 * presence).toFixed(3)})`,
        );
        halo.addColorStop(
          0.45,
          `rgba(130, 199, 255, ${(0.05 * presence).toFixed(3)})`,
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
            Math.exp(-Math.pow(dist / (reach * 0.62), 2)) * presence;

          const amplitude = 5 + 11 * Math.sin(i * 0.42 + 0.8);
          const wave = Math.sin(nx * 3.3 + i * 0.22) * amplitude;
          const bulge =
            Math.exp(-Math.pow((nx - pointer.x) * 2.4, 2)) *
            (pointer.y - 0.5) *
            90 *
            presence;
          const pull = -dy * near * 0.22;
          const y = base + wave + bulge + pull;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const nearLine =
          Math.exp(-Math.pow((base - py) / (height * 0.2), 2)) * presence;
        const alpha =
          0.035 +
          0.075 * (0.5 + 0.5 * Math.sin(i * 0.33)) +
          nearLine * 0.12;
        const palette = [
          [230, 195, 106],
          [130, 199, 255],
          [255, 122, 102],
        ];
        const [r, g, b] = palette[i % palette.length];
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(alpha, 0.25).toFixed(3)})`;
        ctx.lineWidth = 1 + nearLine * 0.5;
        ctx.stroke();
      }
    }

    function loop() {
      const dx = pointer.tx - pointer.x;
      const dy = pointer.ty - pointer.y;
      const dp = pointer.targetPresence - pointer.presence;

      pointer.x += dx * 0.18;
      pointer.y += dy * 0.18;
      pointer.presence += dp * 0.14;

      draw();

      /* El bucle se apaga cuando el puntero y el brillo ya han llegado. */
      if (
        Math.abs(dx) > 0.0004 ||
        Math.abs(dy) > 0.0004 ||
        Math.abs(dp) > 0.004
      ) {
        raf = requestAnimationFrame(loop);
      } else {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.presence = pointer.targetPresence;
        draw();
        running = false;
      }
    }

    function requestFrame() {
      if (reduce || !onScreen || document.hidden || running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
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
      draw();
    }

    function onPointerMove(event: PointerEvent) {
      pointer.tx = event.clientX / window.innerWidth;
      pointer.ty = event.clientY / window.innerHeight;
      pointer.targetPresence = 1;
      requestFrame();
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
      } else {
        requestFrame();
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) requestFrame();
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
