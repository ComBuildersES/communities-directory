/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Iniciales con las que se rellena el hueco cuando una comunidad no tiene logo. Una o dos,
 * saltándose los artículos y conectores, que no identifican nada.
 */
const PALABRAS_VACIAS = new Set(["de", "del", "la", "las", "el", "los", "y", "the", "of", "for", "-"]);

export function communityInitials(name = "") {
  const palabras = String(name)
    .split(/[\s/_-]+/)
    .map((palabra) => palabra.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((palabra) => palabra && !PALABRAS_VACIAS.has(palabra.toLowerCase()));

  if (palabras.length === 0) return "?";
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

export function CommunityCard({
  community,
  hasCBMember = false,
  isHighlighted = false,
  isMuted = false,
  onOpen,
}) {
  const { t } = useTranslation();
  const {
    name: comunidad,
    thumbnailUrl: miniatura,
    shortDescription,
  } = community;
  const openModal = () => onOpen?.(community.id);
  // Una imagen que no carga (fichero renombrado o borrado) salía como icono roto: el `src`
  // solo caía al sustituto cuando `thumbnailUrl` venía vacío, no cuando daba 404.
  const [imagenFallida, setImagenFallida] = useState(false);
  const sinLogo = !miniatura || imagenFallida;

  const cardClassName = [
    "card",
    "mycard",
    "mycard--simple",
    isHighlighted ? "mycard--highlighted" : "",
    isMuted ? "mycard--muted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={cardClassName}
        onClick={openModal}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openModal();
          }
        }}
        role="button"
        tabIndex={0}
        title={t("communityCard.viewDetails", { name: comunidad })}
      >
        <div className="card-image card-image--clickable">
          <figure className="image is-1by1 community-card-media">
            {hasCBMember && (
              <span
                className="cb-badge"
                title={t("communityCard.cbBadgeTitle")}
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-solid fa-people-group" aria-hidden="true"></i>
              </span>
            )}
            {sinLogo ? (
              // Sustituto local, no una imagen de relleno traída de bulma.io: hacer que la
              // cuadrícula dependa de un tercero para pintarse —y de paso contarle quién la
              // mira— es mucho a cambio de un rectángulo gris. Las iniciales al menos
              // distinguen una comunidad de otra.
              <div className="community-card-placeholder" aria-label={comunidad} role="img">
                <span>{communityInitials(comunidad)}</span>
              </div>
            ) : (
              <img src={miniatura} alt={comunidad} onError={() => setImagenFallida(true)} />
            )}
            <figcaption className="community-card-overlay">
              <div className="community-card-overlay-content">
                <span className="community-card-name">{comunidad}</span>
                {shortDescription && (
                  <span className="community-card-description">
                    {shortDescription}
                  </span>
                )}
              </div>
            </figcaption>
          </figure>
        </div>
      </div>

    </>
  );
}
