/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllCommunities, useCommunityActions, useFilters, useInvertedIndex, useTags, useAudience } from '../../stores/community.store.js';
import { groupTopics, searchTopics, withExplorerSelection, EXPLORER_FACETS } from '../../lib/topicExplorer.js';
import { searchFaceted } from '../../data/searchFaceted.js';
import { InfoTooltip } from '../OpenToOptions.jsx';
import { MatchHighlight } from './MatchHighlight.jsx';
import { buildTopicSuggestionIssueUrl, classifySuggestedTopics, UNDECIDED_TOPIC_CATEGORY } from '../../lib/topicSuggestions.js';
import './TopicExplorer.css';

export function TopicExplorer({ onClose, onApplied }) {
  const { t } = useTranslation();
  const filters = useFilters();
  const allTags = useTags();
  const allAudience = useAudience();
  const [catalog, setCatalog] = useState('topics');
  const tags = catalog === 'audience' ? allAudience : allTags;
  const copy = (key, values) => t(`topicExplorer.${catalog === 'audience' ? 'audience.' : ''}${key}`, values);
  const communities = useAllCommunities();
  const index = useInvertedIndex();
  const { setFilters } = useCommunityActions();
  const [drafts, setDrafts] = useState(() => Object.fromEntries(Object.entries(EXPLORER_FACETS).map(([name, facet]) => [name, {
    selected: [...(filters[facet.key] ?? [])], mode: filters[facet.modeKey]?.includes('all') ? 'all' : 'any',
    query: '', category: null, suggestion: null,
  }])));
  const { selected, mode, query, category, suggestion } = drafts[catalog];
  const updateDraft = (field, value) => setDrafts(current => ({ ...current, [catalog]: {
    ...current[catalog], [field]: typeof value === 'function' ? value(current[catalog][field]) : value,
  } }));
  const setSelected = value => updateDraft('selected', value);
  const setMode = value => updateDraft('mode', value);
  const setQuery = value => updateDraft('query', value);
  const setCategory = value => updateDraft('category', value);
  const setSuggestion = value => updateDraft('suggestion', value);
  const [suggesting, setSuggesting] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const namesRef = useRef(null);
  const suggestionTriggerRef = useRef(null);
  const titleId = useId();
  const modeId = useId();
  const tabsId = useId();
  const panelId = useId();
  const tabRefs = useRef({});
  const suggestionFormId = useId();
  const namesId = useId();
  const namesHintId = useId();
  const categoryId = useId();
  const groups = useMemo(() => groupTopics(tags, catalog), [tags, catalog]);
  const tagsById = useMemo(() => new Map(tags.map(tag => [tag.id, tag])), [tags]);
  const searching = query.trim().length > 0;
  const visibleTags = searching ? searchTopics(tags, query) : groups.find(group => group.category === category)?.items ?? [];
  const categoryItems = groups.find(group => group.category === category)?.items ?? [];
  const categoryAdded = categoryItems.length > 0 && categoryItems.every(tag => selected.includes(tag.id));
  const { proposed, existing } = useMemo(() => classifySuggestedTopics(suggestion?.text ?? '', tags), [suggestion?.text, tags]);
  const issueUrl = buildTopicSuggestionIssueUrl({ names: proposed, category: suggestion?.category ?? '', catalog });
  const nextFilters = useMemo(() => withExplorerSelection(filters, drafts), [filters, drafts]);
  const count = useMemo(() => searchFaceted(communities.filter(community => community.hidden !== true), index, nextFilters).length,
    [communities, index, nextFilters]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    inputRef.current.focus({ preventScroll: true });
    const viewport = window.visualViewport;
    const updateViewport = () => {
      dialog.style.setProperty('--topic-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
      dialog.style.setProperty('--topic-viewport-top', `${viewport?.offsetTop ?? 0}px`);
    };
    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = 0;
    const title = body.querySelector('.topic-explorer-section-title');
    // En una ventana baja, la navegación debe dejar a la vista las temáticas elegidas.
    if (body.clientHeight < 250 && title) {
      body.scrollTop = Math.max(0, title.getBoundingClientRect().top - body.getBoundingClientRect().top - (category && !query.trim() ? 32 : 0));
    }
  }, [query, category, suggesting, catalog]);

  useLayoutEffect(() => {
    if (suggesting) namesRef.current?.focus({ preventScroll: true });
  }, [suggesting]);

  useLayoutEffect(() => {
    const focused = document.activeElement;
    if (dialogRef.current?.contains(focused) && focused.classList.contains('topic-explorer-chip')) {
      focused.scrollIntoView({ block: 'nearest' });
    }
  }, [selected.length]);

  const toggle = id => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const openSuggestion = () => {
    setSuggestion(current => current ?? { text: query.trim(), category: !searching ? category ?? '' : '' });
    setSuggesting(true);
  };
  const backToExplorer = () => {
    setSuggesting(false);
    requestAnimationFrame(() => suggestionTriggerRef.current?.focus({ preventScroll: true }));
  };
  const apply = () => {
    setFilters(nextFilters);
    onClose();
    onApplied?.();
  };

  return <dialog ref={dialogRef} className="topic-explorer" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); if (suggesting) backToExplorer(); else onClose(); }}
    onKeyDown={event => {
      // La primera pulsación cierra la ayuda; la siguiente cierra el explorador.
      if (event.key === 'Escape' && dialogRef.current.querySelector('[role="tooltip"]')) event.preventDefault();
    }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="topic-explorer-header">
      <div className="topic-explorer-heading">
        <h2 id={titleId}>{suggesting ? copy('suggestion.title') : t('topicExplorer.title')}</h2>
        <button type="button" className="topic-explorer-close" onClick={onClose} aria-label={t('topicExplorer.close')}>×</button>
      </div>
      {!suggesting && <>
      <div className="topic-explorer-tabs" role="tablist" aria-label={t('topicExplorer.catalogues')}>
        {Object.keys(EXPLORER_FACETS).map((name, position, names) => <button key={name} type="button" role="tab"
          id={`${tabsId}-${name}`} aria-controls={panelId} aria-selected={catalog === name}
          tabIndex={catalog === name ? 0 : -1} ref={element => { tabRefs.current[name] = element; }}
          onClick={() => setCatalog(name)} onKeyDown={event => {
            let next;
            if (event.key === 'ArrowRight') next = names[(position + 1) % names.length];
            if (event.key === 'ArrowLeft') next = names[(position + names.length - 1) % names.length];
            if (event.key === 'Home') next = names[0];
            if (event.key === 'End') next = names[names.length - 1];
            if (next) { event.preventDefault(); setCatalog(next); tabRefs.current[next]?.focus(); }
          }}>
          {t(`topicExplorer.tabs.${name}`)}
          {drafts[name].selected.length > 0 && <span className="topic-explorer-tab-count" aria-hidden="true">{drafts[name].selected.length}</span>}
        </button>)}
      </div>
      <input ref={inputRef} className="input topic-explorer-search" type="search" value={query}
        aria-label={copy('searchLabel')} placeholder={copy('searchPlaceholder')}
        onChange={event => setQuery(event.target.value)} />
      <div className="topic-explorer-selection-heading">
        <span>{copy('selected', { count: selected.length })}{selected.length > 1 ? ` · ${copy(mode)}` : ''}</span>
        {selected.length > 0 && <button type="button" className="topic-explorer-text-button" onClick={() => setSelected([])}>{copy('clearSelection')}</button>}
      </div>
      {selected.length > 0 && <div className="topic-explorer-selection" aria-label={copy('selectionLabel')}>
        {selected.map(id => <button type="button" className="topic-explorer-selected-chip" key={id}
          onClick={() => toggle(id)} aria-label={copy('remove', { label: tagsById.get(id)?.label ?? id })}>
          {tagsById.get(id)?.label ?? id}<span aria-hidden="true">×</span>
        </button>)}
      </div>}</>}
    </div>
    <div className="topic-explorer-body" ref={bodyRef} id={panelId} role={!suggesting ? 'tabpanel' : undefined}
      aria-labelledby={!suggesting ? `${tabsId}-${catalog}` : undefined}>
      {suggesting ? <form id={suggestionFormId} className="topic-explorer-suggestion-form" onSubmit={event => {
        event.preventDefault();
        if (issueUrl) window.open(issueUrl, '_blank', 'noopener,noreferrer');
      }}>
        <div className="field">
          <label className="label" htmlFor={namesId}>{copy('suggestion.names')}</label>
          <p id={namesHintId} className="topic-explorer-field-hint">{copy('suggestion.namesHint')}</p>
          <textarea ref={namesRef} id={namesId} className="textarea" rows={3} required maxLength={800}
            aria-describedby={namesHintId} value={suggestion?.text ?? ''}
            onChange={event => setSuggestion(current => ({ ...current, text: event.target.value }))} />
        </div>
        {existing.length > 0 && <p className="topic-explorer-existing" role="status">
          {copy('suggestion.existing', { names: existing.map(tag => tag.label).join(', ') })}
        </p>}
        <div className="field">
          <label className="label" htmlFor={categoryId}>{t('topicExplorer.suggestion.category')}</label>
          <div className="select is-fullwidth">
            <select id={categoryId} required value={suggestion?.category ?? ''}
              onChange={event => setSuggestion(current => ({ ...current, category: event.target.value }))}>
              <option value="" disabled>{t('topicExplorer.suggestion.chooseCategory')}</option>
              {groups.map(group => <option key={group.category} value={group.category}>{group.category}</option>)}
              <option value={UNDECIDED_TOPIC_CATEGORY}>{t('topicExplorer.suggestion.undecided')}</option>
            </select>
          </div>
        </div>
        <p className="topic-explorer-field-hint">{t('topicExplorer.suggestion.githubHint')}</p>
      </form> : <>
      <fieldset className="topic-explorer-mode">
        <legend>{copy('combine')}</legend>
        <div className="topic-explorer-mode-options">
          {['any', 'all'].map(value => <label key={value} className={mode === value ? 'is-selected' : ''}>
            <input type="radio" name={modeId} value={value} checked={mode === value} onChange={() => setMode(value)} />
            <span>{copy(value)}</span>
          </label>)}
          <InfoTooltip label={copy('modeHelpLabel')} text={copy('modeHelp')}
            portalTarget={() => dialogRef.current} />
        </div>
      </fieldset>
      {!searching && !category ? <div className="topic-explorer-categories">
        {groups.map(group => <button type="button" className="topic-explorer-category" key={group.category}
          onClick={() => setCategory(group.category)}>
          <strong>{group.category}</strong>
          <span>{group.examples.join(', ')}…</span>
          <span className="topic-explorer-category-count">{copy('topicCount', { count: group.items.length })}</span>
        </button>)}
      </div> : <>
        {!searching && <button type="button" className="topic-explorer-text-button topic-explorer-back" onClick={() => setCategory(null)}>
          <span aria-hidden="true">← </span>{t('topicExplorer.categories')}
        </button>}
        <div className="topic-explorer-section-heading">
          <h3 className="topic-explorer-section-title">{searching ? copy('searchResults', { count: visibleTags.length }) : category}</h3>
          {!searching && category && <button type="button" className="button is-small is-light topic-explorer-add-category"
            disabled={categoryAdded} onClick={() => setSelected(current => [...new Set([...current, ...categoryItems.map(tag => tag.id)])])}>
            {copy(categoryAdded ? 'categoryAdded' : 'addCategory')}
          </button>}
        </div>
        {visibleTags.length > 0 ? <div className="topic-explorer-topics">
          {visibleTags.map(tag => <InfoTooltip key={tag.id} className={`topic-explorer-chip${selected.includes(tag.id) ? ' is-selected' : ''}`}
            label={tag.label} text={tag.description || tag.label} pressed={selected.includes(tag.id)}
            onClick={() => toggle(tag.id)} portalTarget={() => dialogRef.current}>
            <span aria-hidden="true">{selected.includes(tag.id) ? '✓' : '+'}</span>
            <MatchHighlight text={tag.label} query={searching ? query : ''} />
          </InfoTooltip>)}
        </div> : <p className="topic-explorer-empty" role="status">{copy('noTopics')}</p>}
      </>}</>}
    </div>
    <div className="topic-explorer-footer">
      {suggesting ? <>
        <button type="button" className="topic-explorer-text-button" onClick={backToExplorer}>{t('topicExplorer.suggestion.back')}</button>
        <button type="submit" form={suggestionFormId} className="button is-primary" disabled={!issueUrl}>{t('topicExplorer.suggestion.continue')}</button>
      </> : <>
        <button ref={suggestionTriggerRef} type="button" className="topic-explorer-text-button" onClick={openSuggestion}>{copy('suggestion.title')}</button>
        <span className="is-sr-only" role="status" aria-live="polite" aria-atomic="true">{t('topicExplorer.communityCount', { count })}</span>
        <button type="button" className="button is-primary" disabled={count === 0} onClick={apply}>{t('topicExplorer.apply', { count })}</button>
      </>}
    </div>
  </dialog>;
}
