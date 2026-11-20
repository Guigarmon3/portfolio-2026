import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { madeOf } from "../data/madeOf";
import { useLang } from "../lib/lang";
import { useDialog } from "../hooks/useDialog";
import { PixelStar } from "./Decor";

interface Props {
  onClose: () => void;
}

const ACCENT = "#c9f26b";
const ACCENT_RGB = "201, 242, 107";

export function MadeOfModal({ onClose }: Props) {
  const { lang } = useLang();
  const rootRef = useDialog<HTMLDivElement>(onClose, {
    initialFocus: ".modal__close",
  });

  const copy = madeOf;
  const stampLabel =
    lang === "es" ? "Ficha rápida del caso" : "Quick case file summary";

  return createPortal(
    <div
      className="modal modal--made-of"
      role="dialog"
      aria-modal="true"
      aria-labelledby="madeof-title"
      aria-describedby="madeof-lede"
      tabIndex={-1}
      ref={rootRef}
      style={
        {
          "--p-accent": ACCENT,
          "--p-accent-rgb": ACCENT_RGB,
        } as CSSProperties
      }
    >
      <div className="modal__noise" aria-hidden="true" />

      <div className="modal__inner">
        <div className="modal__bar">
          <p className="mono modal__kicker">
            <span className="modal__accent" aria-hidden="true" />
            {copy.kicker[lang]}
          </p>
          <div className="modal__bar-actions">
            <span className="mono madeof__bar-note" aria-hidden="true">
              GG · 2026
            </span>
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              data-cursor
              data-cursor-label={copy.close[lang]}
            >
              {copy.close[lang]}
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </button>
          </div>
        </div>

        <header className="madeof__hero">
          <div className="madeof__hero-copy">
            <p className="pixel-label madeof__eyebrow">{copy.eyebrow[lang]}</p>
            <h2 className="madeof__title" id="madeof-title">
              {copy.title.lead[lang]}{" "}
              <em>{copy.title.accent[lang]}</em>
            </h2>
            <p className="madeof__lede" id="madeof-lede">
              {copy.lede[lang]}
            </p>
          </div>

          <aside className="madeof__stamp" aria-label={stampLabel}>
            <PixelStar className="madeof__stamp-star" />
            <p className="mono madeof__stamp-top">{copy.stamp.top[lang]}</p>
            <p className="madeof__stamp-number" aria-hidden="true">
              {copy.stamp.number}
            </p>
            <p className="mono madeof__stamp-meta">{copy.stamp.meta[lang]}</p>
            <p className="madeof__stamp-status">
              <span aria-hidden="true" />
              {copy.stamp.status[lang]}
            </p>
          </aside>
        </header>

        <dl className="madeof__meta">
          {copy.meta.map((item) => (
            <div key={item.label[lang]}>
              <dt className="mono">{item.label[lang]}</dt>
              <dd>{item.value[lang]}</dd>
            </div>
          ))}
        </dl>

        <section
          className="madeof__block madeof__map-block"
          aria-labelledby="madeof-map-title"
        >
          <div className="madeof__block-head">
            <p className="pixel-label">{copy.map.label[lang]}</p>
            <h3 className="madeof__block-title" id="madeof-map-title">
              {copy.map.title[lang]}
            </h3>
            <p className="madeof__block-copy">{copy.map.caption[lang]}</p>
          </div>

          <div className="madeof__map">
            {copy.map.columns.map((column) => (
              <article
                className="madeof__column"
                key={column.id}
                aria-labelledby={`madeof-col-${column.id}`}
              >
                <header className="madeof__column-head">
                  <span className="mono madeof__column-index">
                    {column.index}
                  </span>
                  <h4 className="madeof__column-title" id={`madeof-col-${column.id}`}>
                    {column.title[lang]}
                  </h4>
                  <p className="mono madeof__column-caption">
                    {column.caption[lang]}
                  </p>
                  <p className="mono madeof__column-meta">{column.meta[lang]}</p>
                </header>

                <ul className="madeof__nodes">
                  {column.nodes.map((node) => (
                    <li className="madeof__node" key={node.name[lang]}>
                      <span className="madeof__node-dot" aria-hidden="true" />
                      <span className="madeof__node-name">{node.name[lang]}</span>
                      <span className="madeof__node-meta">{node.meta[lang]}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}

            <p className="madeof__flow" aria-hidden="true">
              {copy.map.flow.map((step, index) => (
                <span className="madeof__flow-step" key={step}>
                  {index > 0 && (
                    <span className="madeof__flow-arrow">→</span>
                  )}
                  {step}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section
          className="madeof__chapters"
          aria-label={lang === "es" ? "El caso, por partes" : "The case, in parts"}
        >
          {copy.chapters.map((chapter) => (
            <article
              className="madeof__chapter"
              id={`madeof-${chapter.id}`}
              key={chapter.id}
            >
              <header className="madeof__chapter-head">
                <span className="mono madeof__chapter-index">
                  {chapter.index}
                </span>
                <p className="mono madeof__chapter-kicker">
                  {chapter.kicker[lang]}
                </p>
                <h3 className="madeof__chapter-title">{chapter.title[lang]}</h3>
              </header>

              <div className="madeof__chapter-body">
                {chapter.body[lang].map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {chapter.points && (
                  <ul className="madeof__points">
                    {chapter.points[lang].map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}

                {chapter.quote && (
                  <blockquote className="madeof__quote">
                    <p>{chapter.quote[lang]}</p>
                  </blockquote>
                )}

                {chapter.aside && (
                  <p className="madeof__aside">{chapter.aside[lang]}</p>
                )}
              </div>
            </article>
          ))}
        </section>

        <section
          className="madeof__specs"
          aria-labelledby="madeof-specs-title"
        >
          <div className="madeof__specs-head">
            <p className="pixel-label">{copy.specs.label[lang]}</p>
            <h3 id="madeof-specs-title">{copy.specs.title[lang]}</h3>
            <p>{copy.specs.note[lang]}</p>
          </div>

          <dl className="madeof__spec-grid">
            {copy.specs.items.map((item) => (
              <div key={item.label[lang]}>
                <dt className="mono">{item.label[lang]}</dt>
                <dd>{item.value[lang]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="madeof__colophon">
          <PixelStar className="madeof__colophon-star" />
          <p className="pixel-label madeof__colophon-label">
            {copy.colophon.label[lang]}
          </p>
          <h3 className="madeof__colophon-title">
            {copy.colophon.title[lang]}
          </h3>
          <p className="madeof__colophon-body">
            {copy.colophon.body[lang]}
          </p>

          <dl className="madeof__credits">
            {copy.colophon.credits.map((credit) => (
              <div key={credit.label[lang]}>
                <dt className="mono">{credit.label[lang]}</dt>
                <dd>{credit.value[lang]}</dd>
              </div>
            ))}
          </dl>

          <p className="mono madeof__links-label">{copy.links.label[lang]}</p>
          <div className="madeof__actions">
            {copy.links.items.map((link) => (
              <a
                className={`modal__link${link.primary ? " is-primary" : ""}`}
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                data-cursor-label={link.label[lang]}
              >
                {link.label[lang]}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
            <button
              type="button"
              className="madeof__back"
              onClick={onClose}
              data-cursor
              data-cursor-label={copy.colophon.close[lang]}
            >
              {copy.colophon.close[lang]}
              <span aria-hidden="true">↑</span>
            </button>
          </div>

          <p className="madeof__fineprint">{copy.colophon.note[lang]}</p>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
