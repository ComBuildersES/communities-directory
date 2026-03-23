import { useState } from "react";
import { CommunityModal } from "./CommunityModal/CommunityModal";

/* eslint-disable react/prop-types */
export function CommunityCard({ community, tagsMap = {}, audienceMap = {} }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { name: comunidad, thumbnailUrl: miniatura } = community;
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
            <img
              src={
                miniatura ||
                `https://bulma.io/assets/images/placeholders/1280x960.png`
              }
              alt={comunidad}
            />
            <figcaption className="community-card-overlay">
              <span className="community-card-name">{comunidad}</span>
            </figcaption>
          </figure>
        </div>
      </div>

      {isModalOpen && (
        <CommunityModal
          community={community}
          tagsMap={tagsMap}
          audienceMap={audienceMap}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
