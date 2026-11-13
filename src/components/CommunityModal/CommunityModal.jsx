/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCommunityActions, useAllCommunities, useChildrenByParentId, useMergedFromById, useOrganizedById } from "../../stores/community.store.js";
import { buildContributionPath } from "../../lib/communitySubmission";
import { normalizeCommunityLangs } from "../../lib/communityLanguages.js";
import { findMergeTarget, isMergedCommunity } from "../../lib/mergedCommunities.js";
import { findOrganizers } from "../../lib/organizedCommunities.js";
import {
  FALLBACK_GROUP,
  groupUrlEntries,
  resolveUrlGroupDisplay,
  toLegacyUrlMap,
  withEmptyUrlGroups,
} from "../../lib/communityUrls.js";
import { normalizeOpenTo } from "../../lib/communityOpenTo.js";
import { OteEvents } from "./OteEvents.jsx";
import "./CommunityModal.css";

const APP_URL = "https://directory.communitybuilders.dev/";

function extractDominantColor(img) {
  try {
    const SIZE = 64;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    const buckets = {};
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 40) continue; // transparente
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      if (lum > 232 || lum < 18) continue; // near-white o near-black
      const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const [r, g, b] = top[0].split(",").map(Number);
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    const ratio = 0.12 + (lum / 255) * 0.28; // colores claros → más pigmento (hasta 40%)
    const mix = (c) => Math.round(c * ratio + 255 * (1 - ratio));
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  } catch {
    return null;
  }
}
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
  // Solo quiere dos handles concretos, así que pide el mapa por clave en vez de recorrer pares.
  const urls = toLegacyUrlMap(community.urls);
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

const STATUS_CLASS = {
  active:   "modal-badge modal-badge--active",
  inactive: "modal-badge modal-badge--inactive",
  unknown:  "modal-badge modal-badge--unknown",
  merged:   "modal-badge modal-badge--merged",
};

function isArchivedUrl(url) {
  return typeof url === "string" && url.includes("web.archive.org/web/");
}

const INVALID_LOCATION_VALUES = new Set(["n/a", "n.a.", "n.a", "sin completar", "sin localidad"]);

function normalizeLocation(location) {
  const v = location?.trim();
  return v && !INVALID_LOCATION_VALUES.has(v.toLowerCase()) ? v : null;
}

