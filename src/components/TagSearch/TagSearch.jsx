/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useLayoutEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  useTags,
  useAudience,
  useAllCommunities,
  useCBMemberHandles,
  useCommunityActions,
  useFilters,
} from "../../stores/community.store.js";
import { bajaString } from "../../constants";
import {
  buildDirectoryFilterPath,
  buildDirectoryStatePath,
  slugifyCommunityName,
} from "../../lib/communitySubmission";
import { scoreItem, scoreCommunity, matchesCommunityName, scoreRelatedCommunity } from "../../lib/fuzzyMatch";
import {
  MEMBER_QUERY_PREFIX,
  filterMemberSuggestions,
  githubAvatarUrl,
  normalizeHandle,
  parseMemberQuery,
} from "../../lib/cbMembers";
import "./TagSearch.css";
import { MatchHighlight } from './MatchHighlight.jsx';
import { TopicExplorer } from './TopicExplorer.jsx';

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

/**
 * Avatar de GitHub con caída a la inicial.
 *
 * La imagen la sirve GitHub, así que si falla (handle renombrado, red bloqueada) lo que queda
 * no puede ser un icono roto: el desplegable tiene que seguir leyéndose.
 */
function MemberAvatar({ handle, size = "1.25rem" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="cb-member-avatar cb-member-avatar--fallback" style={{ width: size, height: size }} aria-hidden="true">
        {handle.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className="cb-member-avatar"
      style={{ width: size, height: size }}
      src={githubAvatarUrl(handle)}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function TagSearch({ onShowResults }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [compact, setCompact] = useState(false);
  const [viewport, setViewport] = useState({});
  const listId = useId();
  const [copiedMember, setCopiedMember] = useState(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const allTags = useTags();
  const allAudience = useAudience();
  const allCommunities = useAllCommunities();
  const cbMemberHandles = useCBMemberHandles();
  const filters = useFilters();
  const { filterComunities, setFilters } = useCommunityActions();
  // Otro control (por ejemplo un avatar) puede reemplazar todos los filtros.
  // No conservar chips de selecciones que ya no existen en el store.
  useEffect(() => {
    setActiveFilters((current) => current.filter((filter) => filters[filter.key]?.includes(filter.value)));
  }, [filters]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const suppressFocus = useRef(false);
  const dedicated = showDropdown && compact;

  const closeSearch = () => {
    setShowDropdown(false);
    setActiveIndex(-1);
    suppressFocus.current = true;
    inputRef.current?.focus({ preventScroll: true });
    suppressFocus.current = false;
  };

  useLayoutEffect(() => {
    const update = () => {
      const visual = window.visualViewport;
      setCompact(window.innerWidth <= 700 || window.innerHeight <= 520);
      const top = containerRef.current?.getBoundingClientRect().bottom ?? 0;
      setViewport({
        '--search-available-height': `${Math.max(80, (visual?.height ?? window.innerHeight) + (visual?.offsetTop ?? 0) - top - 16)}px`,
        '--search-viewport-height': `${visual?.height ?? window.innerHeight}px`,
        '--search-viewport-top': `${visual?.offsetTop ?? 0}px`,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  useEffect(() => {
    if (!dedicated) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const siblings = [];
    // Mantener el mismo input evita perder el teclado virtual al ampliar la búsqueda.
    let node = containerRef.current;
    while (node && node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      node = node.parentElement;
      if (node === document.body) break;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      siblings.forEach(([sibling, inert]) => { sibling.inert = inert; });
    };
  }, [dedicated]);

  useEffect(() => {
    setActiveIndex(-1);
    if (dropdownRef.current) dropdownRef.current.scrollTop = 0;
  }, [query, filters]);

  useEffect(() => {
    if (showDropdown && activeIndex >= 0) {
      document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, listId, showDropdown]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, []);

  const activeFilterIds = new Set(
    Object.entries(filters).flatMap(([key, values]) => values.map((value) => `${key}:${value}`))
  );

  const q = query.trim();
  const { isMemberQuery, term: memberTerm } = parseMemberQuery(q);

  // Los chips de persona no son estado local como los demás: salen de los filtros del store,
  // que es lo que se restaura al abrir una URL compartida. Si fueran estado local, quien
  // recibe el enlace vería la lista filtrada sin nada que explicara por qué.
  const activeMemberHandles = filters.cbMembers ?? [];

  const memberSuggestions = !isMemberQuery
    ? []
    : filterMemberSuggestions(memberTerm, cbMemberHandles, activeMemberHandles).map((member) => ({
        sectionKey: "members",
        group: t("tagSearch.groupMembers"),
        key: "cbMembers",
        value: member.handle,
        label: `${MEMBER_QUERY_PREFIX}${member.label}`,
        description: t("tagSearch.memberCommunities", { count: member.count }),
        avatarHandle: member.handle,
      }));

  const tagSuggestions = isMemberQuery || q.length === 0
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

  const audienceSuggestions = isMemberQuery || q.length === 0
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

  const communityCandidates = isMemberQuery || !q
    ? []
    : allCommunities.filter((community) => community.hidden !== true);
  const buildCommunitySuggestions = (related = false) => communityCandidates
    .map((community) => ({
      community,
      score: related ? scoreRelatedCommunity(q, community.name)
        : matchesCommunityName(q, community.name) ? scoreCommunity(q, community.name) : null,
    }))
    .filter(({ score }) => score !== null)
    .sort((a, b) => b.score - a.score
      || (COMMUNITY_SUGGESTION_STATUS_ORDER[a.community.status] ?? 1) - (COMMUNITY_SUGGESTION_STATUS_ORDER[b.community.status] ?? 1)
      || a.community.name.localeCompare(b.community.name, 'es', { sensitivity: 'base' }))
    .map(({ community }) => ({
      key: 'name', value: community.name, label: community.name,
      meta: buildCommunityMeta(community, t),
      communityIdentifier: community.id ?? slugifyCommunityName(community.name),
    }));
  const communitySuggestions = buildCommunitySuggestions();
  const relatedSuggestions = buildCommunitySuggestions(true);
  const sections = [
    { key: 'members', label: t('tagSearch.groupMembers'), suggestions: memberSuggestions },
    { key: 'communities', label: t('tagSearch.groupCommunities'), suggestions: communitySuggestions },
    { key: 'topics', label: t('tagSearch.groupTopics'), suggestions: tagSuggestions },
    { key: 'audience', label: t('tagSearch.groupAudience'), suggestions: audienceSuggestions },
    { key: 'related', label: t('tagSearch.related', { defaultValue: 'Coincidencias aproximadas o parciales' }), suggestions: relatedSuggestions },
  ].filter((section) => section.suggestions.length > 0);
  let optionIndex = 0;
  const indexedSections = sections.map((section) => ({ ...section,
    suggestions: section.suggestions.map((suggestion) => ({ ...suggestion, index: optionIndex++ })),
  }));
  const suggestions = indexedSections.flatMap((section) => section.suggestions);

  const addFilter = (filter) => {
    setActiveFilters((prev) => [...prev, filter]);
    filterComunities(filter.key, filter.value);
    setQuery("");
    setShowDropdown(false);
    suppressFocus.current = true;
    inputRef.current?.focus({ preventScroll: true });
    suppressFocus.current = false;
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

  const addMemberFilter = (handle) => {
    filterComunities("cbMembers", normalizeHandle(handle));
    setQuery("");
    setShowDropdown(false);
    suppressFocus.current = true;
    inputRef.current?.focus({ preventScroll: true });
    suppressFocus.current = false;
  };

  const removeMemberFilter = (handle) => {
    filterComunities("cbMembers", bajaString + handle);
  };

  /**
   * Copia el enlace a *esta* persona, con los filtros que haya puestos.
   *
   * No vale con decirle a alguien que copie la barra de direcciones: en móvil está escondida,
   * y el objetivo del botón es justo mandarle a esa persona lo suyo.
   */
  const copyMemberLink = async (handle) => {
    const path = buildDirectoryFilterPath({
      filters: { ...filters, cbMembers: [handle] },
    });
    const url = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedMember(handle);
      window.setTimeout(() => setCopiedMember((current) => (current === handle ? null : current)), 2000);
    } catch {
      // Sin permiso de portapapeles (http, Safari sin gesto): abrir el enlace deja a la
      // persona en una pestaña cuya URL sí puede copiar a mano.
      window.open(url, "_blank", "noopener,noreferrer");
    }
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
    activeMemberHandles.forEach((handle) => removeMemberFilter(handle));
    setActiveFilters([]);
  };

  const activateSuggestion = (suggestion, event = {}) => {
    if (event.metaKey || event.ctrlKey) {
      if (suggestion.communityIdentifier != null) openCommunityDetails(suggestion, true);
      else openFilterInNewTab(suggestion);
      return;
    }
    if (suggestion.communityIdentifier != null) openCommunityDetails(suggestion);
    else if (suggestion.key === 'cbMembers') addMemberFilter(suggestion.value);
    else addFilter(suggestion);
  };

  const submitSearch = () => {
    if (!q) return;
    if (isMemberQuery) {
      if (memberSuggestions.length === 1) activateSuggestion(memberSuggestions[0]);
      else if (memberSuggestions.length > 1) setActiveIndex(0);
      return;
    }
    const nextFilters = { ...filters, nameQuery: [q] };
    delete nextFilters.name;
    setFilters(nextFilters);
    setQuery('');
    setShowDropdown(false);
    onShowResults?.();
    dismissActiveInput();
    requestAnimationFrame(() => {
      const summary = document.querySelector('.results-summary');
      summary?.focus({ preventScroll: true });
      summary?.scrollIntoView({ block: 'nearest' });
    });
  };

  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && showDropdown) {
      event.preventDefault();
      event.stopPropagation();
      closeSearch();
    }
    if (dedicated && event.key === 'Tab') {
      const controls = [...containerRef.current.querySelectorAll('button:not(:disabled), input')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
    if (event.target !== inputRef.current) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setShowDropdown(true);
      if (suggestions.length) setActiveIndex((index) => event.key === 'ArrowDown'
        ? (index + 1) % suggestions.length
        : (index <= 0 ? suggestions.length - 1 : index - 1));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (showDropdown && suggestions[activeIndex]) activateSuggestion(suggestions[activeIndex], event);
      else submitSearch();
    }
  };

  return (
    <div className="tag-search-slot">
      <div className={`tag-search-bar${dedicated ? ' tag-search-bar--dedicated' : ''}`}
        ref={containerRef} style={viewport} onKeyDown={handleKeyDown}
        role={dedicated ? 'dialog' : undefined} aria-modal={dedicated ? true : undefined}
        aria-label={dedicated ? t('tagSearch.searchLabel', { defaultValue: 'Buscar comunidades' }) : undefined}
        onBlur={(event) => {
          if (!dedicated && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setShowDropdown(false);
        }}
      >
        <div className="tag-search-row">
        <div className="tag-search-inner">
          <i className="fas fa-search tag-search-icon" aria-hidden="true"></i>
          <div className="tag-search-chips">
            {activeMemberHandles.map((handle) => {
              const member = cbMemberHandles.find((item) => item.handle === normalizeHandle(handle));
              const label = member?.label ?? handle;
              return (
                <span key={`cbMembers:${handle}`} className="tag-chip tag-chip--cbMembers">
                  <MemberAvatar handle={handle} size="1rem" />
                  {`${MEMBER_QUERY_PREFIX}${label}`}
                  <button type="button" className="tag-chip-action" onClick={() => copyMemberLink(handle)}
                    title={t('tagSearch.copyMemberLink')} aria-label={t('tagSearch.copyMemberLink')}>
                    <i className={copiedMember === handle ? 'fas fa-check' : 'fas fa-link'} aria-hidden="true"></i>
                  </button>
                  <button type="button" className="tag-chip-remove" onClick={() => removeMemberFilter(handle)}
                    aria-label={t('tagSearch.removeChip', { label })}>×</button>
                </span>
              );
            })}
            {activeFilters.map((filter) => (
              <span key={`${filter.key}:${filter.value}`} className={`tag-chip tag-chip--${filter.key}`}>
                {filter.label}
                <button type="button" className="tag-chip-remove" onClick={() => removeFilter(filter)}
                  aria-label={t('tagSearch.removeChip', { label: filter.label })}>×</button>
              </span>
            ))}
            <input ref={inputRef} className="tag-search-input" type="text" role="combobox"
              aria-label={t('tagSearch.searchLabel', { defaultValue: 'Buscar comunidades' })}
              aria-autocomplete="list" aria-expanded={showDropdown}
              aria-controls={showDropdown ? listId : undefined}
              aria-activedescendant={showDropdown && activeIndex >= 0 && suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
              autoComplete="off" enterKeyHint="search"
              placeholder={activeFilters.length === 0 && activeMemberHandles.length === 0
                ? t('tagSearch.placeholder') : t('tagSearch.placeholderMore')}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); setShowDropdown(true); }}
              onFocus={() => { if (!suppressFocus.current) setShowDropdown(true); }}
            />
          </div>
          {(activeFilters.length > 0 || activeMemberHandles.length > 0) && (
            <button type="button" className="tag-search-clear" onClick={clearAll}
              title={t('tagSearch.clearFilters')} aria-label={t('tagSearch.clearFilters')}>
              <i className="fas fa-times-circle" aria-hidden="true"></i>
            </button>
          )}
          {dedicated && <button type="button" className="tag-search-close" onClick={closeSearch}
            aria-label={t('tagSearch.close', { defaultValue: 'Cerrar búsqueda' })}>×</button>}
        </div>
        <button type="button" className="button is-light tag-search-explore" aria-haspopup="dialog" disabled={allTags.length === 0}
          onClick={() => { setShowDropdown(false); setExplorerOpen(true); }}>
          <i className="fas fa-tags" aria-hidden="true"></i><span>{t('topicExplorer.title')}</span>
        </button>
        </div>
        {showDropdown && (
          <div className="tag-search-dropdown" ref={dropdownRef}>
            {q && !isMemberQuery && (
              <div className="tag-search-submit-row">
                <button type="button" className="tag-search-submit" onClick={submitSearch}>
                  <i className="fas fa-search" aria-hidden="true"></i>
                  <span>{t('tagSearch.submitName', { query: q, defaultValue: 'Buscar «{{query}}» por nombre' })}</span>
                  <span className="tag-search-enter" aria-hidden="true">↵</span>
                </button>
                {communitySuggestions.length === 0 && sections.length > 0 && <p className="tag-search-empty" role="status">
                  {t('tagSearch.noNames', { defaultValue: 'No hay nombres que coincidan con todas las palabras.' })}
                </p>}
              </div>
            )}
            {!q && <p className="tag-search-empty">{t('tagSearch.startHint', { defaultValue: 'Busca una comunidad por nombre o elige una temática, un público o una persona con @.' })}</p>}
            {q && sections.length === 0 && <p className="tag-search-empty" role="status">
              {isMemberQuery ? t('tagSearch.noMembers', { defaultValue: 'No se encontraron personas. Prueba con otro nombre de usuario.' })
                : t('tagSearch.noSuggestions', { defaultValue: 'Sin sugerencias. Prueba con otro término.' })}
            </p>}
            <div id={listId} role="listbox" aria-label={t('tagSearch.suggestions', { defaultValue: 'Sugerencias de búsqueda' })}>
              {indexedSections.map(({ key, label, suggestions: items }) => (
                <div key={key} className={`tag-search-group tag-search-group--${key}`} role="group" aria-label={label}>
                  <div className="tag-search-group-label" aria-hidden="true">{label}</div>
                  {items.map((suggestion) => (
                    <button type="button" key={`${suggestion.key}:${suggestion.value}`} id={`${listId}-${suggestion.index}`}
                      role="option" aria-selected={activeIndex === suggestion.index}
                      className={`tag-search-option${activeIndex === suggestion.index ? ' tag-search-option--selected' : ''}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => activateSuggestion(suggestion, event)}>
                      <span className="tag-option-heading">
                        <span className="tag-option-label">
                          {suggestion.avatarHandle && <MemberAvatar handle={suggestion.avatarHandle} />}
                          <MatchHighlight text={suggestion.label} query={isMemberQuery ? memberTerm : q} />
                        </span>
                        <span className="tag-option-action">{suggestion.communityIdentifier != null
                          ? t('tagSearch.openDetails', { defaultValue: 'Abrir ficha' })
                          : t('tagSearch.applyFilter', { defaultValue: 'Filtrar' })}</span>
                      </span>
                      {suggestion.meta?.length ? <span className="tag-option-meta" aria-hidden="true">
                        {suggestion.meta.map((item) => <span key={item.value} className={item.className}>{item.value}</span>)}
                      </span> : <span className="tag-option-desc">
                        <MatchHighlight text={suggestion.description} query={q.length > 1 ? (isMemberQuery ? memberTerm : q) : ''} />
                      </span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {explorerOpen && <TopicExplorer onClose={() => setExplorerOpen(false)} onApplied={() => {
        onShowResults?.();
        requestAnimationFrame(() => {
          const summary = document.querySelector('.results-summary');
          summary?.focus({ preventScroll: true });
          summary?.scrollIntoView({ block: 'nearest' });
        });
      }} />}
    </div>
  );
}
