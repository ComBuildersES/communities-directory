/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useCommunityActions } from "../../stores/community.store";
import { buildContributionPath } from "../../lib/communitySubmission";
import "./CommunityModal.css";

const APP_URL = "https://combuilderses.github.io/communities-directory/";
const CB_HANDLES = {
  twitter: "@ComBuilders_ES",
  bluesky: "@communitybuilders.bsky.social",
};

function extractSocialHandle(platform, url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const segments = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    if (!segments.length) return null;
    if (platform === "mastodon") {
      return `@${segments[segments.length - 1].replace(/^@/, "")}@${u.hostname}`;
    }
    return `@${segments[segments.length - 1].replace(/^@/, "")}`;
  } catch {
    return null;
  }
}

function buildShareLinks(community) {
  const urls = community.urls || {};
  const directLink = `${APP_URL}?community=${community.id}`;
  const enc = encodeURIComponent;

  function msg(subject, ccHandle) {
    const cc = ccHandle ? ` // cc: ${ccHandle}` : "";
    return `Esta ficha de ${subject} resume lo que encontrarás allí de un vistazo: ${directLink}${cc}`;
  }

  const twitterHandle = extractSocialHandle("generic", urls.twitter);
  const bskyHandle    = extractSocialHandle("generic", urls.bluesky);

  return [
    {
      key: "twitter",
      label: "X / Twitter",
      icon: "fa-brands fa-x-twitter",
      href: `https://twitter.com/intent/tweet?text=${enc(msg(twitterHandle || community.name, CB_HANDLES.twitter))}`,
    },
    {
      key: "bluesky",
      label: "Bluesky",
      icon: "fa-brands fa-bluesky",
      href: `https://bsky.app/intent/compose?text=${enc(msg(bskyHandle || community.name, CB_HANDLES.bluesky))}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(directLink)}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: "fa-brands fa-whatsapp",
      href: `https://api.whatsapp.com/send?text=${enc(msg(community.name, null))}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: "fa-brands fa-telegram",
      href: `https://t.me/share/url?url=${enc(directLink)}&text=${enc(msg(community.name, null))}`,
    },
  ];
}

const URL_CONFIG = [
  { key: "web",            label: "Web",                icon: "fas fa-globe" },
  { key: "eventsUrl",      label: "Eventos",            icon: "fas fa-calendar-days" },
  { key: "linkAggregator", label: "Agregador de links", icon: "fas fa-link" },
  { key: "mailingList",    label: "Lista de correo",    icon: "fas fa-envelope" },
  { key: "github",         label: "GitHub",             icon: "fab fa-github" },
  { key: "discord",        label: "Discord",            icon: "fab fa-discord" },
  { key: "telegram",       label: "Telegram",           icon: "fab fa-telegram" },
  { key: "whatsapp",       label: "WhatsApp",           icon: "fab fa-whatsapp" },
  { key: "slack",          label: "Slack",              icon: "fab fa-slack" },
  { key: "youtube",        label: "YouTube",            icon: "fab fa-youtube" },
  { key: "linkedin",       label: "LinkedIn",           icon: "fab fa-linkedin" },
  { key: "twitter",        label: "Twitter/X",          icon: "fab fa-x-twitter" },
  { key: "tiktok",         label: "TikTok",             icon: "fab fa-tiktok" },
  { key: "instagram",      label: "Instagram",          icon: "fab fa-instagram" },
  { key: "facebook",       label: "Facebook",           icon: "fab fa-facebook" },
  { key: "mastodon",       label: "Mastodon",           icon: "fab fa-mastodon" },
  { key: "bluesky",        label: "Bluesky",            icon: "fas fa-cloud" },
  { key: "twitch",         label: "Twitch",             icon: "fab fa-twitch" },
];

const URL_CONFIG_BY_KEY = Object.fromEntries(URL_CONFIG.map(c => [c.key, c]));

