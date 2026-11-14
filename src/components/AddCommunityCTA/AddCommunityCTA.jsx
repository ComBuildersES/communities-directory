import { Trans, useTranslation } from "react-i18next";
import { useAddCommunityCTAStore } from "../../stores/addCommunityCTA.store.js";
import {
  useIsLoading,
  useFilters,
  useCommunityActions,
  useCommunitiesFiltered,
  useDataCoverage,
} from "../../stores/community.store.js";
import { buildContributionPath, buildDirectoryStatePath } from "../../lib/communitySubmission";
import {
  ADD_COMMUNITY_CTA_VARIANTS,
  resolveAddCommunityCTAVariant,
} from "../../lib/addCommunityCTA.js";
import "./AddCommunityCTA.css";

// Un único panel de contribución, tras una fila completa del listado.
// El alta es la acción principal; la búsqueda permite localizar una ficha antes de duplicarla.

function useCtaCopy() {
  const filters = useFilters();
  const filtered = useCommunitiesFiltered();
  const coverage = useDataCoverage();
  // La referencia son las activas, no el dataset entero: el filtro por defecto ya es
  // `status=active`, y medir contra las 660 hacía que la pantalla de inicio se anunciara
  // como un recorte ("estás viendo 444 de las 444").
  const activeTotal = coverage?.active?.total ?? 0;
  const variant = resolveAddCommunityCTAVariant({
    filters,
    resultCount: filtered.length,
    totalCount: activeTotal,
  });
  return {
    variant,
    counts: {
      count: filtered.length,
      total: activeTotal,
      pending: Math.max(activeTotal - (coverage?.active?.reviewed ?? 0), 0),
    },
  };
}

function focusSearch() {
  const input = document.querySelector(".tag-search-input");
  input?.scrollIntoView({ block: "center", behavior: "smooth" });
  input?.focus({ preventScroll: true });
}

export function AddCommunityCTAPanel() {
  const { t } = useTranslation();
  const isLoading = useIsLoading();
  const isDismissed = useAddCommunityCTAStore(state => state.isDismissed);
  const setDismissed = useAddCommunityCTAStore(state => state.setDismissed);
  const { variant, counts } = useCtaCopy();
  const filters = useFilters();
  const { setFilters } = useCommunityActions();
  const pendingFilters = { ...filters, status: ["active"], humanValidated: ["false"] };
  if (isLoading || isDismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    requestAnimationFrame(() => {
      const button = document.querySelector(".heading-reopen-community-cta");
      const target = button?.getClientRects().length ? button : document.querySelector(".heading-hamburger");
      target?.focus();
    });
  };

  return (
    <section className="cta-panel" aria-label={t("addCommunityCTA.panel.label")}>
      <button type="button" className="cta-panel__close" onClick={dismiss}>
        {t("addCommunityCTA.later")}
      </button>
      <h2 className="cta-panel__title" tabIndex={-1}>
        {t(`addCommunityCTA.panel.title.${variant}`, counts)}
      </h2>
      <p className="cta-panel__lead">
        <Trans i18nKey={variant === ADD_COMMUNITY_CTA_VARIANTS.FILTERED ? "addCommunityCTA.panel.leadFiltered" : "addCommunityCTA.panel.lead"}
          values={counts} components={{ strong: <strong /> }} />
      </p>
      <div className="cta-panel__actions">
        <a className="button cta-panel__primary" href={buildContributionPath({ mode: "new" })}>
          {t("addCommunityCTA.add")}
        </a>
        <button type="button" className="button cta-panel__secondary" onClick={focusSearch}>
          {t("addCommunityCTA.findMine")}
        </button>
      </div>
      {variant !== ADD_COMMUNITY_CTA_VARIANTS.REVIEWING && (
        <p className="cta-panel__note">
          {/* El clic con modificador tiene que poder abrir las pendientes en otra pestaña. */}
          <a
            href={buildDirectoryStatePath({ filters: pendingFilters })}
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setFilters(pendingFilters);
            }}
          >
            {t("addCommunityCTA.panel.pending", counts)}
          </a>{" "}
          {t("addCommunityCTA.panel.pendingNote")}
        </p>
      )}
    </section>
  );
}
