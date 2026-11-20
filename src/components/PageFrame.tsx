/**
 * Marco técnico de la ventana: guías en los límites de la columna de contenido
 * y marcas de corte en las esquinas. Solo aparece en pantallas muy anchas.
 */
export function PageFrame() {
  return (
    <>
      <div className="content-guides" aria-hidden="true">
        <span className="content-guides__line content-guides__line--left" />
        <span className="content-guides__line content-guides__line--right" />
      </div>

      <div className="page-frame" aria-hidden="true">
        <span className="page-frame__corner page-frame__corner--tl" />
        <span className="page-frame__corner page-frame__corner--tr" />
        <span className="page-frame__corner page-frame__corner--bl" />
        <span className="page-frame__corner page-frame__corner--br" />
      </div>
    </>
  );
}
