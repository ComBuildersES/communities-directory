/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useCommunityActions } from "../stores/community.store.js";

export function CommunityCard({ community, hasCBMember = false, onOpen, childCount = 0 }) {
  const { t } = useTranslation();
  const { filterComunities } = useCommunityActions();
  const {
    name: comunidad,
    thumbnailUrl: miniatura,
    shortDescription,
    communityType,
    id,
  } = community;
  const openModal = () => onOpen?.(community.id);
  const isUmbrellaOrg = communityType === "umbrella-org";

  const handleViewChildren = (e) => {
    e.stopPropagation();
    filterComunities("parentId", String(id));
  };

  return (
    <>
      <div
        className="card mycard mycard--simple"
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
        {isUmbrellaOrg && childCount > 0 && (
          <div className="community-card-children" onClick={(e) => e.stopPropagation()}>
            <span className="community-card-children__count">
              <i className="fa-solid fa-sitemap" aria-hidden="true"></i>
              {" "}{t("communityCard.childrenCount", { count: childCount })}
            </span>
            <button
              className="community-card-children__btn"
              onClick={handleViewChildren}
            >
              {t("communityCard.viewChildren")}
              {" "}<i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        )}
      </div>

    </>
  );
}
