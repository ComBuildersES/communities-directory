/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCommunityActions, useDataCoverage, useFilters } from "../../stores/community.store.js";
import "./DataTransparency.css";

/**
 * Responde a la primera pregunta de quien llega al directorio y ve 657 fichas: ¿esto lo ha
 * escrito alguien o lo ha generado una máquina?
 *
 * El orden importa. El origen es humano —las comunidades las añadió gente, una a una— y lo
 * automático fue solo un etiquetado mínimo encima. Contado al revés, un dataset recopilado por
 * personas se lee como un dataset generado por IA, que es justo la duda que esto viene a
 * resolver.
 *
 * El bloque colapsa, pero **el número no**: si el porcentaje se esconde detrás del desplegable,
 * nadie lo abre y la transparencia deja de existir. Lo que se guarda es la explicación del
 * proceso y las acciones, que es lo que ocupa.
 *
 * El porcentaje que se publica es el de las **activas** (77 de 446), no el del dataset entero
 * (89 de 657). Repasar la ficha de una comunidad que ya no organiza nada no ayuda a nadie hoy,
 * así que medir sobre el total castiga el esfuerzo sin que mejore lo que la gente consulta.
 *
 * El dato sale de `useDataCoverage()`, que calcula `src/lib/dataCoverage.js` sobre los datos ya
 * cargados: el mismo módulo que escribe `coverage.json` y los recuentos de `llms.txt`.
 */
export function DataTransparency({ dataUrl, repoUrl, onNavigate }) {
  const { t } = useTranslation();
  const coverage = useDataCoverage();
  const filters = useFilters();
  const { setFilters } = useCommunityActions();
  const [isOpen, setIsOpen] = useState(false);

  if (!coverage || coverage.active.total === 0) return null;

  const { total, reviewed, reviewedPercent } = coverage.active;
  const pending = total - reviewed;
  const isReviewedOnly =
    filters.humanValidated?.includes("true") && !filters.humanValidated?.includes("false");
  const isPendingOnly =
    filters.humanValidated?.includes("false") && !filters.humanValidated?.includes("true");

  /**
   * Fija `status=active` además del filtro de revisión: el texto habla de comunidades activas,
   * y un listado que no coincida con el número que acabas de leer es peor que no dar número.
   */
  const applyReviewFilter = (value) => {
    setFilters({ status: ["active"], humanValidated: [value] });
    if (onNavigate) onNavigate();
  };

  return (
    <div className="data-transparency">
      <button
        type="button"
        className="data-transparency-summary"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className="data-transparency-summary-head">
          <span className="data-transparency-title">{t("transparency.title")}</span>
          <i className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`} aria-hidden="true"></i>
        </span>
        <span
          className="data-transparency-meter"
          role="img"
          aria-label={t("transparency.progress", { reviewed, total, percent: reviewedPercent })}
        >
          <span
            className="data-transparency-meter-fill"
            /* Suelo de 3px: un 13% en un popover de 300px es una franja que se lee como vacía. */
            style={{ width: `max(3px, ${reviewedPercent}%)` }}
          />
        </span>
        <span className="data-transparency-progress">
          {t("transparency.progress", { reviewed, total, percent: reviewedPercent })}
        </span>
      </button>

      {isOpen && (
        <div className="data-transparency-detail">
          <p className="data-transparency-copy">{t("transparency.method")}</p>
          <p className="data-transparency-copy">{t("transparency.pending")}</p>

          <p className="data-transparency-copy data-transparency-copy--cta">
            {t("transparency.cta", { pending })}
          </p>

          <button
            type="button"
            className="data-transparency-btn data-transparency-btn--primary"
            onClick={() => applyReviewFilter("false")}
            disabled={isPendingOnly}
          >
            <i className="fas fa-list-check"></i>
            {t("transparency.ctaBtn")}
          </button>

          <button
            type="button"
            className="data-transparency-btn"
            onClick={() => applyReviewFilter("true")}
            disabled={isReviewedOnly}
          >
            <i className="fas fa-user-check"></i>
            {isReviewedOnly ? t("transparency.filterActive") : t("transparency.filterCta")}
          </button>

          <a
            href={dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="data-transparency-link"
          >
            {t("transparency.readMore")} <i className="fas fa-arrow-right"></i>
          </a>

          <p className="data-transparency-code">
            {t("transparency.code")}{" "}
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              {t("transparency.codeLink")}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default DataTransparency;
