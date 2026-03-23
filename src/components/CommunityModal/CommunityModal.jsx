/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useCommunityActions } from "../../stores/community.store";
import "./CommunityModal.css";

const URL_CONFIG = [
  { key: "web",       label: "Web",       icon: "fas fa-globe" },
  { key: "meetup",    label: "Meetup",    icon: "fas fa-calendar-days" },
  { key: "github",    label: "GitHub",    icon: "fab fa-github" },
  { key: "discord",   label: "Discord",   icon: "fab fa-discord" },
  { key: "telegram",  label: "Telegram",  icon: "fab fa-telegram" },
  { key: "youtube",   label: "YouTube",   icon: "fab fa-youtube" },
  { key: "linkedin",  label: "LinkedIn",  icon: "fab fa-linkedin" },
  { key: "twitter",   label: "Twitter/X", icon: "fab fa-x-twitter" },
  { key: "instagram", label: "Instagram", icon: "fab fa-instagram" },
  { key: "mastodon",  label: "Mastodon",  icon: "fab fa-mastodon" },
  { key: "bluesky",   label: "Bluesky",   icon: "fas fa-cloud" },
];

const STATUS_CLASS = {
  Activa:      "modal-badge modal-badge--active",
  Inactiva:    "modal-badge modal-badge--inactive",
  Desconocido: "modal-badge modal-badge--unknown",
};

export function CommunityModal({ community, tagsMap, audienceMap, onClose }) {
  const { filterComunities } = useCommunityActions();

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
              <span className={STATUS_CLASS[status] || STATUS_CLASS.Desconocido}>
                {status}
              </span>
              {communityType && (
                <span className="modal-badge modal-badge--type">{communityType}</span>
              )}
              {eventFormat && (
                <span className="modal-badge modal-badge--format">{eventFormat}</span>
              )}
            </div>
          </div>
          <button className="community-modal-close" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="community-modal-body">

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

          {/* Validación humana */}
          <div className={`community-modal-validation ${humanValidated ? "validated" : "not-validated"}`}>
            <i className={`fas ${humanValidated ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
            {humanValidated
              ? "Datos validados por una persona"
              : "Datos enriquecidos automáticamente, pendientes de validación humana"}
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
                    className="community-modal-chip community-modal-chip--tag"
                    onClick={() => { filterComunities("tags", tagId); onClose(); }}
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
                  <span key={audId} className="community-modal-chip community-modal-chip--audience">
                    {audienceMap[audId] || audId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
