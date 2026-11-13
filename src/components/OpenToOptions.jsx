/* eslint-disable react/prop-types */
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { OPEN_TO_OPTIONS, availableOpenToOptions, normalizeOpenTo } from '../lib/communityOpenTo.js';
import { useAllCommunities, useCommunityActions, useFilters } from '../stores/community.store.js';
import { bajaString } from '../constants';
import './OpenToOptions.css';
import './switch.css';

export function InfoTooltip({ label, text, children, className = 'open-to-info' }) {
  const id = useId();
  const anchor = useRef(null);
  const bubble = useRef(null);
  const closeTimer = useRef(null);
  function cancelClose() { clearTimeout(closeTimer.current); }
  function scheduleClose() { closeTimer.current = setTimeout(() => setPosition(null), 150); }
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const [position, setPosition] = useState(null);
  function show() {
    cancelClose();
    const rect = anchor.current.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - 24);
    setPosition({ width, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      ...(rect.top > window.innerHeight / 2
        ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }) });
  }
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    const escape = (event) => { if (event.key === 'Escape') close(); };
    const outside = (event) => {
      if (!anchor.current?.contains(event.target) && !bubble.current?.contains(event.target)) close();
    };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [position]);
  return <>
    <button ref={anchor} type="button" className={className} aria-label={label}
      aria-describedby={position ? id : undefined}
      onMouseEnter={show} onMouseLeave={scheduleClose} onFocus={show}
      onBlur={() => setPosition(null)} onClick={show}>
      {children ?? <i className="fas fa-circle-info" aria-hidden="true" />}
    </button>
    {position && createPortal(<span ref={bubble} id={id} role="tooltip" className="open-to-tooltip" style={position} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>{text}</span>, document.body)}
  </>;
}

export function OpenToOptions({ selected = [], onToggle, switches = false, options = OPEN_TO_OPTIONS }) {
  const { t } = useTranslation();
  const selectId = useId();
  if (switches) return <div className="open-to-options">
    {options.map((option) => <div key={option} className="option-item open-to-option is-size-7">
      <span className="open-to-label">{t(`openTo.labels.${option}`)}</span>
      <InfoTooltip label={t('openTo.info', { option: t(`openTo.labels.${option}`) })} text={t(`openTo.descriptions.${option}`)} />
      <button type="button" role="switch" aria-checked={selected.includes(option)}
        aria-label={t(`openTo.labels.${option}`)} onClick={() => onToggle(option)}
        className={`custom-switch ${selected.includes(option) ? 'on' : 'off'}`}><span className="switch-slider" /></button>
    </div>)}
  </div>;

  const remaining = options.filter((option) => !selected.includes(option));
  return <div className="open-to-picker">
    <div className="select is-fullwidth">
      <select id={selectId} aria-label={t('openTo.add')} value="" disabled={remaining.length === 0}
        onChange={(event) => { if (event.target.value) onToggle(event.target.value); }}>
        <option value="" disabled>{t(remaining.length ? 'openTo.add' : 'openTo.allAdded')}</option>
        {remaining.map((option) => <option key={option} value={option}>{t(`openTo.labels.${option}`)}</option>)}
      </select>
    </div>
    {selected.length > 0 && <div className="open-to-chips">
      {normalizeOpenTo(selected).map((option) => <span className="open-to-chip" key={option}>
        <InfoTooltip className="open-to-chip-label"
          label={t('openTo.info', { option: t(`openTo.labels.${option}`) })}
          text={t(`openTo.descriptions.${option}`)}>{t(`openTo.labels.${option}`)}</InfoTooltip>
        <button type="button" className="open-to-chip-remove" onClick={() => onToggle(option)}
          aria-label={t('openTo.remove', { option: t(`openTo.labels.${option}`) })}>×</button>
      </span>)}
    </div>}
  </div>;
}

export function OpenToFilters() {
  const filters = useFilters();
  const communities = useAllCommunities();
  const { filterComunities } = useCommunityActions();
  return <OpenToOptions switches options={availableOpenToOptions(communities)} selected={filters.openTo ?? []}
    onToggle={(option) => filterComunities('openTo', filters.openTo?.includes(option) ? bajaString + option : option)} />;
}
