import { Switch } from "./Switch";
import { useSideBarVisible } from "../stores/sidebar.store";

export function FilterPanel() {
  const isVisible = useSideBarVisible();

  return (
    <div className={`filter-panel ${isVisible ? "filter-panel--open" : ""}`}>
      <div className="filter-panel-inner">
        <div className="filter-group">
          <p className="filter-group-label">Tipo de Comunidad</p>
          <div className="filter-group-items">
            <div className="option-item is-size-7"><p>Tech Meetup</p><Switch name="communityType" value="Tech Meetup" /></div>
            <div className="option-item is-size-7"><p>Conferencia</p><Switch name="communityType" value="Conferencia" /></div>
            <div className="option-item is-size-7"><p>Grupo Colaborativo</p><Switch name="communityType" value="Grupo colaborativo" /></div>
            <div className="option-item is-size-7"><p>Grupo de Ayuda Mutua</p><Switch name="communityType" value="Grupo de ayuda mutua" /></div>
            <div className="option-item is-size-7"><p>Hacklab</p><Switch name="communityType" value="Hacklab" /></div>
            <div className="option-item is-size-7"><p>Organización paraguas</p><Switch name="communityType" value="Organización paraguas" /></div>
            <div className="option-item is-size-7"><p>Meta comunidad</p><Switch name="communityType" value="Meta comunidad" /></div>
          </div>
        </div>

        <div className="filter-group-divider" />

        <div className="filter-group">
          <p className="filter-group-label">Tipo de Eventos</p>
          <div className="filter-group-items">
            <div className="option-item is-size-7"><p>Híbridos</p><Switch name="eventFormat" value="Híbridos" /></div>
            <div className="option-item is-size-7"><p>Online</p><Switch name="eventFormat" value="Online" /></div>
            <div className="option-item is-size-7"><p>Presencial</p><Switch name="eventFormat" value="Presencial" /></div>
            <div className="option-item is-size-7"><p>Desconocido</p><Switch name="eventFormat" value="Desconocido" /></div>
          </div>
        </div>

        <div className="filter-group-divider" />

        <div className="filter-group">
          <p className="filter-group-label">Estado</p>
          <div className="filter-group-items">
            <div className="option-item is-size-7"><p>Activa</p><Switch name="status" value="Activa" /></div>
            <div className="option-item is-size-7"><p>Inactiva</p><Switch name="status" value="Inactiva" /></div>
            <div className="option-item is-size-7"><p>Desconocido</p><Switch name="status" value="Desconocido" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
