import { useId, type ReactNode } from "react";
import type { L, LList } from "../data/content";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "email" | "url" | "color";
  mono?: boolean;
  onBlur?: () => void;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
  rows = 3,
  type = "text",
  mono = false,
  onBlur,
}: FieldProps) {
  const id = useId();
  return (
    <div className={`cfg-field${mono ? " cfg-field--mono" : ""}`}>
      <label className="cfg-field__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="cfg-input cfg-input--area"
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <input
          id={id}
          className={`cfg-input${type === "color" ? " cfg-input--color" : ""}`}
          type={type}
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
      {hint ? <span className="cfg-field__hint">{hint}</span> : null}
    </div>
  );
}

export function BiField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  value: L;
  onChange: (value: L) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="cfg-field cfg-field--bi">
      <span className="cfg-field__label">{label}</span>
      <div className="cfg-bi">
        <label className="cfg-bi__cell">
          <span className="cfg-bi__tag">ES</span>
          {multiline ? (
            <textarea
              className="cfg-input cfg-input--area"
              rows={rows}
              value={value.es}
              onChange={(event) => onChange({ ...value, es: event.target.value })}
            />
          ) : (
            <input
              className="cfg-input"
              value={value.es}
              onChange={(event) => onChange({ ...value, es: event.target.value })}
            />
          )}
        </label>
        <label className="cfg-bi__cell">
          <span className="cfg-bi__tag">EN</span>
          {multiline ? (
            <textarea
              className="cfg-input cfg-input--area"
              rows={rows}
              value={value.en}
              onChange={(event) => onChange({ ...value, en: event.target.value })}
            />
          ) : (
            <input
              className="cfg-input"
              value={value.en}
              onChange={(event) => onChange({ ...value, en: event.target.value })}
            />
          )}
        </label>
      </div>
      {hint ? <span className="cfg-field__hint">{hint}</span> : null}
    </div>
  );
}

export function BiListField({
  label,
  value,
  onChange,
  hint = "Un elemento por línea.",
}: {
  label: string;
  value: LList;
  onChange: (value: LList) => void;
  hint?: string;
}) {
  const clean = (lines: string[]) =>
    lines.map((line) => line.trim()).filter(Boolean);

  return (
    <div className="cfg-field cfg-field--bi">
      <span className="cfg-field__label">{label}</span>
      <div className="cfg-bi">
        <label className="cfg-bi__cell">
          <span className="cfg-bi__tag">ES</span>
          <textarea
            className="cfg-input cfg-input--area"
            rows={Math.max(3, value.es.length + 1)}
            value={value.es.join("\n")}
            onChange={(event) =>
              onChange({ ...value, es: event.target.value.split("\n") })
            }
            onBlur={() => onChange({ ...value, es: clean(value.es) })}
          />
        </label>
        <label className="cfg-bi__cell">
          <span className="cfg-bi__tag">EN</span>
          <textarea
            className="cfg-input cfg-input--area"
            rows={Math.max(3, value.en.length + 1)}
            value={value.en.join("\n")}
            onChange={(event) =>
              onChange({ ...value, en: event.target.value.split("\n") })
            }
            onBlur={() => onChange({ ...value, en: clean(value.en) })}
          />
        </label>
      </div>
      <span className="cfg-field__hint">{hint}</span>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="cfg-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="cfg-toggle__track" aria-hidden="true">
        <span className="cfg-toggle__thumb" />
      </span>
      <span className="cfg-toggle__text">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <div className="cfg-field">
      <span className="cfg-field__label">{label}</span>
      <div className="cfg-seg" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`cfg-seg__btn${value === option.value ? " is-active" : ""}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {hint ? <span className="cfg-field__hint">{hint}</span> : null}
    </div>
  );
}

export function Card({
  title,
  eyebrow,
  description,
  children,
  actions,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="cfg-card">
      <header className="cfg-card__head">
        <div>
          {eyebrow ? <p className="cfg-card__eyebrow">{eyebrow}</p> : null}
          <h2 className="cfg-card__title">{title}</h2>
          {description ? (
            <p className="cfg-card__desc">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="cfg-card__actions">{actions}</div> : null}
      </header>
      <div className="cfg-card__body">{children}</div>
    </section>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="cfg-row">{children}</div>;
}
