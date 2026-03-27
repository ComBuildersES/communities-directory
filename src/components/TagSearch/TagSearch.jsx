/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useTags,
  useAudience,
  useAllCommunities,
  useCommunityActions,
  useFilters,
} from "../../stores/community.store.js";
import { bajaString } from "../../constants";
import {
  buildDirectoryFilterPath,
  buildDirectoryStatePath,
  slugifyCommunityName,
} from "../../lib/communitySubmission";
import { scoreItem, scoreCommunity } from "../../lib/fuzzyMatch";
import "./TagSearch.css";

const INVALID_LOCATION_VALUES = new Set([
  "",
  "n/a",
  "n.a.",
  "n.a",
  "sin completar",
  "sin localidad",
]);

const STATUS_BADGE_CLASS = {
  active:   "tag-option-badge tag-option-badge--active",
  inactive: "tag-option-badge tag-option-badge--inactive",
  unknown:  "tag-option-badge tag-option-badge--unknown",
};

const COMMUNITY_SUGGESTION_STATUS_ORDER = {
  active:   0,
  unknown:  1,
  inactive: 2,
};

// Max items shown per section before "Ver más" appears
const SECTION_LIMITS = {
  topics:      3,
  audience:    3,
  communities: 3,
};

function normalizeLocation(location) {
  const normalized = location?.trim();

  if (!normalized) return null;

  return INVALID_LOCATION_VALUES.has(normalized.toLowerCase()) ? null : normalized;
}

function buildCommunityMeta(community, t) {
  const location = normalizeLocation(community.location);

  return [
    community.status && {
      value: t(`status.${community.status}`),
      className: STATUS_BADGE_CLASS[community.status] || STATUS_BADGE_CLASS.unknown,
    },
    community.communityType && {
      value: t(`communityType.${community.communityType}`),
      className: "tag-option-badge tag-option-badge--type",
    },
    community.eventFormat && {
      value: t(`eventFormat.${community.eventFormat}`),
      className: "tag-option-badge tag-option-badge--format",
    },
    location && {
      value: location,
      className: "tag-option-badge tag-option-badge--location",
    },
  ].filter(Boolean);
}

function dismissActiveInput() {
  if (typeof document === "undefined") return;

  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) return;

  if (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  ) {
    activeElement.blur();
  }
}

