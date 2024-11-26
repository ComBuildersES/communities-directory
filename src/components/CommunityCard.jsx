import { TAG_EVENTS, TAG_TYPES } from "../constants";

/* eslint-disable react/prop-types */
export function CommunityCard({ community }) {
  const {
    Comunidad: comunidad,
    Estado: estado,
    Última_revisión: revision,
    Tipo_de_comunidad: tipo,
    Tipo_de_eventos: tipoEvento,
    "Localización habitual": localizacion,
    Info_de_contacto: contacto,
    URL_Comunidad: url,
    Miniatura: miniatura,
  } = community;

  const tagActiveClassName =
    estado.toUpperCase() == "ACTIVA"
      ? "tag is-light is-primary"
      : "tag is-light is-danger";

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
            <p className="title is-3 alto45rem">{comunidad}</p>
          </div>
        </div>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <p className="subtitle is-5 localizacion">{localizacion}</p>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <p className="subtitle is-6">
                {contacto ? contacto : "Sin Contacto"}
              </p>
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
              <p className="subtitle is-6">{revision}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