export function CommunityModal({ community, tagsMap, audienceMap, cbHandles = [], childCount = 0, onClose, onGoToMap, onOpenCommunity }) {
  const { t } = useTranslation();
  const { filterComunities } = useCommunityActions();
  const allCommunities = useAllCommunities();
  const childrenByParentId = useChildrenByParentId();
  const mergedFromById = useMergedFromById();
  const organizedById = useOrganizedById();
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [audienceExpanded, setAudienceExpanded] = useState(false);
  const [openUrlGroup, setOpenUrlGroup] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [thumbBg, setThumbBg] = useState(null);
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

  const {
    name,
    status,
    communityType,
    eventFormat,
    geographicScope,
    location: rawLocation = "",
    shortDescription,
    langs,
    lastReviewed,
    contactInfo,
    communityUrl,
    urls: rawUrls,
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

  // Fusiones (src/lib/mergedCommunities.js): esta comunidad continúa en otra, o es el destino
  // en el que continúan otras. Las dos caras enlazan a la ficha correspondiente: quien llega
  // desde un enlace viejo tiene que poder seguir hasta la comunidad viva.
  const mergeTarget = findMergeTarget(community, allCommunities);
  const mergedFrom = mergedFromById.get(community.id) ?? [];

  // Autoría (src/lib/organizedCommunities.js): las comunidades del directorio que organizan
  // esta, y los encuentros que organiza ella. Las dos caras se pintan siempre, con el estado
  // del otro lado: una asociación dormida puede seguir sacando su conferencia, y al revés.
  const organizers = findOrganizers(community, allCommunities);
  const organizes = organizedById.get(community.id) ?? [];

  const hasMapCoords = latLon?.lat != null && latLon?.lon != null;
  const languages = normalizeCommunityLangs(langs);

  const location = normalizeLocation(rawLocation);
  // URLs a mostrar: las entradas de `urls`, y communityUrl como fallback si no hay ninguna web.
  // `urlsByKind` existe solo para las preguntas de clave única ("¿tiene feed OTE?"); lo que
  // se pinta son las entradas, porque puede haber dos del mismo kind con etiquetas distintas.
  const urlGroups = groupUrlEntries(rawUrls, t);
  const urlsByKind = toLegacyUrlMap(rawUrls);
  const urlEntries = urlGroups.flatMap((group) => group.entries);
  const hasCommunityUrlInUrls = urlEntries.some((entry) => entry.url === communityUrl);
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
            <div
              className="community-modal-thumbnail-wrap"
              style={thumbBg ? { background: thumbBg, borderColor: thumbBg } : undefined}
            >
              <img
                src={thumbnailUrl}
                alt={name}
                className="community-modal-thumbnail"
                onLoad={(e) => {
                  const color = extractDominantColor(e.currentTarget);
                  if (color) setThumbBg(color);
                }}
              />
            </div>
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
              {geographicScope && geographicScope !== "unknown" && (
                <button
                  type="button"
                  className="modal-badge modal-badge--scope"
                  onClick={() => applyFilter("geographicScope", geographicScope)}
                  title={t("communityModal.filterByScope", { scope: t(`geographicScope.${geographicScope}`) })}
                >
                  <i className="fas fa-compass"></i> {t(`geographicScope.${geographicScope}`)}
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

          {/*
            El aviso va aquí, lo primero del cuerpo y no colgando del título "Colaborar":
            es un dato sobre la ficha entera, y donde estaba antes se leía como si fuese una
            advertencia sobre colaborar. No se marca en la tarjeta ni en el mapa a propósito:
            lo llevarían 570 de 657 y la cuadrícula pasaría a ser un campo de alertas.
          */}
          {/*
            Fusión: esta comunidad ya no existe por separado. El aviso va lo primero del
            cuerpo, por delante del de revisión pendiente: si la comunidad continúa en otra,
            es el único dato que importa antes de seguir leyendo la ficha.
          */}
          {isMergedCommunity(community) && (
            <div className="community-modal-merged">
              <i className="fa-solid fa-code-merge" aria-hidden="true"></i>
              <div>
                <strong>{t("communityModal.mergedTitle")}</strong>
                {mergeTarget ? (
                  <>
                    <p>{t("communityModal.mergedBody", { name: mergeTarget.name })}</p>
                    {onOpenCommunity && (
                      <button
                        type="button"
                        className="community-modal-merged-cta"
                        onClick={() => onOpenCommunity(mergeTarget.id)}
                      >
                        {t("communityModal.mergedCta", { name: mergeTarget.name })}
                        {" "}<i className="fas fa-arrow-right" aria-hidden="true"></i>
                      </button>
                    )}
                  </>
                ) : (
                  <p>{t("communityModal.mergedBodyUnknown")}</p>
                )}
              </div>
            </div>
          )}
          {!humanValidated && (
            <div className="community-modal-pending-review">
              <i className="fa-solid fa-robot" aria-hidden="true"></i>
              <div>
                <strong>{t("communityModal.pendingReviewTitle")}</strong>
                <p>{t("communityModal.pendingReviewBody")}</p>
                <a href={buildContributionPath({ mode: "edit", identifier: community.id })}>
                  {t("communityModal.pendingReviewCta")} <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          )}
          {normalizeOpenTo(community.openTo).length > 0 && <section className="community-modal-section">
            <h3 className="community-modal-section-title">{t("openTo.title")}</h3>
            <div className="community-modal-badges">
              {normalizeOpenTo(community.openTo).map((option) => <button key={option} type="button"
                className="modal-badge" onClick={() => applyFilter("openTo", option)}
                title={t(`openTo.descriptions.${option}`)}>{t(`openTo.labels.${option}`)}</button>)}
            </div>
          </section>}
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
              <span className="community-modal-children-count">
                {t("communityCard.childrenCount", { count: childCount })}
              </span>
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

          {/* Comunidades que se fusionaron en esta (cara inversa, derivada en el store) */}
          {mergedFrom.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fa-solid fa-code-merge"></i> {t("communityModal.mergedFromTitle")}
              </h3>
              <p className="community-modal-merged-from-intro">{t("communityModal.mergedFromBody")}</p>
              <div className="community-modal-merged-from">
                {mergedFrom.map((merged) => (
                  <button
                    key={merged.id ?? merged.name}
                    type="button"
                    className="community-modal-merged-from-item"
                    onClick={() => onOpenCommunity?.(merged.id)}
                    disabled={!onOpenCommunity || merged.id == null}
                  >
                    {merged.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quién organiza esta comunidad (issue #475) */}
          {organizers.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fa-solid fa-people-group"></i> {t("communityModal.organizedByTitle")}
              </h3>
              <div className="community-modal-relations">
                {organizers.map((organizer) => (
                  <button
                    key={organizer.id ?? organizer.name}
                    type="button"
                    className={`community-modal-relation${organizer.status !== "active" ? " community-modal-relation--dimmed" : ""}`}
                    onClick={() => onOpenCommunity?.(organizer.id)}
                    disabled={!onOpenCommunity || organizer.id == null}
                  >
                    <span>{organizer.name}</span>
                    {organizer.status !== "active" && (
                      <span className="community-modal-relation__status">
                        {t(`status.${organizer.status}`)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {/*
                Un encuentro tiene muchos más organizadores reales (empresas, patrocinadores,
                apoyo institucional) que el directorio no lista. Sin esta nota, una lista con
                una sola comunidad se lee como "lo organiza solo esta gente".
              */}
              <p className="community-modal-relations-note">{t("communityModal.organizedByNote")}</p>
            </div>
          )}

          {/* Encuentros que organiza esta comunidad (cara inversa, derivada en el store) */}
          {organizes.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fa-solid fa-calendar-days"></i> {t("communityModal.organizesTitle")}
              </h3>
              <div className="community-modal-relations">
                {organizes.map((organized) => (
                  <button
                    key={organized.id ?? organized.name}
                    type="button"
                    className={`community-modal-relation${organized.status !== "active" ? " community-modal-relation--dimmed" : ""}`}
                    onClick={() => onOpenCommunity?.(organized.id)}
                    disabled={!onOpenCommunity || organized.id == null}
                  >
                    <span>{organized.name}</span>
                    {organized.status !== "active" && (
                      <span className="community-modal-relation__status">
                        {t(`status.${organized.status}`)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Próximos eventos leídos del feed OTE de la comunidad */}
          {urlsByKind.ote && <OteEvents feedUrl={urlsByKind.ote} fallbackUrl={urlsByKind.eventosWiki ?? null} />}

          {/* URLs agrupadas */}
          {(urlEntries.length > 0 || showFallbackUrl) && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-link"></i> {t("communityModal.links")}
              </h3>
              <div className="community-modal-url-groups">
                {withEmptyUrlGroups(urlGroups).map(({ group: groupKey, labelKey, icon, entries: groupEntries }) => {
                  const includeFallback = groupKey === FALLBACK_GROUP && showFallbackUrl;
                  if (groupEntries.length === 0 && !includeFallback) return null;
                  const { items, isDirect, label, icon: groupItemIcon } = resolveUrlGroupDisplay({
                    entries: groupEntries,
                    fallbackItem: includeFallback
                      ? {
                        url: communityUrl,
                        label: t("communityModal.mainLink"),
                        icon: "fas fa-arrow-up-right-from-square",
                      }
                      : null,
                    groupLabel: t(labelKey),
                    groupIcon: icon,
                  });

                  // Un solo canal: enlace directo, sin desplegable que abrir.
                  if (isDirect) {
                    return (
                      <a
                        key={groupKey}
                        href={items[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="community-modal-url-group-btn community-modal-url-group-btn--direct"
                      >
                        <i className={groupItemIcon}></i>
                        <span>{label}</span>
                        <i className="fas fa-arrow-up-right-from-square community-modal-url-group-external"></i>
                      </a>
                    );
                  }

                  const isOpen = openUrlGroup === groupKey;
                  return (
                    <div key={groupKey} className="community-modal-url-group">
                      <button
                        type="button"
                        className={`community-modal-url-group-btn${isOpen ? " is-open" : ""}`}
                        onClick={() => setOpenUrlGroup(isOpen ? null : groupKey)}
                      >
                        <i className={groupItemIcon}></i>
                        <span>{label}</span>
                        <span className="community-modal-url-group-count">{items.length}</span>
                        <i className="fas fa-chevron-down community-modal-url-group-chevron"></i>
                      </button>
                      {isOpen && (
                        <div className="community-modal-url-dropdown">
                          {items.map(({ url, label: urlLabel, icon: urlIcon }) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="community-modal-url-dropdown-item">
                              <i className={urlIcon}></i>
                              <span>{urlLabel}</span>
                            </a>
                          ))}
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

          {/*
            Un encuentro que no tiene canales propios (issue #475): no se copian los de la
            comunidad organizadora. Una URL repetida en dos fichas se valida dos veces y al
            archivar un canal hay que acordarse de los dos sitios. Lo que se ofrece es la vía
            para añadir el canal que falte y el enlace a los canales de quien lo organiza.
          */}
          {urlEntries.length === 0 && !showFallbackUrl && organizers.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-link"></i> {t("communityModal.links")}
              </h3>
              <p className="community-modal-no-channels">
                {t("communityModal.noOwnChannels")}
              </p>
              <div className="community-modal-no-channels-actions">
                <a href={buildContributionPath({ mode: "edit", identifier: community.id })}>
                  {t("communityModal.noOwnChannelsCta")} <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
                {organizers.map((organizer) => (
                  <button
                    key={organizer.id ?? organizer.name}
                    type="button"
                    className={`community-modal-relation${organizer.status !== "active" ? " community-modal-relation--dimmed" : ""}`}
                    onClick={() => onOpenCommunity?.(organizer.id)}
                    disabled={!onOpenCommunity || organizer.id == null}
                  >
                    {t("communityModal.noOwnChannelsOrganizer", { name: organizer.name })}
                  </button>
                ))}
              </div>
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
