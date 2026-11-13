/* eslint-disable react/prop-types */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAllCommunities, useCBMemberHandles, useIsLoading } from "../../stores/community.store.js";
import { githubAvatarUrl, normalizeHandle } from "../../lib/cbMembers.js";
import {
  BUILDERS_EMAIL,
  BUILDERS_TELEGRAM_URL,
  BUILDER_STORIES,
  BUILDERS_INITIATIVES_URL,
  JOIN_BUILDERS_URL,
  buildBuilderProfiles,
  displayLocation,
  parseCopyLinks,
  shuffle,
  visibleFaces,
} from "../../lib/communityBuilders.js";
import "./CommunityBuildersModal.css";

/** Un párrafo del copy, con los enlaces que traiga escritos en markdown. */
function Copy({ text, className }) {
  return (
    <p className={className}>
      {parseCopyLinks(text).map((part, index) => (part.type === "text"
        ? <span key={index}>{part.value}</span>
        : (
          <a
            key={index}
            href={part.href}
            {...(part.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {part.value}
          </a>
        )))}
    </p>
  );
}

/** Las pestañas van por pregunta, en el orden en que alguien de fuera las hace. */
const TABS = [
  { id: "who", icon: "fa-users" },
  { id: "what", icon: "fa-handshake-angle" },
  { id: "stories", icon: "fa-comments" },
  { id: "join", icon: "fa-door-open" },
];

/** Cuántas caras se ven a la vez y cada cuánto rota la ventana. */
const FACE_WINDOW = 10;
const FACE_ROTATION_MS = 2600;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Una cara. El tooltip sale al pasar el ratón y también con foco de teclado; en táctil no
 * hay hover, así que ahí el primer toque lo abre y el segundo navega.
 */
function MemberFace({ handle, profiles, onSelect, size = "md" }) {
  const { t } = useTranslation();
  const tooltipId = useId();
  const [tooltip, setTooltip] = useState(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);
  const anchor = useRef(null);
  const profile = profiles.get(normalizeHandle(handle));

  const show = useCallback(() => {
    clearTimeout(timer.current);
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      left: Math.max(12, Math.min(rect.left + rect.width / 2 - 125, window.innerWidth - 262)),
      top: Math.min(rect.bottom + 8, window.innerHeight - 180),
    });
  }, []);
  const hide = () => { timer.current = setTimeout(() => setTooltip(null), 120); };

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!tooltip) return;
    const dismiss = (event) => {
      if (!event.target?.closest?.(".cb-tooltip")) setTooltip(null);
    };
    document.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [tooltip]);

  return (
    <span
      className={`cb-face-wrap cb-face-wrap--${size}`}
      ref={anchor}
      // Todo lo que no sea un dedo abre el tooltip al pasar por encima: ratón, lápiz y
      // cualquier puntero que el navegador no sepa nombrar.
      onPointerEnter={(event) => { if (event.pointerType !== "touch") show(); }}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setTooltip(null); }}
    >
      <button
        type="button"
        className="cb-face"
        aria-label={t(profile ? "builders.viewMember" : "builders.noMember", { handle })}
        aria-describedby={tooltip ? tooltipId : undefined}
        onClick={(event) => {
          // Táctil: el primer toque enseña de quién es la cara, el segundo filtra.
          if (event.nativeEvent.pointerType === "touch" && !tooltip) { show(); return; }
          if (profile) onSelect(normalizeHandle(handle));
        }}
      >
        {failed
          ? <span aria-hidden="true">{handle[0].toUpperCase()}</span>
          : <img src={githubAvatarUrl(handle, 96)} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
      </button>
      {tooltip && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="cb-tooltip"
          style={tooltip}
          onMouseEnter={() => clearTimeout(timer.current)}
          onMouseLeave={hide}
        >
          <strong>@{handle}</strong>
          {profile
            ? profile.communities.map((community) => {
              const place = displayLocation(community.location);
              return (
                <span key={community.id}>
                  {community.name}{place && <em> · {place}</em>}
                </span>
              );
            })
            : <span>{t("builders.noMember", { handle })}</span>}
          {profile && <span className="cb-tooltip-hint">{t("builders.tooltipHint")}</span>}
        </span>, document.body)}
    </span>
  );
}

/** El lado de una historia que no es una persona concreta: el grupo. */
function GroupFace({ size = "md" }) {
  const { t } = useTranslation();
  return (
    <span className={`cb-face-wrap cb-face-wrap--${size}`} title={t("builders.groupFace")}>
      <span className="cb-face cb-face--group" aria-label={t("builders.groupFace")} role="img">
        <i className="fas fa-people-group" aria-hidden="true" />
      </span>
    </span>
  );
}

