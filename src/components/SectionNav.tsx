export interface SectionNavItem {
  id: string;
  label: string;
  index: string;
}

interface Props {
  items: SectionNavItem[];
  active: number;
  onGo: (index: number) => void;
}

export function SectionNav({ items, active, onGo }: Props) {
  return (
    <nav className="section-nav" aria-label="Secciones / Sections">
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={`section-nav__item${
                active === index ? " is-active" : ""
              }`}
              aria-current={active === index ? "true" : undefined}
              onClick={() => onGo(index)}
            >
              <span className="section-nav__index">{item.index}</span>
              <span className="section-nav__label">{item.label}</span>
              <span className="section-nav__dot" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <p className="section-nav__count" aria-hidden="true">
        {String(active + 1).padStart(2, "0")} /{" "}
        {String(items.length).padStart(2, "0")}
      </p>
    </nav>
  );
}
