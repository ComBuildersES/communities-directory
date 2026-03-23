/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { useTags, useCommunityActions } from "../../stores/community.store";
import { bajaString } from "../../constants";
import "./TagSearch.css";

export function TagSearch() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const allTags = useTags();
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

  const activeTagIds = new Set(activeTags.map((t) => t.id));

  const suggestions =
    query.trim().length < 2
      ? []
      : allTags.filter((tag) => {
          if (activeTagIds.has(tag.id)) return false;
          const q = query.toLowerCase();
          return (
            tag.label.toLowerCase().includes(q) ||
            tag.description?.toLowerCase().includes(q) ||
            tag.synonyms?.some((s) => s.toLowerCase().includes(q))
          );
        });

  const grouped = suggestions.reduce((acc, tag) => {
    (acc[tag.category] = acc[tag.category] || []).push(tag);
    return acc;
  }, {});

  const addTag = (tag) => {
    setActiveTags((prev) => [...prev, { id: tag.id, label: tag.label }]);
    filterComunities("tags", tag.id);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag) => {
    setActiveTags((prev) => prev.filter((t) => t.id !== tag.id));
    filterComunities("tags", bajaString + tag.id);
  };

  const clearAll = () => {
    activeTags.forEach((t) => filterComunities("tags", bajaString + t.id));
    setActiveTags([]);
  };

  return (
    <div className="tag-search-bar" ref={containerRef}>
      <div className="tag-search-inner">
        <i className="fas fa-tags tag-search-icon"></i>
        <div className="tag-search-chips">
          {activeTags.map((tag) => (
            <span key={tag.id} className="tag-chip">
              {tag.label}
              <button
                className="tag-chip-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Quitar ${tag.label}`}
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
              activeTags.length === 0
                ? "Filtrar por temática…"
                : "Añadir otra temática…"
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          />
        </div>
        {activeTags.length > 0 && (
          <button
            className="tag-search-clear"
            onClick={clearAll}
            title="Limpiar filtros de temática"
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
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className="tag-search-option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(tag);
                  }}
                >
                  <span className="tag-option-label">{tag.label}</span>
                  <span className="tag-option-desc">{tag.description}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
