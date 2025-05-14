import { TAG_EVENTS, TAG_TYPES } from "../constants";

/* eslint-disable react/prop-types */
export function CommunityCard({ community }) {
  const {
    name: comunidad,
    status: estado,
    lastReviewed: revision,
    communityType: tipo,
    eventFormat: tipoEvento,
    location: localizacion,
    contactInfo: contacto,
    communityUrl: url,
    thumbnailUrl: miniatura,
    latLon: latLon
  } = community;

  const tagActiveClassName =
    estado.toUpperCase() == "ACTIVA"
      ? "tag is-light is-primary"
      : "tag is-light is-danger";


  const contactActiveClassName =
      contacto ? 'fas fa-envelope exists' 
        : "fas fa-envelope not-exists";

  return (
    <div className="card mycard">
      <div className="headingtag">
        <span className={`tag ${TAG_TYPES[tipo]}`}>{tipo}</span>
        <span className={`tag ${TAG_EVENTS[tipoEvento]}`}>{tipoEvento}</span>
      </div>

      <div className="card-image">
        <figure className="image is-4by3">
          <img
            src={
              miniatura ||
              `https://bulma.io/assets/images/placeholders/1280x960.png`
            }
            alt={comunidad}
          />
        </figure>
      </div>
      <div className="card-content">
        <div className="media">
          <div className="media-content">
            <a href={url} target="_blank" alt={comunidad}>
              <p className="title is-4 alto45rem">{comunidad}</p>
            </a>
          </div>
        </div>
        <div className="level level-is-shrinkable">
          <div className="level-left">
            <div className="level-item">
              <p className="subtitle is-5 localizacion">{localizacion}</p>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <div className="subtitle is-6">
                <div className="popover-container">
                <button className="popover-trigger">
                  <i className={contactActiveClassName}></i>
                  
                </button>
                <div className="popover-content">
                  <div className="box">
                    {contacto ? contacto : "Sin Contacto"}
                  </div>
                </div>
              </div>
                
              </div>
            </div>
          </div>
        </div>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <span className={tagActiveClassName}>{estado}</span>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              
              <div className="popover-container">
                
                <p className="subtitle is-6 popover-trigger">{revision}</p>
                <div className="popover-content">
                  <div className="box">
                    Fecha de la última revisión: {revision}
                  </div>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
