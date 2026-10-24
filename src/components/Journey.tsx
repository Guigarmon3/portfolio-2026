import { useLang } from "../lib/lang";
import { useSite } from "../lib/site";
import { scrollToBlock } from "../lib/scroll";
import { useEditor } from "../edit/EditorContext";
import { AddButton, EditBar, EditButton } from "../edit/controls";
import { blankJourney } from "../edit/factories";
import { PixelStar } from "./Decor";

type Collection = "experience" | "education";

export function Journey() {
  const { lang, t } = useLang();
  const { data, updateDraft } = useSite();
  const { open } = useEditor();

  const addEntry = (collection: Collection) => {
    const item = blankJourney(collection);
    updateDraft((draft) => ({
      ...draft,
      [collection]: [...draft[collection], item],
    }));
    open({ kind: "journey", collection, id: item.id });
  };

  return (
    <section
      className="block journey"
      id="journey"
      data-block
      aria-labelledby="journey-title"
    >
      <span className="block__ghost" aria-hidden="true">
        04
      </span>

      <div className="shell">
        <header className="block__head">
          <div className="block__head-main">
            <p className="pixel-label" data-reveal>
              {t.journey.label}
            </p>
            <h2 className="block__title" id="journey-title" data-reveal>
              {t.journey.title}
            </h2>
          </div>
          <p className="block__hint" data-reveal>
            {t.journey.nextText}
          </p>
        </header>

        <EditBar label="Trayectoria">
          <EditButton
            label="Textos de la sección"
            onClick={() => open({ kind: "texts", group: "journey" })}
          />
          <AddButton
            label="Añadir experiencia"
            onClick={() => addEntry("experience")}
          />
          <AddButton
            label="Añadir estudios"
            onClick={() => addEntry("education")}
          />
        </EditBar>

        <div className="journey__columns">
          {data.experience.length > 0 && (
            <div className="journey__col" data-reveal>
              <h3 className="journey__col-title">
                <PixelStar />
                {t.journey.experience}
              </h3>
              <ol className="journey__list">
                {data.experience.map((item) => (
                  <li className="journey__item" key={item.id}>
                    <span className="journey__year">{item.year}</span>
                    <h4>{item.title[lang]}</h4>
                    <p className="journey__place">{item.place[lang]}</p>
                    <p className="journey__desc">{item.description[lang]}</p>
                    <EditButton
                      className="journey__edit edit-hover"
                      label="Editar experiencia"
                      onClick={() =>
                        open({
                          kind: "journey",
                          collection: "experience",
                          id: item.id,
                        })
                      }
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}

          {data.education.length > 0 && (
            <div className="journey__col" data-reveal>
              <h3 className="journey__col-title">
                <PixelStar />
                {t.journey.education}
              </h3>
              <ol className="journey__list">
                {data.education.map((item) => (
                  <li className="journey__item" key={item.id}>
                    <span className="journey__year">{item.year}</span>
                    <h4>{item.title[lang]}</h4>
                    <p className="journey__place">{item.place[lang]}</p>
                    <p className="journey__desc">{item.description[lang]}</p>
                    <EditButton
                      className="journey__edit edit-hover"
                      label="Editar estudios"
                      onClick={() =>
                        open({
                          kind: "journey",
                          collection: "education",
                          id: item.id,
                        })
                      }
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="journey__next" data-reveal>
          <div>
            <p className="pixel-label">
              <PixelStar />
              {t.journey.nextLabel}
            </p>
            <h3>{t.journey.nextTitle}</h3>
            <p>{t.journey.nextText}</p>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => scrollToBlock("contact")}
            data-cursor
            data-cursor-label={t.journey.nextCta}
          >
            {t.journey.nextCta}
            <span aria-hidden="true">↘</span>
          </button>
        </div>
      </div>
    </section>
  );
}