export function TagSearch() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const allTags = useTags();
  const allAudience = useAudience();
  const allCommunities = useAllCommunities();
  const filters = useFilters();
  const { filterComunities } = useCommunityActions();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset expanded sections when the query changes
  useEffect(() => {
    setExpandedSections(new Set());
  }, [query]);

  const activeFilterIds = new Set(
    activeFilters.map((filter) => `${filter.key}:${filter.value}`)
  );

  const q = query.trim();

  const tagSuggestions = q.length < 2
    ? []
    : allTags
        .filter((tag) => !activeFilterIds.has(`tags:${tag.id}`))
        .map((tag) => ({ tag, score: scoreItem(q, tag) }))
        .filter(({ score }) => score !== null)
        .sort((a, b) => b.score - a.score)
        .map(({ tag }) => ({
          sectionKey: "topics",
          group: t("tagSearch.groupTopics"),
          key: "tags",
          value: tag.id,
          label: tag.label,
          description: tag.description,
        }));

  const audienceSuggestions = q.length < 2
    ? []
    : allAudience
        .filter((audience) => !activeFilterIds.has(`targetAudience:${audience.id}`))
        .map((audience) => ({ audience, score: scoreItem(q, audience) }))
        .filter(({ score }) => score !== null)
        .sort((a, b) => b.score - a.score)
        .map(({ audience }) => ({
          sectionKey: "audience",
          group: t("tagSearch.groupAudience"),
          key: "targetAudience",
          value: audience.id,
          label: audience.label,
          description: audience.description,
        }));

  const communitySuggestions = q.length < 2
    ? []
    : allCommunities
        .filter((community) => !activeFilterIds.has(`name:${community.name}`))
        .map((community) => ({ community, score: scoreCommunity(q, community.name) }))
        .filter(({ score }) => score !== null)
        .sort((a, b) => {
          // Primary: relevance score descending
          if (b.score !== a.score) return b.score - a.score;
          // Secondary: status order
          const leftOrder = COMMUNITY_SUGGESTION_STATUS_ORDER[a.community.status] ?? 1;
          const rightOrder = COMMUNITY_SUGGESTION_STATUS_ORDER[b.community.status] ?? 1;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return a.community.name.localeCompare(b.community.name, "es", { sensitivity: "base" });
        })
        .map(({ community }) => ({
          sectionKey: "communities",
          group: t("tagSearch.groupCommunities"),
          key: "name",
          value: community.name,
          label: community.name,
          description: t("tagSearch.communityLabel"),
          meta: buildCommunityMeta(community, t),
          communityIdentifier: community.id ?? slugifyCommunityName(community.name),
        }));

  const sections = [
    { key: "topics",      label: t("tagSearch.groupTopics"),      suggestions: tagSuggestions },
    { key: "audience",    label: t("tagSearch.groupAudience"),     suggestions: audienceSuggestions },
    { key: "communities", label: t("tagSearch.groupCommunities"),  suggestions: communitySuggestions },
  ].filter((s) => s.suggestions.length > 0);

  const addFilter = (filter) => {
    setActiveFilters((prev) => [...prev, filter]);
    filterComunities(filter.key, filter.value);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const openFilterInNewTab = (filter) => {
    const currentValues = filters[filter.key];
    const nextValues = Array.isArray(currentValues)
      ? currentValues
      : currentValues
        ? [currentValues]
        : [];
    const values = nextValues.includes(filter.value)
      ? nextValues
      : [...nextValues, filter.value];
    const path = buildDirectoryFilterPath({
      filters: {
        ...filters,
        [filter.key]: values,
      },
    });

    window.open(path, "_blank", "noopener,noreferrer");
  };

  const openCommunityDetails = (suggestion, openInNewTab = false) => {
    const path = buildDirectoryStatePath({
      filters,
      communityIdentifier: suggestion.communityIdentifier,
    });

    if (openInNewTab) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }

    dismissActiveInput();
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setQuery("");
    setShowDropdown(false);
  };

  const removeFilter = (filterToRemove) => {
    setActiveFilters((prev) =>
      prev.filter(
        (filter) =>
          !(filter.key === filterToRemove.key && filter.value === filterToRemove.value)
      )
    );
    filterComunities(filterToRemove.key, bajaString + filterToRemove.value);
  };

  const clearAll = () => {
    activeFilters.forEach((filter) =>
      filterComunities(filter.key, bajaString + filter.value)
    );
    setActiveFilters([]);
  };

  return (
    <div className="tag-search-bar" ref={containerRef}>
      <div className="tag-search-inner">
        <i className="fas fa-search tag-search-icon"></i>
        <div className="tag-search-chips">
          {activeFilters.map((filter) => (
            <span key={`${filter.key}:${filter.value}`} className={`tag-chip tag-chip--${filter.key}`}>
              {filter.label}
              <button
                className="tag-chip-remove"
                onClick={() => removeFilter(filter)}
                aria-label={t("tagSearch.removeChip", { label: filter.label })}
              >
                <i className="fas fa-times"></i>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className="tag-search-input"
            type="text"
            placeholder={
              activeFilters.length === 0
                ? t("tagSearch.placeholder")
                : t("tagSearch.placeholderMore")
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          />
        </div>
        {activeFilters.length > 0 && (
          <button
            className="tag-search-clear"
            onClick={clearAll}
            title={t("tagSearch.clearFilters")}
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>

      {showDropdown && sections.length > 0 && (
        <div className="tag-search-dropdown">
          {sections.map(({ key: sectionKey, label: sectionLabel, suggestions }) => {
            const limit = SECTION_LIMITS[sectionKey] ?? 5;
            const isExpanded = expandedSections.has(sectionKey);
            const displayed = isExpanded ? suggestions : suggestions.slice(0, limit);
            const hiddenCount = suggestions.length - limit;

            return (
              <div key={sectionKey} className="tag-search-group">
                <div className="tag-search-group-label">{sectionLabel}</div>
                {displayed.map((suggestion) => (
                  <button
                    key={`${suggestion.key}:${suggestion.value}`}
                    className="tag-search-option"
                    onMouseDown={(e) => {
                      e.preventDefault();

                      if (suggestion.communityIdentifier !== null && suggestion.communityIdentifier !== undefined) {
                        openCommunityDetails(suggestion, e.metaKey || e.ctrlKey);
                        return;
                      }

                      if (e.metaKey || e.ctrlKey) {
                        openFilterInNewTab(suggestion);
                        return;
                      }

                      addFilter(suggestion);
                    }}
                  >
                    <span className="tag-option-label">{suggestion.label}</span>
                    {suggestion.meta?.length ? (
                      <span className="tag-option-meta" aria-hidden="true">
                        {suggestion.meta.map((item) => (
                          <span key={`${suggestion.key}:${suggestion.value}:${item.value}`} className={item.className}>
                            {item.value}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="tag-option-desc">{suggestion.description}</span>
                    )}
                  </button>
                ))}
                {!isExpanded && hiddenCount > 0 && (
                  <button
                    className="tag-search-show-more"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setExpandedSections((prev) => new Set([...prev, sectionKey]));
                    }}
                  >
                    {t("tagSearch.showMore", { count: hiddenCount })}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
