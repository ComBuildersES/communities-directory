/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import {
  useTags,
  useAudience,
  useAllCommunities,
  useCommunityActions,
} from "../../stores/community.store";
import { bajaString } from "../../constants";
import "./TagSearch.css";

export function TagSearch() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const allTags = useTags();
  const allAudience = useAudience();
  const allCommunities = useAllCommunities();
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
          .slice(0, 12)
          .map((community) => ({
            group: "Comunidades",
            key: "name",
            value: community.name,
            label: community.name,
            description: community.location || community.communityType || "Comunidad",
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
                    addFilter(suggestion);
                  }}
                >
                  <span className="tag-option-label">{suggestion.label}</span>
                  <span className="tag-option-desc">{suggestion.description}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
