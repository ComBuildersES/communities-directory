import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveOteFieldState } from "../../lib/communityUrls.js";
import { openSupportFab } from "../../lib/supportFab.js";

const OTE_SITE_URL = "https://opentechevents.org/";
const EVENTOS_WIKI_URL = "https://eventos.wiki/";
const OTE_SKILLS_URL = "https://github.com/OpenTechEvents/ote-tools/tree/main/skills";
const OTE_EDITOR_URL = "https://tools.opentechevents.org/editor/";
const OTE_TEMPLATE_URL = "https://github.com/OpenTechEvents/ote-template";
const OTE_TOOLS_URL = "https://opentechevents.org/#tools";
const EVENTOS_WIKI_REPO_URL = "https://github.com/achamorro-dev/eventoswiki";
const EVENTOS_WIKI_DATA_URL = "https://eventos.wiki/events.json";
const OTE_READER_URL = "https://reader.opentechevents.org/";

/**
 * La agenda de eventos de la comunidad: su propia tarjeta, con el campo del feed dentro.
 *
 * Empezó siendo un bloque fijo dentro de la tarjeta de URLs (argumentario, cuatro vías
 * técnicas y cinco enlaces) y pasó por ser un gancho de una línea debajo de "Añadir canal".
 * Las dos versiones compartían el mismo fallo: prosa colgando de una zona de controles, sin
 * nada a lo que anclarse, y con la acción que proponía a tres clics de distancia (volver
 * arriba, añadir canal, encontrar "OTE" en el desplegable).
 *
 * De ahí la tarjeta: **el campo vive donde se explica qué es**. El acrónimo no encabeza nada
 * —"OTE" no le dice nada a quien llega— y el título habla de lo que la persona reconoce, su
 * agenda de eventos.
 *
 * Se pinta siempre, con dos caras: a quien no tiene feed se le invita; a quien ya publica se
 * le enseña el suyo y se le calla el argumentario, que ahí no es más que ruido.
 *
 * El feed sigue guardándose como un canal más de `urls` (kind `ote`): esta tarjeta edita esa
 * fila, no un campo aparte del modelo de datos. Por eso la fila no se pinta además en la
 * lista de canales, y el desplegable de plataformas no ofrece OTE: un campo con dos sitios
 * donde editarlo acaba con dos valores distintos.
 */
/* eslint-disable react/prop-types */
export function OteSection({ urls = [], onChange }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { value, hasFeed } = resolveOteFieldState(urls);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const askForHelp = () => {
    setIsOpen(false);
    openSupportFab("help");
  };

  return (
    <section className="contribution-card contribution-ote-card">
      <div className="contribution-card-header">
        <div>
          <h3>
            <i
              className={hasFeed ? "fas fa-circle-check" : "fas fa-calendar-days"}
              aria-hidden="true"
            ></i>{" "}
            {t("contribution.urls.ote.sectionTitle")}
          </h3>
          <p>
            {hasFeed
              ? t("contribution.urls.ote.sectionLeadWithFeed")
              : t("contribution.urls.ote.sectionLead")}
          </p>
        </div>
      </div>

      <div className="field contribution-grid-span-2">
        <label className="label" htmlFor="community-ote-feed">
          {t("contribution.urls.ote.fieldLabel")}
        </label>
        <div className="control">
          <input
            id="community-ote-feed"
            className="input"
            type="url"
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder="https://comunidad.dev/events/feed.json"
          />
        </div>
        {/*
          El pie del campo es lo que decide si esto recluta o estorba: sin feed, el camino
          para crearlo; con feed, dónde comprobar que se lee bien. Nunca las dos cosas.
        */}
        <p className="help contribution-ote-field-help">
          {hasFeed ? (
            <a
              href={`${OTE_READER_URL}?subscribe=${encodeURIComponent(value.trim())}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("contribution.urls.ote.readerCta")}
            </a>
          ) : (
            <>
              <span>{t("contribution.urls.ote.noFeedPrompt")}</span>{" "}
              <button
                type="button"
                className="contribution-ote-hook-link"
                onClick={() => setIsOpen(true)}
              >
                {t("contribution.urls.ote.howToCta")}
              </button>
            </>
          )}
        </p>
      </div>

      {isOpen && (
        <div className="contribution-help-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="contribution-help-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("contribution.urls.ote.title")}
          >
            <div className="contribution-help-modal-header">
              <div>
                <h4>{t("contribution.urls.ote.title")}</h4>
                <p>{t("contribution.urls.ote.pitch")}</p>
              </div>
              <button
                type="button"
                className="contribution-help-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label={t("contribution.closeHelp")}
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>

            <div className="contribution-help-modal-body">
              {/*
                La analogía va primero y sola: es lo que hace entender OTE sin leer la
                especificación. Lo que viene detrás ya se lee sabiendo de qué hablamos.
              */}
              <p className="contribution-ote-analogy">{t("contribution.urls.ote.analogy")}</p>

              <p>{t("contribution.urls.ote.fields")}</p>
              <p>{t("contribution.urls.ote.vocabulary")}</p>

              <p className="contribution-ote-easy-way">
                {t("contribution.urls.ote.easyWay")}{" "}
                <a href={EVENTOS_WIKI_URL} target="_blank" rel="noreferrer">
                  {t("contribution.urls.ote.linkEventosWiki")}
                </a>
              </p>

              <p>{t("contribution.urls.ote.ownership")}</p>

              {/* Los enlaces van en una fila, no incrustados en la prosa: tres enlaces en una
                  frase la vuelven ilegible y nadie distingue a dónde lleva cada uno. */}
              <p className="contribution-ote-links">
                <a href={EVENTOS_WIKI_REPO_URL} target="_blank" rel="noreferrer">
                  {t("contribution.urls.ote.linkEventosWikiRepo")}
                </a>
                <a href={EVENTOS_WIKI_DATA_URL} target="_blank" rel="noreferrer">
                  {t("contribution.urls.ote.linkEventosWikiData")}
                </a>
                <a href={OTE_TOOLS_URL} target="_blank" rel="noreferrer">
                  {t("contribution.urls.ote.linkTools")}
                </a>
              </p>

              <details className="contribution-ote-ways-details">
                <summary>{t("contribution.urls.ote.waysTitle")}</summary>
                <ul className="contribution-ote-ways">
                  <li>
                    {t("contribution.urls.ote.way1")}{" "}
                    <a href={OTE_SKILLS_URL} target="_blank" rel="noreferrer">
                      {t("contribution.urls.ote.linkSkills")}
                    </a>
                  </li>
                  <li>
                    {t("contribution.urls.ote.way2")}{" "}
                    <a href={OTE_EDITOR_URL} target="_blank" rel="noreferrer">
                      {t("contribution.urls.ote.linkEditor")}
                    </a>
                  </li>
                  <li>
                    {t("contribution.urls.ote.way3")}{" "}
                    <a href={OTE_TEMPLATE_URL} target="_blank" rel="noreferrer">
                      {t("contribution.urls.ote.linkTemplate")}
                    </a>
                  </li>
                </ul>
              </details>

              <div className="contribution-ote-modal-actions">
                <a
                  className="button is-small is-link"
                  href={OTE_SITE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("contribution.urls.ote.linkSpec")}
                </a>
                <button type="button" className="button is-small" onClick={askForHelp}>
                  <i className="fas fa-comments" aria-hidden="true"></i>{" "}
                  <span>{t("contribution.urls.ote.askForHelp")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
