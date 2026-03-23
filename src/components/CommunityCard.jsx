import { useState } from "react";
import { CommunityModal } from "./CommunityModal/CommunityModal";

/* eslint-disable react/prop-types */
export function CommunityCard({ community, tagsMap = {}, audienceMap = {}, hasCBMember = false, cbHandles = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    name: comunidad,
    thumbnailUrl: miniatura,
    shortDescription,
  } = community;
  const openModal = () => setIsModalOpen(true);

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
        title={`Ver detalles de ${comunidad}`}
      >
        <div className="card-image card-image--clickable">
          <figure className="image is-1by1 community-card-media">
            {hasCBMember && (
              <span
                className="cb-badge"
                title="Esta comunidad está representada en Community Builders"
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

      {isModalOpen && (
        <CommunityModal
          community={community}
          tagsMap={tagsMap}
          audienceMap={audienceMap}
          cbHandles={cbHandles}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