function StorySide({ role, handles, profiles, onSelect }) {
  return (
    <div className="cb-story-side">
      <span className="cb-story-role">{role}</span>
      <div className="cb-story-faces">
        {handles.length === 0
          ? <GroupFace />
          : handles.map((handle) => (
            <MemberFace key={handle} handle={handle} profiles={profiles} onSelect={onSelect} />
          ))}
      </div>
    </div>
  );
}

/**
 * Historias: el título y las dos caras de la ayuda. Una sola a la vez, con navegación: siete
 * tarjetas apiladas se leían como un changelog y nadie pasaba de la segunda.
 */
function StoriesTab({ profiles, onSelect }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const story = BUILDER_STORIES[index];
  const move = (direction) => setIndex((current) => (current + direction + BUILDER_STORIES.length) % BUILDER_STORIES.length);

  return (
    <div
      className="cb-stories"
      role="region"
      aria-roledescription={t("builders.carousel")}
      aria-label={t("builders.tabs.stories")}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <p className="cb-lead">{t("builders.storiesLead")}</p>

      <article className="cb-story" key={story.id} aria-live="polite" aria-atomic="true">
        <h3 className="cb-story-title">{t(`builders.stories.${story.id}.title`)}</h3>
        <Copy className="cb-story-body" text={t(`builders.stories.${story.id}.body`)} />
        <div className="cb-story-flow">
          <StorySide role={t("builders.asks")} handles={story.askers} profiles={profiles} onSelect={onSelect} />
          <i className="fas fa-arrow-right-long cb-story-arrow" aria-hidden="true" />
          <StorySide role={t("builders.helps")} handles={story.helpers} profiles={profiles} onSelect={onSelect} />
        </div>
        {story.links.length > 0 && (
          <div className="cb-story-links">
            {story.links.map((href, position) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                {t(`builders.stories.${story.id}.link${position}`)} <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
      </article>

      <div className="cb-carousel-nav">
        <button type="button" className="cb-nav-btn" onClick={() => move(-1)} aria-label={t("builders.previous")}>
          <i className="fas fa-arrow-left" aria-hidden="true" />
        </button>
        <span className="cb-dots">
          {BUILDER_STORIES.map((item, position) => (
            <button
              key={item.id}
              type="button"
              className={`cb-dot${position === index ? " cb-dot--active" : ""}`}
              aria-label={t(`builders.stories.${item.id}.title`)}
              aria-current={position === index ? "true" : undefined}
              onClick={() => setIndex(position)}
            />
          ))}
        </span>
        <button type="button" className="cb-nav-btn" onClick={() => move(1)} aria-label={t("builders.next")}>
          <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * Las caras de quienes participamos, en orden aleatorio y en ventana que rota: con la lista
 * alfabética completa siempre se veía a la misma gente y la sección pesaba más que el texto.
 */
function MemberStrip({ handles, profiles, onSelect, isLoading }) {
  const { t } = useTranslation();
  const order = useMemo(() => shuffle(handles.map(({ label }) => label)), [handles]);
  const [step, setStep] = useState(0);
  // La fila se para mientras alguien la está mirando: con la rotación en marcha, la cara
  // que ibas a pulsar se cambiaba por otra justo debajo del cursor.
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || order.length <= FACE_WINDOW || prefersReducedMotion()) return;
    const timer = setInterval(() => setStep((current) => current + 1), FACE_ROTATION_MS);
    return () => clearInterval(timer);
  }, [order.length, paused]);

  const faces = visibleFaces(order, FACE_WINDOW, step);

  if (order.length === 0) {
    return <p className="cb-note" role="status">{t(isLoading ? "builders.loading" : "builders.unavailable")}</p>;
  }

  return (
    <div className="cb-strip">
      <div
        className="cb-strip-faces"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {faces.map((handle) => (
          <MemberFace key={handle} handle={handle} profiles={profiles} onSelect={onSelect} />
        ))}
      </div>
      <p className="cb-note">{t("builders.membersHelp")}</p>
    </div>
  );
}

function WhoTab({ handles, profiles, onSelect, isLoading }) {
  const { t } = useTranslation();
  return (
    <>
      <p className="cb-lead">{t("builders.whoLead")}</p>
      <Copy className="cb-copy" text={t("builders.whoCopy")} />
      <Copy className="cb-copy" text={t("builders.whoSpirit")} />
      <p className="cb-section-title">{t("builders.membersTitle")}</p>
      <MemberStrip handles={handles} profiles={profiles} onSelect={onSelect} isLoading={isLoading} />
    </>
  );
}

const WHAT_BLOCKS = [
  { id: "challenges", icon: "fa-circle-question" },
  { id: "meet", icon: "fa-comments" },
  { id: "projects", icon: "fa-screwdriver-wrench" },
];

function WhatTab() {
  const { t } = useTranslation();
  return (
    <>
      <p className="cb-lead">{t("builders.whatLead")}</p>
      <div className="cb-blocks">
        {WHAT_BLOCKS.map(({ id, icon }) => (
          <div key={id} className="cb-block">
            <p className="cb-block-title"><i className={`fas ${icon}`} aria-hidden="true" /> {t(`builders.what.${id}Title`)}</p>
            <Copy className="cb-block-copy" text={t(`builders.what.${id}`)} />
          </div>
        ))}
      </div>
      <p className="cb-note">
        <a href={BUILDERS_INITIATIVES_URL} target="_blank" rel="noopener noreferrer">
          {t("builders.what.initiativesLink")} <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
        </a>
      </p>
    </>
  );
}

const JOIN_STEPS = ["form", "call", "in"];

function JoinTab() {
  const { t } = useTranslation();
  return (
    <>
      <p className="cb-lead">{t("builders.joinLead")}</p>
      <ol className="cb-steps">
        {JOIN_STEPS.map((id, position) => (
          <li key={id} className="cb-step">
            <span className="cb-step-number">{position + 1}</span>
            <Copy className="cb-step-copy" text={t(`builders.join.${id}`)} />
          </li>
        ))}
      </ol>
      <p className="cb-section-title">{t("builders.expectTitle")}</p>
      <Copy className="cb-copy" text={t("builders.expect")} />
    </>
  );
}

export function CommunityBuildersModal({ onClose, onSelectMember, returnFocusRef }) {
  const { t } = useTranslation();
  const communities = useAllCommunities();
  const handles = useCBMemberHandles();
  const isLoading = useIsLoading();
  const profiles = useMemo(() => buildBuilderProfiles(communities), [communities]);
  const [tab, setTab] = useState("who");
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const returnTarget = returnFocusRef?.current ?? document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      if (returnTarget?.isConnected) returnTarget.focus();
    };
  }, [onClose, returnFocusRef]);

  const select = (handle) => { onSelectMember(handle); onClose(); };

  return createPortal(
    <div className="cb-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="cb-modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="cb-modal-close" ref={closeButton} onClick={onClose} aria-label={t("builders.close")}>
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>

        <header className="cb-modal-header">
          <h2 className="cb-modal-title" id={titleId}>
            <i className="fas fa-people-group" aria-hidden="true" /> {t("builders.title")}
          </h2>
          <p className="cb-modal-subtitle">{t("builders.subtitle")}</p>
        </header>

        <div className="cb-tabs" role="tablist">
          {TABS.map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`cb-tab${tab === id ? " cb-tab--active" : ""}`}
              onClick={() => setTab(id)}
            >
              <i className={`fas ${icon}`} aria-hidden="true" />
              <span>{t(`builders.tabs.${id}`)}</span>
            </button>
          ))}
        </div>

        <div className="cb-panel" role="tabpanel">
          {tab === "who" && <WhoTab handles={handles} profiles={profiles} onSelect={select} isLoading={isLoading} />}
          {tab === "what" && <WhatTab />}
          {tab === "stories" && <StoriesTab profiles={profiles} onSelect={select} />}
          {tab === "join" && <JoinTab />}
        </div>

        <footer className="cb-modal-footer">
          <a className="cb-footer-btn cb-footer-btn--cta" href={JOIN_BUILDERS_URL} target="_blank" rel="noopener noreferrer">
            <i className="fas fa-paper-plane" aria-hidden="true" /> {t("builders.joinCta")}
          </a>
          <p className="cb-footer-copy">
            {t("builders.contact")}{" "}
            <a href={BUILDERS_TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-telegram" aria-hidden="true" /> Telegram
            </a>
            {" · "}
            <a href={`mailto:${BUILDERS_EMAIL}`}>
              <i className="fas fa-envelope" aria-hidden="true" /> {BUILDERS_EMAIL}
            </a>
          </p>
        </footer>
      </div>
    </div>, document.body);
}
