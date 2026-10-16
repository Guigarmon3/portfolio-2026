import { useLang } from "../lib/lang";
import { PixelStar } from "./Decor";

const ITEMS = {
  es: [
    "TypeScript",
    "React",
    "Java",
    "Node.js",
    "SQL",
    "Motion",
    "Detalle",
    "Jugar limpio",
  ],
  en: [
    "TypeScript",
    "React",
    "Java",
    "Node.js",
    "SQL",
    "Motion",
    "Detail",
    "Play fair",
  ],
};

/*
 * 8 copias idénticas. La animación mueve -25% del track, que equivale
 * exactamente a 2 grupos. Así el bucle es perfecto y quedan 6 grupos
 * de margen: nunca aparece un hueco ni en pantallas ultra anchas.
 */
const COPIES = Array.from({ length: 8 }, (_, index) => index);

export function Marquee() {
  const { lang } = useLang();
  const items = ITEMS[lang];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {COPIES.map((copyIndex) => (
          <div className="marquee__group" key={copyIndex}>
            {items.map((item) => (
              <span className="marquee__item" key={`${copyIndex}-${item}`}>
                {item}
                <PixelStar className="marquee__star" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
