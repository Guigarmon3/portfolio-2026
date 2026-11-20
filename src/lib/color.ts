/**
 * Convierte un color hexadecimal a canales "r, g, b" para poder usarlo con
 * rgba(var(--token-rgb), alfa). Es la alternativa compatible con navegadores
 * antiguos a color-mix(), que no existe en Firefox < 113 ni Chrome < 111.
 */
export function hexToRgbChannels(value: string): string {
  const hex = value.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  if (!/^[0-9a-f]{6}$/i.test(full)) return "230, 195, 106";

  const int = Number.parseInt(full, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}
