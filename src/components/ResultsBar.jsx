import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useFilters,
  useNumberOfCommunities,
  useNumberOFOnSiteCommunities,
  useAllCommunities,
  useTags,
  useAudience,
  useCommunityActions,
} from "../stores/community.store.js";
import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store.js";
import { ViewToggleButton } from "./ViewToggleButton.jsx";
import { bajaString } from "../constants";

const FILTER_LABEL_KEYS = {
  status: "resultsBar.filterLabel.status",
  eventFormat: "resultsBar.filterLabel.eventFormat",
  communityType: "resultsBar.filterLabel.communityType",
  tags: "resultsBar.filterLabel.tags",
  targetAudience: "resultsBar.filterLabel.targetAudience",
  name: "resultsBar.filterLabel.name",
};

/* eslint-disable react/prop-types */
export function ResultsBar({ view, toggleView }) {
  const { t } = useTranslation();
  const filters = useFilters();
  const total = useAllCommunities().length;
  const count = useNumberOfCommunities();
  const countOnSite = useNumberOFOnSiteCommunities();
  const allTags = useTags();
  const allAudience = useAudience();
  const { filterComunities } = useCommunityActions();
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();

  const tagsMap = useMemo(
    () => Object.fromEntries(allTags.map((t) => [t.id, t.label])),
    [allTags]
  );

  const audienceMap = useMemo(
    () => Object.fromEntries(allAudience.map((a) => [a.id, a.label])),
    [allAudience]
  );

  const chips = Object.entries(filters).flatMap(([key, values]) =>
    values.map((value) => ({
      key,
      value,
      label:
        key === "tags"
          ? (tagsMap[value] || value)
          : key === "targetAudience"
            ? (audienceMap[value] || value)
            : key === "status" || key === "eventFormat" || key === "communityType"
              ? t(`${key}.${value}`, { defaultValue: value })
              : value,
      category: FILTER_LABEL_KEYS[key] ? t(FILTER_LABEL_KEYS[key]) : key,
    }))
  );

  const displayCount = view === "map" ? countOnSite : count;
  const suffix =
    view === "map" ? t("resultsBar.suffixMap") : t("resultsBar.suffixList");
  const showTotal = chips.length > 0 && total !== displayCount;

  return (
    <div className="results-bar">
      <div className="results-bar__info">
        <span className="results-count">
          <strong>{displayCount}</strong>
          {showTotal && <span className="results-count-total"> {t("resultsBar.ofTotal", { total })}</span>}
          {" "}{suffix}
        </span>

        {chips.length > 0 && (
          <>
            <span className="results-bar-sep">·</span>
            <div className="results-chips">
              {chips.map(({ key, value, label, category }) => (
                <span key={`${key}-${value}`} className="results-chip">
                  {category && <span className="results-chip-category">{category}:</span>}
                  {label}
                  <button
                    className="results-chip-remove"
                    onClick={() => filterComunities(key, bajaString + value)}
                    aria-label={t("resultsBar.removeFilter", { label })}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="results-bar__controls">
        <button
          type="button"
          className={`button is-small ${isVisible ? "is-primary" : "is-light"}`}
          onClick={toggleSidebar}
          title={isVisible ? t("resultsBar.hideFilters") : t("resultsBar.showFilters")}
        >
          <span className="icon"><i className="fas fa-sliders"></i></span>
          <span>{t("resultsBar.filters")}</span>
        </button>
        <ViewToggleButton view={view} toggleView={toggleView} />
      </div>
    </div>
  );
}
