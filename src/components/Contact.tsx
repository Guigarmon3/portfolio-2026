import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/lang";
import { safeUrl, useSite } from "../lib/site";
import { useEditor } from "../edit/EditorContext";
import { AddButton, EditBar, EditButton } from "../edit/controls";
import { Footer } from "./Footer";

export function Contact() {
  const { t } = useLang();
  const { data, updateDraft } = useSite();
  const { open } = useEditor();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const email = data.profile.email;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1900);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const addSocial = () => {
    updateDraft((draft) => ({
      ...draft,
      profile: {
        ...draft.profile,
        socials: [
          ...draft.profile.socials,
          { label: "Nueva red", url: "https://" },
        ],
      },
    }));
    open({ kind: "socials" });
  };

  return (
    <section
      className="block contact"
      id="contact"
      data-block
      aria-labelledby="contact-title"
    >
      <span className="block__ghost" aria-hidden="true">
        05
      </span>

      <div className="shell contact__inner">
        <header className="contact__head">
          <p className="pixel-label" data-reveal>
            {t.contact.label}
          </p>
          <h2 className="contact__title" id="contact-title" data-reveal>
            {t.contact.title}
          </h2>
        </header>

        <EditBar label="Contacto">
          <EditButton
            label="Editar contacto"
            onClick={() => open({ kind: "contact" })}
          />
          <EditButton
            label="Editar redes"
            onClick={() => open({ kind: "socials" })}
          />
          <AddButton label="Añadir red" onClick={addSocial} />
        </EditBar>

        <a
          className="contact__big"
          href={safeUrl(`mailto:${email}`)}
          data-reveal
          data-cursor
          data-cursor-label={t.contact.emailLabel}
        >
          {t.contact.big}
          <span className="contact__big-mark" aria-hidden="true">
            ↗
          </span>
        </a>

        <div className="contact__row">
          <div className="contact__col" data-reveal>
            <h3 className="pixel-label">{t.contact.emailLabel}</h3>
            <a className="contact__email" href={safeUrl(`mailto:${email}`)}>
              {email}
            </a>
            <button
              type="button"
              className="contact__copy"
              onClick={copyEmail}
              aria-live="polite"
              data-cursor
              data-cursor-label={t.contact.copy}
            >
              {copied ? `✓ ${t.contact.copied}` : t.contact.copy}
            </button>
            <p className="contact__note">{t.contact.note}</p>
          </div>

          <div className="contact__col" data-reveal>
            <h3 className="pixel-label">{t.contact.socials}</h3>
            <ul className="contact__list">
              {data.profile.socials.map((social, index) => (
                <li key={`${social.url}-${index}`}>
                  <a
                    href={safeUrl(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    data-cursor-label={social.label}
                  >
                    {social.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                  <EditButton
                    className="contact__social-edit edit-hover"
                    label="Editar redes"
                    onClick={() => open({ kind: "socials" })}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="contact__col" data-reveal>
            <h3 className="pixel-label">{t.contact.availabilityLabel}</h3>
            <div className="contact__avail-card">
              <p className="contact__avail">
                <span className="status__dot" aria-hidden="true" />
                {t.hero.availability}
              </p>
              <p className="contact__location">{t.hero.location}</p>
              <p className="contact__commute">{t.hero.commuteNote}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}
