import type { CSSProperties } from "react";
import { useLang } from "../lib/lang";
import { useSite } from "../lib/site";
import { useEditor } from "../edit/EditorContext";
import { AddButton, EditBar, EditButton } from "../edit/controls";
import { blankStackGroup } from "../edit/factories";
import { PixelStar } from "./Decor";

export function Stack() {
  const { lang, t } = useLang();
  const { data, updateDraft } = useSite();
  const { open } = useEditor();

  const addGroup = () => {
    const group = blankStackGroup(data.stack.length);
    updateDraft((draft) => ({
      ...draft,
      stack: [...draft.stack, group],
    }));
    open({ kind: "stack", id: group.id });
  };

  return (
    <section
      className="block stack"
      id="stack"
      data-block
      aria-labelledby="stack-title"
    >
      <span className="block__ghost" aria-hidden="true">
        03
      </span>

      <div className="shell">
        <header className="block__head">
          <div className="block__head-main">
            <p className="pixel-label" data-reveal>
              {t.stack.label}
            </p>
            <h2 className="block__title" id="stack-title" data-reveal>
              {t.stack.title}
            </h2>
          </div>
          <p className="block__hint" data-reveal>
            {t.stack.hint}
          </p>
        </header>

        <EditBar label="Stack">
          <EditButton
            label="Textos de la sección"
            onClick={() => open({ kind: "texts", group: "stack" })}
          />
          <AddButton label="Añadir grupo" onClick={addGroup} />
        </EditBar>

        <div className="stack__grid">
          {data.stack.map((group, index) => (
            <article
              className="stack__card"
              key={group.id}
              data-reveal
              style={{ "--card-index": index } as CSSProperties}
            >
              <header>
                <span className="pixel-label">
                  <PixelStar />
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{group.name[lang]}</h3>
              </header>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <EditButton
                className="stack__edit edit-hover"
                label="Editar grupo"
                onClick={() => open({ kind: "stack", id: group.id })}
              />
            </article>
          ))}
        </div>

        <p className="stack__note" data-reveal>
          <PixelStar />
          {t.stack.note}
        </p>
      </div>
    </section>
  );
}
