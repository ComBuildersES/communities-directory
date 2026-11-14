/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import {
  useCommunityActions,
  useFilters,
  useReviewFacetCounts,
  useNameSearchRecovery,
} from "../stores/community.store.js";
import {
  EMPTY_RESULTS_VARIANTS,
  resolveEmptyResultsVariant,
} from "../lib/emptyResults.js";
import "./EmptyResults.css";
import { buildDirectoryStatePath, slugifyCommunityName } from '../lib/communitySubmission.js';
import { MatchHighlight } from './TagSearch/MatchHighlight.jsx';

/**
 * Qué se ve cuando los filtros no devuelven nada. Antes: una cuadrícula vacía y, debajo, el
 * CTA de "añade tu comunidad" — que en ese contexto se lee como "esto está roto".
 *
 * Tiene dos mensajes porque son dos situaciones distintas. Si el filtro activo es "solo
 * revisadas", el cero no es un cero: con un 17% revisado es lo normal en cuanto acotas algo, y
 * lo útil es ofrecer las pendientes que hay justo ahí. Ese es el momento en que el filtro de
 * transparencia se convierte en reclutamiento en vez de en decepción.
 */
export function EmptyResults({ onOpenCommunity }) {
  const { t } = useTranslation();
  const filters = useFilters();
  const { setFilters } = useCommunityActions();
  const { reviewed, pending } = useReviewFacetCounts();
  const { inactiveCount, inactiveFilters, alternatives } = useNameSearchRecovery();
  const hasRecovery = inactiveCount > 0 || alternatives.length > 0;

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
      {(!hasRecovery || variant !== EMPTY_RESULTS_VARIANTS.GENERIC) && <p className="empty-results-copy">{body}</p>}

      {inactiveCount > 0 && <>
        <p className="empty-results-copy empty-results-inactive" role="status">
          {t('emptyResults.inactiveMatches', { count: inactiveCount })}
        </p>
        <button type="button" className="empty-results-btn" onClick={() => setFilters(inactiveFilters)}>
          {t('emptyResults.includeInactive')}
        </button>
      </>}

      {alternatives.length > 0 && (
        <section className="empty-results-alternatives" aria-label={t('emptyResults.similarNames')}>
          <h3>{t('emptyResults.similarNames')}</h3>
          <ul>
            {alternatives.map(({ community, excludedByStatus }) => {
              const identifier = community.id ?? slugifyCommunityName(community.name);
              return <li key={identifier}>
                <a className="empty-results-alternative" href={buildDirectoryStatePath({ filters, communityIdentifier: identifier })}
                  onClick={(event) => {
                    if (!onOpenCommunity || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    onOpenCommunity(identifier);
                  }}>
                  <span className="empty-results-alternative-name">
                    <MatchHighlight text={community.name} query={filters.nameQuery?.[0] ?? ''} />
                  </span>
                  <span className="empty-results-alternative-meta">
                    <span className={`tag-option-badge tag-option-badge--${community.status === 'active' ? 'active' : community.status === 'inactive' ? 'inactive' : 'unknown'}`}>
                      {t(`status.${community.status || 'unknown'}`)}
                    </span>
                    {excludedByStatus && <span>{t('emptyResults.excludedByStatus')}</span>}
                  </span>
                  <span className="empty-results-alternative-action">{t('tagSearch.openDetails')}</span>
                </a>
              </li>;
            })}
          </ul>
        </section>
      )}

      {showPendingOffer && (
        <button type="button" className="empty-results-btn" onClick={showPending}>
          <i className="fas fa-list-check"></i>
          {t("emptyResults.reviewCta", { pending })}
        </button>
      )}

      <button
        type="button"
        className={`empty-results-btn${showPendingOffer || hasRecovery ? " empty-results-btn--secondary" : ""}`}
        onClick={clearFilters}
      >
        <i className="fas fa-filter-circle-xmark"></i>
        {t("emptyResults.clearFilters")}
      </button>
    </div>
  );
}

export default EmptyResults;
