/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import {
  useTags,
  useAudience,
  useAllCommunities,
  useCommunityActions,
  useFilters,
} from "../../stores/community.store";
import { bajaString } from "../../constants";
import {
  buildDirectoryFilterPath,
  buildDirectoryStatePath,
  slugifyCommunityName,
} from "../../lib/communitySubmission";
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
  Activa: "tag-option-badge tag-option-badge--active",
  Inactiva: "tag-option-badge tag-option-badge--inactive",
  Desconocido: "tag-option-badge tag-option-badge--unknown",
};

const COMMUNITY_SUGGESTION_STATUS_ORDER = {
  Activa: 0,
  Desconocido: 1,
  Inactiva: 2,
};

function normalizeLocation(location) {
  const normalized = location?.trim();

  if (!normalized) return null;

  return INVALID_LOCATION_VALUES.has(normalized.toLowerCase()) ? null : normalized;
}

function buildCommunityMeta(community) {
  const location = normalizeLocation(community.location);

  return [
    community.status && {
      value: community.status,
      className: STATUS_BADGE_CLASS[community.status] || STATUS_BADGE_CLASS.Desconocido,
    },
    community.communityType && {
      value: community.communityType,
      className: "tag-option-badge tag-option-badge--type",
    },
    community.eventFormat && {
      value: community.eventFormat,
      className: "tag-option-badge tag-option-badge--format",
    },
    location && {
      value: location,
      className: "tag-option-badge tag-option-badge--location",
    },
  ].filter(Boolean);
}

export function TagSearch() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
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

  const activeFilterIds = new Set(
    activeFilters.map((filter) => `${filter.key}:${filter.value}`)
  );

  const q = query.trim().toLowerCase();

  const suggestions = q.length < 2
    ? []
    : [
        ...allTags
          .filter((tag) => {
            if (activeFilterIds.has(`tags:${tag.id}`)) return false;
            return (
              tag.label.toLowerCase().includes(q) ||
              tag.description?.toLowerCase().includes(q) ||
              tag.synonyms?.some((synonym) => synonym.toLowerCase().includes(q))
            );
          })
          .map((tag) => ({
            group: tag.category || "Temáticas",
            key: "tags",
            value: tag.id,
            label: tag.label,
            description: tag.description,
          })),
        ...allAudience
          .filter((audience) => {
            if (activeFilterIds.has(`targetAudience:${audience.id}`)) return false;
            return (
              audience.label.toLowerCase().includes(q) ||
              audience.description?.toLowerCase().includes(q) ||
              audience.synonyms?.some((synonym) => synonym.toLowerCase().includes(q))
            );
          })
          .map((audience) => ({
            group: "Público objetivo",
            key: "targetAudience",
            value: audience.id,
            label: audience.label,
            description: audience.description,
          })),
        ...allCommunities
          .filter((community) => {
            if (activeFilterIds.has(`name:${community.name}`)) return false;
            return community.name?.toLowerCase().includes(q);
          })
          .sort((left, right) => {
            const leftOrder = COMMUNITY_SUGGESTION_STATUS_ORDER[left.status] ?? 1;
            const rightOrder = COMMUNITY_SUGGESTION_STATUS_ORDER[right.status] ?? 1;

            if (leftOrder !== rightOrder) {
              return leftOrder - rightOrder;
            }

            return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
          })
          .slice(0, 12)
          .map((community) => ({
            group: "Comunidades",
            key: "name",
            value: community.name,
            label: community.name,
            description: "Comunidad",
            meta: buildCommunityMeta(community),
            communityIdentifier: community.id || slugifyCommunityName(community.name),
          })),
      ];

  const grouped = suggestions.reduce((acc, suggestion) => {
    (acc[suggestion.group] = acc[suggestion.group] || []).push(suggestion);
    return acc;
  }, {});

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
                aria-label={`Quitar ${filter.label}`}
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
                ? "Filtrar por temática, público o comunidad…"
                : "Añadir otro filtro…"
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
            title="Limpiar filtros"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>

      {showDropdown && Object.keys(grouped).length > 0 && (
        <div className="tag-search-dropdown">
          {Object.entries(grouped).map(([category, tags]) => (
            <div key={category} className="tag-search-group">
              <div className="tag-search-group-label">{category}</div>
              {tags.map((suggestion) => (
                <button
                  key={`${suggestion.key}:${suggestion.value}`}
                  className="tag-search-option"
                  onMouseDown={(e) => {
                    e.preventDefault();

                    if (suggestion.communityIdentifier) {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
