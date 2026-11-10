import { useTranslation } from "react-i18next";
import {
  useCommunityActions,
  useFilters,
  useReviewFacetCounts,
} from "../stores/community.store.js";
import {
  EMPTY_RESULTS_VARIANTS,
  resolveEmptyResultsVariant,
} from "../lib/emptyResults.js";
import "./EmptyResults.css";

/**
 * Qué se ve cuando los filtros no devuelven nada. Antes: una cuadrícula vacía y, debajo, el
 * CTA de "añade tu comunidad" — que en ese contexto se lee como "esto está roto".
 *
 * Tiene dos mensajes porque son dos situaciones distintas. Si el filtro activo es "solo
 * revisadas", el cero no es un cero: con un 17% revisado es lo normal en cuanto acotas algo, y
 * lo útil es ofrecer las pendientes que hay justo ahí. Ese es el momento en que el filtro de
 * transparencia se convierte en reclutamiento en vez de en decepción.
 */
export function EmptyResults() {
  const { t } = useTranslation();
  const filters = useFilters();
  const { setFilters } = useCommunityActions();
  const { reviewed, pending } = useReviewFacetCounts();

  const variant = resolveEmptyResultsVariant({ filters, reviewed, pending });
  const showPendingOffer = variant === EMPTY_RESULTS_VARIANTS.PENDING_OFFER;
  const isAllReviewed = variant === EMPTY_RESULTS_VARIANTS.ALL_REVIEWED;

  /** Cambia solo el filtro de revisión: el resto de lo que la persona acotó se respeta. */
  const showPending = () => {
    setFilters({ ...filters, humanValidated: ["false"] });
  };

  const clearFilters = () => {
    setFilters({ status: ["active"] });
  };

  const title = isAllReviewed
    ? t("emptyResults.allReviewedTitle")
    : showPendingOffer
      ? t("emptyResults.reviewedTitle")
      : t("emptyResults.title");

  const body = isAllReviewed
    ? t("emptyResults.allReviewedBody", { reviewed })
    : showPendingOffer
      ? t("emptyResults.reviewedBody", { pending })
      : t("emptyResults.body");

  return (
    <div className="empty-results">
      <i
        className={`fas ${isAllReviewed ? "fa-circle-check" : "fa-magnifying-glass"} empty-results-icon${
          isAllReviewed ? " empty-results-icon--done" : ""
        }`}
        aria-hidden="true"
      ></i>
      <p className="empty-results-title">{title}</p>
      <p className="empty-results-copy">{body}</p>

      {showPendingOffer && (
        <button type="button" className="empty-results-btn" onClick={showPending}>
          <i className="fas fa-list-check"></i>
          {t("emptyResults.reviewCta", { pending })}
        </button>
      )}

      <button
        type="button"
        className={`empty-results-btn${showPendingOffer ? " empty-results-btn--secondary" : ""}`}
        onClick={clearFilters}
      >
        <i className="fas fa-filter-circle-xmark"></i>
        {t("emptyResults.clearFilters")}
      </button>
    </div>
  );
}

export default EmptyResults;
