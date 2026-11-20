/**
 * Reloj de Madrid compartido. El formateador se crea una sola vez: antes se
 * instanciaba un `Intl.DateTimeFormat` nuevo cada 20-30 segundos en el hero y
 * en el pie, lo que tiene un coste innecesario en equipos modestos.
 */
const madridFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Madrid",
});

export function formatMadridTime(date: Date = new Date()): string {
  return madridFormatter.format(date);
}
