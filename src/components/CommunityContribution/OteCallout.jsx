import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { hasUrlKind } from "../../lib/communityUrls.js";
import { openSupportFab } from "../../lib/supportFab.js";

const OTE_SITE_URL = "https://opentechevents.org/";
const EVENTOS_WIKI_URL = "https://eventos.wiki/";
const OTE_SKILLS_URL = "https://github.com/OpenTechEvents/ote-tools/tree/main/skills";
const OTE_EDITOR_URL = "https://tools.opentechevents.org/editor/";
const OTE_TEMPLATE_URL = "https://github.com/OpenTechEvents/ote-template";
const OTE_TOOLS_URL = "https://opentechevents.org/#tools";
const EVENTOS_WIKI_REPO_URL = "https://github.com/achamorro-dev/eventoswiki";
const EVENTOS_WIKI_DATA_URL = "https://eventos.wiki/events.json";

/**
 * Invitación a publicar los eventos en formato abierto (OTE).
 *
 * Antes era un bloque fijo dentro del formulario: un párrafo de propuesta de valor, cuatro
 * vías técnicas y cinco enlaces, en medio de la edición de los canales. Quien venía a
 * corregir una URL se encontraba con un muro, y encima lo veía también quien **ya** publica
 * su feed, donde el argumentario no es más que ruido.
 *
 * Queda un gancho de una línea que abre el detalle a demanda, y sólo para quien aún no tiene
 * canal `ote`. Las instrucciones viven dentro del modal, plegadas: la vía fácil
 * (eventos.wiki) es lo único que la mayoría necesita leer, y para el resto está pedir ayuda.
 */
/* eslint-disable react/prop-types */
export function OteCallout({ urls = [] }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Quien ya publica su feed no necesita que le vendan OTE.
  if (hasUrlKind(urls, "ote")) return null;

  const askForHelp = () => {
    setIsOpen(false);
    openSupportFab("help");
  };

  return (
    <div className="contribution-grid-span-2">
      {/*
        Todo el aviso es el control, no solo "cómo funciona": el objetivo de clic era un
        enlace de dos palabras dentro de una línea de texto. Un único botón envolviéndolo
        todo (el modal va fuera: anidar interactivos es HTML inválido).
      */}
      <button
        type="button"
        className="contribution-ote-callout contribution-ote-hook"
        onClick={() => setIsOpen(true)}
      >
        <i className="fas fa-calendar-days" aria-hidden="true"></i>{" "}
        <span>{t("contribution.urls.ote.hook")}</span>{" "}
        <span className="contribution-ote-hook-link">
          {t("contribution.urls.ote.hookCta")}
        </span>
      </button>

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
    </div>
  );
}
