/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";

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
            <img
              src={
                miniatura ||
                `https://bulma.io/assets/images/placeholders/1280x960.png`
              }
              alt={comunidad}
            />
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
