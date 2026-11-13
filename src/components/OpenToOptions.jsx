/* eslint-disable react/prop-types */
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { OPEN_TO_OPTIONS } from '../lib/communityOpenTo.js';
import { useCommunityActions, useFilters } from '../stores/community.store.js';
import { bajaString } from '../constants';
import './OpenToOptions.css';
import './switch.css';

function InfoTooltip({ label, text }) {
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
    <button ref={anchor} type="button" className="open-to-info" aria-label={label}
      aria-describedby={position ? id : undefined}
      onMouseEnter={show} onMouseLeave={scheduleClose} onFocus={show}
      onBlur={() => setPosition(null)} onClick={show}>
      <i className="fas fa-circle-info" aria-hidden="true" />
    </button>
    {position && createPortal(<span ref={bubble} id={id} role="tooltip" className="open-to-tooltip" style={position} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>{text}</span>, document.body)}
  </>;
}

export function OpenToOptions({ selected = [], onToggle, switches = false }) {
  const { t } = useTranslation();
  const Label = switches ? "span" : "label";
  return <div className="open-to-options">
    {OPEN_TO_OPTIONS.map((option) => <div key={option} className="option-item open-to-option is-size-7">
      <Label className="open-to-label">
        {!switches && <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />}
        {t(`openTo.labels.${option}`)}
      </Label>
      <InfoTooltip label={t('openTo.info', { option: t(`openTo.labels.${option}`) })} text={t(`openTo.descriptions.${option}`)} />
      {switches && <button type="button" role="switch" aria-checked={selected.includes(option)}
        aria-label={t(`openTo.labels.${option}`)} onClick={() => onToggle(option)}
        className={`custom-switch ${selected.includes(option) ? 'on' : 'off'}`}><span className="switch-slider" /></button>}
    </div>)}
  </div>;
}

export function OpenToFilters() {
  const filters = useFilters();
  const { filterComunities } = useCommunityActions();
  return <OpenToOptions switches selected={filters.openTo ?? []}
    onToggle={(option) => filterComunities('openTo', filters.openTo?.includes(option) ? bajaString + option : option)} />;
}
