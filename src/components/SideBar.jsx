import { Switch } from "./Switch";
import { useSideBarVisible, useSidebarActions } from "../stores/sidebar.store.js";

export const Sidebar = () => {
  const isSidebarVisible = useSideBarVisible();
  const { toggleSidebar } = useSidebarActions();

  return (
    <aside
      className={`sidebar menu column is-full-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen is-one-fifth-fullhd box sticky ${
        isSidebarVisible ? "" : "sidebar--collapsed"
      }`}
    >
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarVisible ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <i className={`fas ${isSidebarVisible ? "fa-chevron-right" : "fa-filter"}`}></i>
        </button>
        <p className="menu-label">Tipo de Comunidad</p>
      </div>
      <div className="sidebar-content">
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Tech Meetup</p>
            <Switch name="communityType" value="Tech Meetup" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Conferencia</p>
            <Switch name="communityType" value="Conferencia" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Grupo Colaborativo</p>
            <Switch name="communityType" value="Grupo colaborativo" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Grupo de Ayuda Mutua</p>
            <Switch name="communityType" value="Grupo de ayuda mutua" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Hacklab</p>
            <Switch name="communityType" value="Hacklab" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Organización paraguas</p>
            <Switch name="communityType" value="Organización paraguas" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Meta comunidad</p>
            <Switch name="communityType" value="Meta comunidad" />
          </div>
        </li>
      </ul>

      <p className="menu-label">Tipo de Eventos</p>
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Híbridos</p>
            <Switch name="eventFormat" value="Híbridos" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Online</p>
            <Switch name="eventFormat" value="Online" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Presencial</p>
            <Switch name="eventFormat" value="Presencial" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Desconocidos</p>
            <Switch name="eventFormat" value="Desconocido" />
          </div>
        </li>
      </ul>

      <p className="menu-label">Estado de la comunidad</p>
      {/*Aqui podia definir un list box de seleccion multiple con 
        las distintas provincias como opciones */}
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Activa</p>
            <Switch name="status" value="Activa" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Inactiva</p>
            <Switch name="status" value="Inactiva" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Desconocido</p>
            <Switch name="status" value="Desconocido" />
          </div>
        </li>
      </ul>

      {/* <p className="menu-label">Localizacion habitual</p> */}
      {/*Aqui podia definir un list box de seleccion multiple con
        las distintas provincias como opciones o poner todas y que
        vayan filtrando */}
      {/* <ul className="menu-list">
        <li className="menu-item"></li>
        <li className="menu-item"></li>
      </ul> */}
      </div>
    </aside>
  );
};

export default Sidebar;
