import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  TorusKnotGeometry,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function HeroObject() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    /*
     * Nudo de toro (2, 3): una forma escultórica, cerrada y claramente
     * volumétrica. Mucho más legible que la cinta anterior, que se veía
     * como una lámina cuando giraba de canto.
     */
    const geometry = new TorusKnotGeometry(1.05, 0.21, 360, 64, 2, 3);
    const material = new MeshPhysicalMaterial({
      color: 0x3d4352,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      iridescence: 1,
      iridescenceIOR: 1.8,
      iridescenceThicknessMinimum: 120,
      iridescenceThicknessMaximum: 620,
      envMapIntensity: 1.35,
    });
    const mesh = new Mesh(geometry, material);

    const group = new Group();
    group.add(mesh);
    group.rotation.set(-0.2, 0.3, 0.12);
    scene.add(group);

    const key = new DirectionalLight(0xffffff, 2.8);
    key.position.set(4, 6, 6);
    scene.add(key);

    const lime = new PointLight(0xc9f26b, 55, 22, 2);
    lime.position.set(4, 3, 4);
    scene.add(lime);

    const coral = new PointLight(0xff7a66, 45, 22, 2);
    coral.position.set(-4, -3, 3);
    scene.add(coral);

    const sky = new PointLight(0x82c7ff, 50, 22, 2);
    sky.position.set(0, 4, -5);
    scene.add(sky);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let pageVisible = !document.hidden;
    let inView = true;

    /*
     * El bucle se detiene por completo cuando la pestaña está oculta o el
     * objeto sale de pantalla, y se limita a 30 fps: la oscilación es lenta
     * y no necesita 60 para verse igual de fluida en equipos modestos.
     */
    let raf = 0;
    let running = false;
    let lastFrame = 0;
    const startedAt = performance.now();

    const start = () => {
      if (reduce || running || !inView || !pageVisible) return;
      running = true;
      lastFrame = 0;
      raf = requestAnimationFrame(animate);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    function animate(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      if (now - lastFrame < 1000 / 30) return;
      lastFrame = now;

      const t = (now - startedAt) / 1000;
      /*
       * Oscilación lenta en vez de giro completo: el nudo siempre
       * muestra su volumen y nunca se queda de canto como una hoja.
       */
      group.rotation.y = 0.3 + Math.sin(t * 0.24) * 0.25 + pointer.x * 0.1;
      group.rotation.x = -0.2 + Math.sin(t * 0.18) * 0.08 + pointer.y * 0.05;
      group.rotation.z = 0.12 + Math.sin(t * 0.14) * 0.05;

      renderer.render(scene, camera);
    }

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          if (reduce) renderer.render(scene, camera);
          else start();
        } else {
          stop();
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(mount);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    start();

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="hero__object-canvas" ref={mountRef} />;
}
