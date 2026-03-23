/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useCommunityActions } from "../../stores/community.store";
import { buildContributionPath } from "../../lib/communitySubmission";
import "./CommunityModal.css";

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

const STATUS_CLASS = {
  Activa:      "modal-badge modal-badge--active",
  Inactiva:    "modal-badge modal-badge--inactive",
  Desconocido: "modal-badge modal-badge--unknown",
};

function isArchivedUrl(url) {
  return typeof url === "string" && url.includes("web.archive.org/web/");
}

export function CommunityModal({ community, tagsMap, audienceMap, cbHandles = [], onClose }) {
  const { filterComunities } = useCommunityActions();

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
    location,
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
              {communityType && (
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

          {/* Localización y última revisión */}
          <div className="community-modal-meta">
            {location && (
              <span>
                <i className="fas fa-location-dot"></i> {location}
              </span>
            )}
            {lastReviewed && (
              <span>
                <i className="fas fa-clock-rotate-left"></i> Revisada: {lastReviewed}
              </span>
            )}
            {contactInfo && (
              <span>
                <i className="fas fa-envelope"></i>{" "}
                <a href={`mailto:${contactInfo}`}>{contactInfo}</a>
              </span>
            )}
          </div>

          {/* URLs */}
          {(urlEntries.length > 0 || showFallbackUrl) && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-link"></i> Enlaces
              </h3>
              <div className="community-modal-urls">
                {urlEntries.map(({ key, label, icon }) => (
                  <a
                    key={key}
                    href={urls[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="community-modal-url-item"
                  >
                    <i className={icon}></i>
                    <span>{label}</span>
                  </a>
                ))}
                {showFallbackUrl && (
                  <a
                    href={communityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="community-modal-url-item"
                  >
                    <i className="fas fa-arrow-up-right-from-square"></i>
                    <span>Enlace principal</span>
                  </a>
                )}
              </div>
              {communityUrlIsArchived && (
                <p className="community-modal-url-note">
                  El enlace principal apunta a una copia archivada en web.archive.org porque la fuente original ya no parece estar disponible.
                </p>
              )}
            </div>
          )}

          {humanValidated && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-pen-to-square"></i> Colaborar
              </h3>
              <div className="community-modal-urls">
                <a
                  href={buildContributionPath({ mode: "edit", identifier: community.id })}
                  className="community-modal-url-item"
                >
                  <i className="fas fa-code-compare"></i>
                  <span>Proponer cambios</span>
                </a>
              </div>
            </div>
          )}

          {/* Temáticas */}
          {tags.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-tags"></i> Temáticas
              </h3>
              <div className="community-modal-chips">
                {tags.map((tagId) => (
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
              </div>
            </div>
          )}

          {/* Público objetivo */}
          {targetAudience.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fas fa-users"></i> Público objetivo
              </h3>
              <div className="community-modal-chips">
                {targetAudience.map((audId) => (
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
              </div>
            </div>
          )}

          {/* Community Builders */}
          {cbHandles.length === 0 && (
            <div className="community-modal-cb-cta">
              <i className="fa-solid fa-people-group"></i>
              <span>
                ¿Dinamizas o dinamizabas esta comunidad?{" "}
                <a href="https://combuilderses.github.io/" target="_blank" rel="noopener noreferrer">
                  Únete a Community Builders
                </a>
                , la meta-comunidad de organizadores de comunidades tech en España.
              </span>
            </div>
          )}
          {cbHandles.length > 0 && (
            <div className="community-modal-section">
              <h3 className="community-modal-section-title">
                <i className="fa-solid fa-people-group"></i> Community Builders
                <span className="community-modal-cb-tooltip-anchor">
                  <i className="fa-solid fa-circle-info community-modal-cb-info-icon"></i>
                  <span className="community-modal-cb-tooltip">
                    Alguna de las personas que lidera o lideró esta comunidad forma parte de Community Builders, la meta-comunidad de organizadores de comunidades tech en España.
                  </span>
                </span>
              </h3>
              <div className="community-modal-cb-members">
                {cbHandles.map((handle) => (
                  <a
                    key={handle}
                    href={`https://github.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="community-modal-cb-member"
                    title={`@${handle} en GitHub`}
                  >
                    <img
                      src={`https://github.com/${handle}.png?size=40`}
                      alt={handle}
                      className="community-modal-cb-avatar"
                    />
                    <span>@{handle}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Validación humana */}
          <div className={`community-modal-validation ${humanValidated ? "validated" : "not-validated"}`}>
            <i className={`fas ${humanValidated ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
            <div className="community-modal-validation-content">
              <span className="community-modal-validation-text">
                {humanValidated
                  ? "Datos validados por una persona"
                  : "Datos enriquecidos automáticamente, pendientes de validación humana"}
              </span>
              {!humanValidated && (
                <>
                  <a
                    href={buildContributionPath({ mode: "edit", identifier: community.id })}
                    className="button is-small community-modal-validation-cta"
                  >
                    Completar, validar o mejorar
                  </a>
                  <span className="community-modal-validation-note">
                    Bajo CC BY 4.0, tu validación beneficiará también a quien reutilice este directorio. Aquí puedes encontrar los datos usados en este directorio en{" "}
                    <a
                      href="https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.json"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      `communities.json`
                    </a>.
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