const URL_GROUPS = [
  { key: "comunidad",  label: "Comunidad",       icon: "fas fa-globe",        keys: ["web", "eventsUrl", "linkAggregator", "mailingList", "github"], defaultOpen: false },
  { key: "chat",       label: "Chat",             icon: "fas fa-comments",     keys: ["discord", "telegram", "whatsapp", "slack"],                    defaultOpen: false },
  { key: "social",     label: "Redes y vídeo",   icon: "fas fa-share-nodes",  keys: ["youtube", "linkedin", "twitter", "tiktok", "instagram", "facebook", "mastodon", "bluesky", "twitch"], defaultOpen: false },
];

const STATUS_CLASS = {
  Activa:      "modal-badge modal-badge--active",
  Inactiva:    "modal-badge modal-badge--inactive",
  Desconocido: "modal-badge modal-badge--unknown",
};

function isArchivedUrl(url) {
  return typeof url === "string" && url.includes("web.archive.org/web/");
}

const INVALID_LOCATION_VALUES = new Set(["n/a", "n.a.", "n.a", "sin completar", "sin localidad"]);

function normalizeLocation(location) {
  const v = location?.trim();
  return v && !INVALID_LOCATION_VALUES.has(v.toLowerCase()) ? v : null;
}

export function CommunityModal({ community, tagsMap, audienceMap, cbHandles = [], onClose }) {
  const { filterComunities } = useCommunityActions();
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [audienceExpanded, setAudienceExpanded] = useState(false);
  const [openUrlGroup, setOpenUrlGroup] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareRef = useRef(null);

  const CHIPS_THRESHOLD = 3;

  const applyFilter = (key, value) => {
    filterComunities(key, value);
    onClose();
  };

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Cerrar dropdown de enlaces al clicar fuera
  useEffect(() => {
    if (!openUrlGroup) return;
    const handler = (e) => {
      if (!e.target.closest(".community-modal-url-groups")) setOpenUrlGroup(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openUrlGroup]);

  // Cerrar dropdown de compartir al clicar fuera
  useEffect(() => {
    if (!isShareOpen) return;
    const handler = (e) => {
      if (!shareRef.current?.contains(e.target)) setIsShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isShareOpen]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const {
    name,
    status,
    communityType,
    eventFormat,
    location: rawLocation = "",
    shortDescription,
    lastReviewed,
    contactInfo,
    communityUrl,
    urls = {},
    tags = [],
    targetAudience = [],
    thumbnailUrl,
    humanValidated,
  } = community;

  const location = normalizeLocation(rawLocation);

  // URLs a mostrar: las del objeto urls, y communityUrl como fallback si no hay ninguna web
  const urlEntries = URL_CONFIG.filter(({ key }) => urls[key]);
  const hasCommunityUrlInUrls = Object.values(urls).includes(communityUrl);
  const showFallbackUrl = communityUrl && !hasCommunityUrlInUrls;
  const communityUrlIsArchived = isArchivedUrl(communityUrl);

  return (
    <div className="community-modal-overlay" onClick={onClose}>
      <div
        className="community-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={name}
      >
        {/* Cabecera */}
        <div className="community-modal-header">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={name}
              className="community-modal-thumbnail"
            />
          )}
          <div className="community-modal-header-info">
            <h2 className="community-modal-name">{name}</h2>
            <div className="community-modal-badges">
              <button
                type="button"
                className={STATUS_CLASS[status] || STATUS_CLASS.Desconocido}
                onClick={() => applyFilter("status", status)}
                title={`Filtrar por estado ${status}`}
              >
                {status}
              </button>
              {communityType && communityType.toLowerCase() !== "n/a" && (
                <button
                  type="button"
                  className="modal-badge modal-badge--type"
                  onClick={() => applyFilter("communityType", communityType)}
                  title={`Filtrar por tipo de comunidad ${communityType}`}
                >
                  {communityType}
                </button>
              )}
              {eventFormat && (
                <button
                  type="button"
                  className="modal-badge modal-badge--format"
                  onClick={() => applyFilter("eventFormat", eventFormat)}
                  title={`Filtrar por tipo de evento ${eventFormat}`}
                >
                  {eventFormat}
                </button>
              )}
            </div>
            <div className="community-modal-header-meta">
              {location && (
                <span><i className="fas fa-location-dot"></i> {location}</span>
              )}
              {lastReviewed && (
                <span><i className="fas fa-clock-rotate-left"></i> Revisada: {lastReviewed}</span>
              )}
              {contactInfo && (
                <span>
                  <i className="fas fa-envelope"></i>{" "}
                  <a href={`mailto:${contactInfo}`}>{contactInfo}</a>
                </span>
              )}
            </div>
          </div>
          <button className="community-modal-close" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="community-modal-body">
          <div className="community-modal-section">
            <h3 className="community-modal-section-title">
              <i className="fas fa-align-left"></i> Descripcion breve
            </h3>
            <p className={`community-modal-summary ${shortDescription ? "" : "community-modal-summary--missing"}`}>
              {shortDescription || "Sin descripcion breve todavia"}
            </p>
          </div>


          {/* URLs agrupadas */}
          {(urlEntries.length > 0 || showFallbackUrl) && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-link"></i> Enlaces
              </h3>
              <div className="community-modal-url-groups">
                {URL_GROUPS.map(({ key: groupKey, label, icon, keys }) => {
                  const groupEntries = keys
                    .filter(k => urls[k])
                    .map(k => URL_CONFIG_BY_KEY[k]);
                  const includeFallback = groupKey === "comunidad" && showFallbackUrl;
                  if (groupEntries.length === 0 && !includeFallback) return null;
                  const count = groupEntries.length + (includeFallback ? 1 : 0);
                  const isOpen = openUrlGroup === groupKey;
                  return (
                    <div key={groupKey} className="community-modal-url-group">
                      <button
                        type="button"
                        className={`community-modal-url-group-btn${isOpen ? " is-open" : ""}`}
                        onClick={() => setOpenUrlGroup(isOpen ? null : groupKey)}
                      >
                        <i className={icon}></i>
                        <span>{label}</span>
                        <span className="community-modal-url-group-count">{count}</span>
                        <i className="fas fa-chevron-down community-modal-url-group-chevron"></i>
                      </button>
                      {isOpen && (
                        <div className="community-modal-url-dropdown">
                          {groupEntries.map(({ key, label: urlLabel, icon: urlIcon }) => (
                            <a key={key} href={urls[key]} target="_blank" rel="noopener noreferrer" className="community-modal-url-dropdown-item">
                              <i className={urlIcon}></i>
                              <span>{urlLabel}</span>
                            </a>
                          ))}
                          {includeFallback && (
                            <a href={communityUrl} target="_blank" rel="noopener noreferrer" className="community-modal-url-dropdown-item">
                              <i className="fas fa-arrow-up-right-from-square"></i>
                              <span>Enlace principal</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {communityUrlIsArchived && (
                <p className="community-modal-url-note">
                  El enlace principal apunta a una copia archivada en web.archive.org porque la fuente original ya no parece estar disponible.
                </p>
              )}
            </div>
          )}

          {/* Temáticas + Público objetivo en dos columnas */}
          {(tags.length > 0 || targetAudience.length > 0) && (
            <div className="community-modal-two-col">
              {tags.length > 0 && (
                <div className="community-modal-section">
                  <h3 className="community-modal-section-title">
                    <i className="fas fa-tags"></i> Temáticas
                  </h3>
                  <div className="community-modal-chips">
                    {(tagsExpanded ? tags : tags.slice(0, CHIPS_THRESHOLD)).map((tagId) => (
                      <button
                        key={tagId}
                        type="button"
                        className="community-modal-chip community-modal-chip--tag"
                        onClick={() => applyFilter("tags", tagId)}
                        title={`Filtrar por ${tagsMap[tagId] || tagId}`}
                      >
                        {tagsMap[tagId] || tagId}
                      </button>
                    ))}
                    {!tagsExpanded && tags.length > CHIPS_THRESHOLD && (
                      <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setTagsExpanded(true)}>
                        +{tags.length - CHIPS_THRESHOLD} más
                      </button>
                    )}
                    {tagsExpanded && tags.length > CHIPS_THRESHOLD && (
                      <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setTagsExpanded(false)}>
                        Mostrar menos
                      </button>
                    )}
                  </div>
                </div>
              )}
              {targetAudience.length > 0 && (
                <div className="community-modal-section">
                  <h3 className="community-modal-section-title">
                    <i className="fas fa-users"></i> Público objetivo
                  </h3>
                  <div className="community-modal-chips">
                    {(audienceExpanded ? targetAudience : targetAudience.slice(0, CHIPS_THRESHOLD)).map((audId) => (
                      <button
                        key={audId}
                        type="button"
                        className="community-modal-chip community-modal-chip--audience"
                        onClick={() => applyFilter("targetAudience", audId)}
                        title={`Filtrar por ${audienceMap[audId] || audId}`}
                      >
                        {audienceMap[audId] || audId}
                      </button>
                    ))}
                    {!audienceExpanded && targetAudience.length > CHIPS_THRESHOLD && (
                      <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setAudienceExpanded(true)}>
                        +{targetAudience.length - CHIPS_THRESHOLD} más
                      </button>
                    )}
                    {audienceExpanded && targetAudience.length > CHIPS_THRESHOLD && (
                      <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setAudienceExpanded(false)}>
                        Mostrar menos
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Colaborar + Community Builders */}
          <div className="community-modal-two-col">
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-pen-to-square"></i> Colaborar
                {!humanValidated && (
                  <span className="community-modal-cb-tooltip-anchor">
                    <i className="fa-solid fa-robot community-modal-cb-info-icon"></i>
                    <span className="community-modal-cb-tooltip">
                      Datos enriquecidos automáticamente, pendientes de validación humana. Bajo CC BY 4.0, tu aportación beneficiará también a quien reutilice este directorio.
                    </span>
                  </span>
                )}
              </h3>
              <div className="community-modal-urls">
                <a
                  href={buildContributionPath({ mode: "edit", identifier: community.id })}
                  className="community-modal-url-item"
                >
                  <i className="fas fa-code-compare"></i>
                  <span>Proponer cambios</span>
                </a>
                <div className="community-modal-url-group" ref={shareRef}>
                  <button
                    type="button"
                    className={`community-modal-url-item community-modal-share-btn${isShareOpen ? " is-open" : ""}`}
                    onClick={() => setIsShareOpen((v) => !v)}
                  >
                    <i className="fas fa-share-nodes"></i>
                    <span>Compartir</span>
                    <i className="fas fa-chevron-down community-modal-url-group-chevron"></i>
                  </button>
                  {isShareOpen && (
                    <div className="community-modal-url-dropdown community-modal-share-dropdown">
                      {buildShareLinks(community).map(({ key, label, icon, href }) => (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="community-modal-url-dropdown-item"
                        >
                          <i className={icon}></i>
                          <span>{label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fa-solid fa-people-group"></i> Community Builders
                {cbHandles.length > 0 && (
                  <span className="community-modal-cb-tooltip-anchor">
                    <i className="fa-solid fa-circle-info community-modal-cb-info-icon"></i>
                    <span className="community-modal-cb-tooltip">
                      Alguna de las personas que lidera o lideró esta comunidad forma parte de Community Builders, la meta-comunidad de organizadores de comunidades tech en España.
                    </span>
                  </span>
                )}
              </h3>
              {cbHandles.length > 0 ? (
                <div className="community-modal-cb-members">
                  {cbHandles.map((handle) => (
                    <a key={handle} href={`https://github.com/${handle}`} target="_blank" rel="noopener noreferrer" className="community-modal-cb-member" title={`@${handle} en GitHub`}>
                      <img src={`https://github.com/${handle}.png?size=40`} alt={handle} className="community-modal-cb-avatar" />
                      <span>@{handle}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="community-modal-cb-inline-cta">
                  ¿Dinamizas esta comunidad?{" "}
                  <a href="https://combuilderses.github.io/" target="_blank" rel="noopener noreferrer">
                    Únete a Community Builders
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
