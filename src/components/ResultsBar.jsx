import { useMemo } from "react";
import {
  useFilters,
  useNumberOfCommunities,
  useNumberOFOnSiteCommunities,
  useAllCommunities,
  useTags,
  useAudience,
  useCommunityActions,
} from "../stores/community.store";
import { bajaString } from "../constants";

const FILTER_LABELS = {
  status: "Estado",
  eventFormat: "Formato",
  communityType: "Tipo",
  tags: "Temática",
  targetAudience: "Público",
  name: "Comunidad",
};

/* eslint-disable react/prop-types */
export function ResultsBar({ view }) {
  const filters = useFilters();
  const total = useAllCommunities().length;
  const count = useNumberOfCommunities();
  const countOnSite = useNumberOFOnSiteCommunities();
  const allTags = useTags();
  const allAudience = useAudience();
  const { filterComunities } = useCommunityActions();

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
            : value,
      category: FILTER_LABELS[key],
    }))
  );

  const displayCount = view === "map" ? countOnSite : count;
  const suffix =
    view === "map" ? "comunidades presenciales e híbridas" : "comunidades";
  const showTotal = chips.length > 0 && total !== displayCount;

  return (
    <div className="results-bar">
      <span className="results-count">
        <strong>{displayCount}</strong>
        {showTotal && <span className="results-count-total"> de {total}</span>}
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
                  aria-label={`Quitar filtro ${label}`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
