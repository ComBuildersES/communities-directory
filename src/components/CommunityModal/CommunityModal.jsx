/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCommunityActions, useAllCommunities, useChildrenByParentId } from "../../stores/community.store.js";
import { buildContributionPath } from "../../lib/communitySubmission";
import { normalizeCommunityLangs } from "../../lib/communityLanguages.js";
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

function buildShareLinks(community, t) {
  const urls = community.urls || {};
  const directLink = `${APP_URL}?community=${community.id}`;
  const enc = encodeURIComponent;

  function msg(subject, ccHandle) {
    const cc = ccHandle ? ` // cc: ${ccHandle}` : "";
    return t("communityModal.shareMsg", { subject, link: directLink, cc });
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

const URL_CONFIG_KEYS = [
  { key: "web",            labelKey: "communityModal.url.web",            icon: "fas fa-globe" },
  { key: "eventsUrl",      labelKey: "communityModal.url.events",         icon: "fas fa-calendar-days" },
  { key: "linkAggregator", labelKey: "communityModal.url.linkAggregator", icon: "fas fa-link" },
  { key: "mailingList",    labelKey: "communityModal.url.mailingList",     icon: "fas fa-envelope" },
  { key: "github",         labelKey: "communityModal.url.github",          icon: "fab fa-github" },
  { key: "discord",        labelKey: "communityModal.url.discord",         icon: "fab fa-discord" },
  { key: "telegram",       labelKey: "communityModal.url.telegram",        icon: "fab fa-telegram" },
  { key: "whatsapp",       labelKey: "communityModal.url.whatsapp",        icon: "fab fa-whatsapp" },
  { key: "slack",          labelKey: "communityModal.url.slack",           icon: "fab fa-slack" },
  { key: "youtube",        labelKey: "communityModal.url.youtube",         icon: "fab fa-youtube" },
  { key: "linkedin",       labelKey: "communityModal.url.linkedin",        icon: "fab fa-linkedin" },
  { key: "twitter",        labelKey: "communityModal.url.twitter",         icon: "fab fa-x-twitter" },
  { key: "tiktok",         labelKey: "communityModal.url.tiktok",          icon: "fab fa-tiktok" },
  { key: "instagram",      labelKey: "communityModal.url.instagram",       icon: "fab fa-instagram" },
  { key: "facebook",       labelKey: "communityModal.url.facebook",        icon: "fab fa-facebook" },
  { key: "mastodon",       labelKey: "communityModal.url.mastodon",        icon: "fab fa-mastodon" },
  { key: "bluesky",        labelKey: "communityModal.url.bluesky",         icon: "fas fa-cloud" },
  { key: "twitch",         labelKey: "communityModal.url.twitch",          icon: "fab fa-twitch" },
];

const URL_GROUP_DEFS = [
  { key: "comunidad", labelKey: "communityModal.urlGroup.community", icon: "fas fa-globe",       keys: ["web", "eventsUrl", "linkAggregator", "mailingList", "github"] },
  { key: "chat",      labelKey: "communityModal.urlGroup.chat",      icon: "fas fa-comments",    keys: ["discord", "telegram", "whatsapp", "slack"] },
  { key: "social",    labelKey: "communityModal.urlGroup.social",    icon: "fas fa-share-nodes", keys: ["youtube", "linkedin", "twitter", "tiktok", "instagram", "facebook", "mastodon", "bluesky", "twitch"] },
];

const STATUS_CLASS = {
  active:   "modal-badge modal-badge--active",
  inactive: "modal-badge modal-badge--inactive",
  unknown:  "modal-badge modal-badge--unknown",
};

function isArchivedUrl(url) {
  return typeof url === "string" && url.includes("web.archive.org/web/");
}

const INVALID_LOCATION_VALUES = new Set(["n/a", "n.a.", "n.a", "sin completar", "sin localidad"]);

function normalizeLocation(location) {
  const v = location?.trim();
  return v && !INVALID_LOCATION_VALUES.has(v.toLowerCase()) ? v : null;
}

export function CommunityModal({ community, tagsMap, audienceMap, cbHandles = [], childCount = 0, onClose, onGoToMap }) {
  const { t } = useTranslation();
  const { filterComunities } = useCommunityActions();
  const allCommunities = useAllCommunities();
  const childrenByParentId = useChildrenByParentId();
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [audienceExpanded, setAudienceExpanded] = useState(false);
  const [openUrlGroup, setOpenUrlGroup] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareRef = useRef(null);

  const CHIPS_THRESHOLD = 3;

  const URL_CONFIG = URL_CONFIG_KEYS.map(({ key, labelKey, icon }) => ({ key, label: t(labelKey), icon }));
  const URL_CONFIG_BY_KEY = Object.fromEntries(URL_CONFIG.map(c => [c.key, c]));
  const URL_GROUPS = URL_GROUP_DEFS.map(({ key, labelKey, icon, keys }) => ({ key, label: t(labelKey), icon, keys }));

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
    langs,
    lastReviewed,
    contactInfo,
    communityUrl,
    urls = {},
    tags = [],
    targetAudience = [],
    matchesAllTags = false,
    matchesAllAudience = false,
    thumbnailUrl,
    humanValidated,
    latLon,
    parentId,
  } = community;

  const parentCommunity = parentId != null ? allCommunities.find((c) => c.id === parentId) : null;
  const siblingCount = parentId != null ? childrenByParentId.get(parentId) ?? 0 : 0;

  const hasMapCoords = latLon?.lat != null && latLon?.lon != null;
  const languages = normalizeCommunityLangs(langs);

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
                className={STATUS_CLASS[status] || STATUS_CLASS.unknown}
                onClick={() => applyFilter("status", status)}
                title={t("communityModal.filterByStatus", { status: t(`status.${status}`) })}
              >
                {t(`status.${status}`)}
              </button>
              {communityType && communityType.toLowerCase() !== "n/a" && (
                <button
                  type="button"
                  className="modal-badge modal-badge--type"
                  onClick={() => applyFilter("communityType", communityType)}
                  title={t("communityModal.filterByType", { communityType: t(`communityType.${communityType}`) })}
                >
                  {t(`communityType.${communityType}`)}
                </button>
              )}
              {eventFormat && (
                <button
                  type="button"
                  className="modal-badge modal-badge--format"
                  onClick={() => applyFilter("eventFormat", eventFormat)}
                  title={t("communityModal.filterByFormat", { eventFormat: t(`eventFormat.${eventFormat}`) })}
                >
                  {t(`eventFormat.${eventFormat}`)}
                </button>
              )}
              {languages.map((code) => (
                <button
                  key={code}
                  type="button"
                  className="modal-badge modal-badge--language"
                  onClick={() => applyFilter("langs", code)}
                  title={t("communityModal.filterByLanguage", { language: t(`language.${code}`) })}
                >
                  {t(`language.${code}`)}
                </button>
              ))}
              {location && hasMapCoords && onGoToMap ? (
                <button
                  type="button"
                  className="modal-badge modal-badge--location"
                  onClick={() => onGoToMap(latLon)}
                  title={t("communityModal.viewOnMap")}
                >
                  <i className="fas fa-location-dot"></i> {location}
                </button>
              ) : location ? (
                <span className="modal-badge modal-badge--location modal-badge--location-static">
                  <i className="fas fa-location-dot"></i> {location}
                </span>
              ) : null}
            </div>
            <div className="community-modal-header-meta">
              {lastReviewed && (
                <span><i className="fas fa-clock-rotate-left"></i> {t("communityModal.reviewed", { date: lastReviewed })}</span>
              )}
              {contactInfo && (
                <span>
                  <i className="fas fa-envelope"></i>{" "}
                  <a href={`mailto:${contactInfo}`}>{contactInfo}</a>
                </span>
              )}
            </div>
          </div>
          <button className="community-modal-close" onClick={onClose} aria-label={t("communityModal.close")}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="community-modal-body">
          {parentCommunity && (
            <button
              type="button"
              className="community-modal-parent-network"
              onClick={() => applyFilter("parentId", String(parentCommunity.id))}
            >
              <i className="fa-solid fa-sitemap" aria-hidden="true"></i>
              <span>{t("communityModal.partOfNetwork", { name: parentCommunity.name })}</span>
              {siblingCount > 1 && (
                <span className="community-modal-parent-network__count">
                  {t("communityModal.networkCount", { count: siblingCount })}
                </span>
              )}
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          )}

          <div className="community-modal-section">
            <h3 className="community-modal-section-title">
              <i className="fas fa-align-left"></i> {t("communityModal.shortDescription")}
            </h3>
            <p className={`community-modal-summary ${shortDescription ? "" : "community-modal-summary--missing"}`}>
              {shortDescription || t("communityModal.noDescription")}
            </p>
          </div>


          {/* Comunidades hijas */}
          {communityType === "umbrella-org" && childCount > 0 && (
            <div className="community-modal-children">
              <i className="fa-solid fa-sitemap" aria-hidden="true"></i>
              <span>{t("communityCard.childrenCount", { count: childCount })}</span>
              <button
                type="button"
                className="community-modal-children-btn"
                onClick={() => { applyFilter("parentId", String(community.id)); }}
              >
                {t("communityCard.viewChildren")}
                {" "}<i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          )}

          {/* URLs agrupadas */}
          {(urlEntries.length > 0 || showFallbackUrl) && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-link"></i> {t("communityModal.links")}
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
                              <span>{t("communityModal.mainLink")}</span>
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
                  {t("communityModal.archivedUrlNote")}
                </p>
              )}
            </div>
          )}

          {/* Temáticas + Público objetivo en dos columnas */}
          {(tags.length > 0 || matchesAllTags || targetAudience.length > 0 || matchesAllAudience) && (
            <div className="community-modal-two-col">
              {(tags.length > 0 || matchesAllTags) && (
                <div className="community-modal-section">
                  <h3 className="community-modal-section-title">
                    <i className="fas fa-tags"></i> {t("communityModal.topics")}
                  </h3>
                  {matchesAllTags && tags.length === 0 ? (
                    <p className="community-modal-generalist-note">
                      <i className="fas fa-infinity"></i> {t("communityModal.allTopics")}
                    </p>
                  ) : (
                    <div className="community-modal-chips">
                      {(tagsExpanded ? tags : tags.slice(0, CHIPS_THRESHOLD)).map((tagId) => (
                        <button
                          key={tagId}
                          type="button"
                          className="community-modal-chip community-modal-chip--tag"
                          onClick={() => applyFilter("tags", tagId)}
                          title={t("communityModal.filterByTag", { tag: tagsMap[tagId] || tagId })}
                        >
                          {tagsMap[tagId] || tagId}
                        </button>
                      ))}
                      {!tagsExpanded && tags.length > CHIPS_THRESHOLD && (
                        <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setTagsExpanded(true)}>
                          {t("communityModal.showMore", { count: tags.length - CHIPS_THRESHOLD })}
                        </button>
                      )}
                      {tagsExpanded && tags.length > CHIPS_THRESHOLD && (
                        <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setTagsExpanded(false)}>
                          {t("communityModal.showLess")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {(targetAudience.length > 0 || matchesAllAudience) && (
                <div className="community-modal-section">
                  <h3 className="community-modal-section-title">
                    <i className="fas fa-users"></i> {t("communityModal.audience")}
                  </h3>
                  {matchesAllAudience && targetAudience.length === 0 ? (
                    <p className="community-modal-generalist-note">
                      <i className="fas fa-infinity"></i> {t("communityModal.allAudience")}
                    </p>
                  ) : (
                    <div className="community-modal-chips">
                      {(audienceExpanded ? targetAudience : targetAudience.slice(0, CHIPS_THRESHOLD)).map((audId) => (
                        <button
                          key={audId}
                          type="button"
                          className="community-modal-chip community-modal-chip--audience"
                          onClick={() => applyFilter("targetAudience", audId)}
                          title={t("communityModal.filterByAudience", { audience: audienceMap[audId] || audId })}
                        >
                          {audienceMap[audId] || audId}
                        </button>
                      ))}
                      {!audienceExpanded && targetAudience.length > CHIPS_THRESHOLD && (
                        <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setAudienceExpanded(true)}>
                          {t("communityModal.showMore", { count: targetAudience.length - CHIPS_THRESHOLD })}
                        </button>
                      )}
                      {audienceExpanded && targetAudience.length > CHIPS_THRESHOLD && (
                        <button type="button" className="community-modal-chip community-modal-chip--more" onClick={() => setAudienceExpanded(false)}>
                          {t("communityModal.showLess")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Colaborar + Community Builders */}
          <div className="community-modal-two-col">
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-pen-to-square"></i> {t("communityModal.collaborate")}
                {!humanValidated && (
                  <span className="community-modal-cb-tooltip-anchor">
                    <i className="fa-solid fa-robot community-modal-cb-info-icon"></i>
                    <span className="community-modal-cb-tooltip">
                      {t("communityModal.aiDataTooltip")}
                    </span>
                  </span>
                )}
              </h3>
              <div className="community-modal-urls">
                <a
                  href={buildContributionPath({ mode: "edit", identifier: community.id })}
                  className="community-modal-url-item community-modal-share-btn"
                >
                    <i className="fas fa-pen-to-square"></i>
                    <span>{t("communityModal.edit")}</span>
                </a>
                <div className="community-modal-url-group" ref={shareRef}>
                  <button
                    type="button"
                    className={`community-modal-url-item community-modal-share-btn${isShareOpen ? " is-open" : ""}`}
                    onClick={() => setIsShareOpen((v) => !v)}
                  >
                    <i className="fas fa-share-nodes"></i>
                    <span>{t("communityModal.share")}</span>
                    <i className="fas fa-chevron-down community-modal-url-group-chevron"></i>
                  </button>
                  {isShareOpen && (
                    <div className="community-modal-url-dropdown community-modal-share-dropdown">
                      {buildShareLinks(community, t).map(({ key, label, icon, href }) => (
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
                      {t("communityModal.cbTooltip")}
                    </span>
                  </span>
                )}
              </h3>
              {cbHandles.length > 0 ? (
                <div className="community-modal-cb-members">
                  {cbHandles.map((handle) => (
                    <a key={handle} href={`https://github.com/${handle}`} target="_blank" rel="noopener noreferrer" className="community-modal-cb-member" title={t("communityModal.githubHandle", { handle })}>
                      <img src={`https://github.com/${handle}.png?size=40`} alt={handle} className="community-modal-cb-avatar" />
                      <span>@{handle}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="community-modal-cb-inline-cta">
                  {t("communityModal.cbCta")}{" "}
                  <a href="https://combuilderses.github.io/" target="_blank" rel="noopener noreferrer">
                    {t("communityModal.cbCtaLink")}
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
