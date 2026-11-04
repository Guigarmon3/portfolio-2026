import { FlowField } from "./FlowField";

/**
 * Fondo generativo compartido. Al vivir en un contenedor fijo, el campo de
 * líneas, los brillos y la rejilla se extienden por todas las secciones sin
 * cortarse al cambiar de bloque.
 */
export function SiteBackdrop() {
  return (
    <div className="site-bg" aria-hidden="true">
      <div className="site-bg__field">
        <FlowField />
      </div>
      <div className="site-bg__glow" />
      <div className="site-bg__grid" />
    </div>
  );
}
