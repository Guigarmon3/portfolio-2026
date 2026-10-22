import { useLang } from "../lib/lang";
import { safeImageUrl, useSite } from "../lib/site";
import { useEditor } from "../edit/EditorContext";
import { AddButton, EditBar, EditButton } from "../edit/controls";
import { PixelStar } from "./Decor";

export function About() {
  const { t } = useLang();
  const { data, updateDraft } = useSite();
  const { editing, open, requestImage } = useEditor();
  const portrait = safeImageUrl(data.profile.portrait);

  const changePortrait = () =>
    requestImage({
      title: "Retrato de perfil",
      value: data.profile.portrait,
      onChange: (next) =>
        updateDraft((draft) => ({
          ...draft,
          profile: { ...draft.profile, portrait: next },
        })),
    });

  const addParagraph = () => {
    updateDraft((draft) => ({
      ...draft,
      sections: {
        ...draft.sections,
        about: {
          ...draft.sections.about,
          paragraphs: {
            es: [...draft.sections.about.paragraphs.es, "Nuevo párrafo"],
            en: [...draft.sections.about.paragraphs.en, "New paragraph"],
          },
        },
      },
    }));
    open({ kind: "about" });
  };

  return (
    <section
      className="block about"
      id="about"
      data-block
      aria-labelledby="about-title"
    >
      <span className="block__ghost" aria-hidden="true">
        02
      </span>

      <div className="shell">
        <header className="block__head">
          <div className="block__head-main">
            <p className="pixel-label" data-reveal>
              {t.about.label}
            </p>
            <h2 className="block__title" id="about-title" data-reveal>
              {t.about.title}
            </h2>
          </div>
          <p className="block__hint about__hint" data-reveal>
            {t.about.quote}
          </p>
        </header>

        <EditBar label="Sobre mí">
          <EditButton
            label="Editar sección"
            onClick={() => open({ kind: "about" })}
          />
          <AddButton label="Añadir párrafo" onClick={addParagraph} />
        </EditBar>

        <div className="about__grid">
          <div className="about__story">
            {t.about.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? "about__lead" : undefined}
                data-reveal
              >
                {paragraph}
              </p>
            ))}
          </div>

          <aside className="player-card" data-reveal>
            <div className="player-card__top">
              <span className="pixel-label">
                <PixelStar />
                {t.about.playerLabel}
              </span>
              <span className="player-card__id">{data.profile.mark}-01</span>
            </div>

            <div
              className={`player-card__avatar${portrait ? " has-portrait" : ""}`}
            >
              {portrait ? (
                <img
                  src={portrait}
                  alt={`Retrato de ${data.profile.name}`}
                />
              ) : (
                <span>{data.profile.mark}</span>
              )}
              <PixelStar className="player-card__star" />
              {editing ? (
                <button
                  type="button"
                  className="player-card__avatar-edit edit-hover"
                  onClick={changePortrait}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 11.5V13h1.5L12.8 4.7a1.1 1.1 0 0 0 0-1.5l-.4-.4a1.1 1.1 0 0 0-1.5 0L3 11.5Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {portrait ? "Cambiar retrato" : "Añadir retrato"}
                </button>
              ) : null}
            </div>

            <p className="player-card__class">{t.about.playerClass}</p>

            <div className="player-card__now">
              <span className="pixel-label">{t.about.nowLabel}</span>
              <p>{t.about.now}</p>
            </div>

            <div className="player-card__quests">
              <span className="pixel-label">{t.about.sideQuestsLabel}</span>
              <ul>
                {t.about.sideQuests.map((quest) => (
                  <li key={quest}>{quest}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
