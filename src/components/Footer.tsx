import { lazy, Suspense, useEffect, useState } from "react";
import { useLang } from "../lib/lang";
import { formatMadridTime } from "../lib/time";
import { scrollToBlock } from "../lib/scroll";
import { useEditor } from "../edit/EditorContext";

const loadMadeOfModal = () => import("./MadeOfModal");
const MadeOfModal = lazy(() =>
  loadMadeOfModal().then((module) => ({ default: module.MadeOfModal })),
);

function useMadridTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () => formatMadridTime();

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 20_000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function Footer() {
  const { lang, t } = useLang();
  const { editing, requestEdit, open } = useEditor();
  const time = useMadridTime();
  const [madeOpen, setMadeOpen] = useState(false);
  const madeLabel = lang === "es" ? "Cómo está hecha" : "How it's built";

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer__group">
          <p className="footer__note">{t.footer.rights}</p>
          <p className="footer__note">{t.footer.built}</p>

          <button
            type="button"
            className="footer__made"
            aria-haspopup="dialog"
            onClick={() => setMadeOpen(true)}
            onPointerEnter={() => void loadMadeOfModal()}
            onFocus={() => void loadMadeOfModal()}
            data-cursor
            data-cursor-label={madeLabel}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="2"
                y="2"
                width="5"
                height="5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <rect
                x="9"
                y="2"
                width="5"
                height="5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <rect
                x="2"
                y="9"
                width="5"
                height="5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <path
                d="M9 11.5h5M11.5 9v5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
            {madeLabel}
            <span className="footer__made-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        </div>

        <div className="footer__group">
          <p className="footer__note">
            Valencia · <span className="footer__clock">{time || "—"}</span>
          </p>
          <p className="footer__note">{t.footer.stackNote}</p>

          {editing ? (
            <button
              type="button"
              className="footer__edit"
              onClick={() => open({ kind: "texts", group: "footer" })}
            >
              Editar pie
            </button>
          ) : (
            <button
              type="button"
              className="footer__edit"
              onClick={requestEdit}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect
                  x="3.2"
                  y="7"
                  width="9.6"
                  height="6.4"
                  rx="1.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              Editar esta web
            </button>
          )}

          <button
            type="button"
            className="footer__top"
            onClick={() => scrollToBlock("top")}
            data-cursor
            data-cursor-label={t.footer.backTop}
          >
            {t.footer.backTop} <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>

      {madeOpen && (
        <Suspense fallback={null}>
          <MadeOfModal onClose={() => setMadeOpen(false)} />
        </Suspense>
      )}
    </footer>
  );
}
