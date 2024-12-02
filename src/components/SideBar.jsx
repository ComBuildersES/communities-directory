import { Switch } from "./Switch";
import { useSideBarVisible } from "../stores/sidebar.store";

export const Sidebar = () => {
  // Estado para controlar la visibilidad del sidebar
  const isSidebarVisible = useSideBarVisible();

  return (
    <aside
      className={`sidebar menu column is-3 box ${
        isSidebarVisible ? "is-active" : "is-hidden"
      }`}
    >
      <p className="menu-label">Tipo de Comunidad</p>
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Tech Meetup</p>
            <Switch name="Tipo_de_comunidad" value="Tech Meetup" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Conferencia</p>
            <Switch name="Tipo_de_comunidad" value="Conferencia" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Grupo Colaborativo</p>
            <Switch name="Tipo_de_comunidad" value="Grupo colaborativo" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Grupo de Ayuda Mutua</p>
            <Switch name="Tipo_de_comunidad" value="Grupo de ayuda mutua" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Hacklab</p>
            <Switch name="Tipo_de_comunidad" value="Hacklab" />
          </div>
        </li>
      </ul>

      <p className="menu-label">Tipo de Eventos</p>
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Híbridos</p>
            <Switch name="Tipo_de_eventos" value="Híbridos" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Online</p>
            <Switch name="Tipo_de_eventos" value="Online" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Presencial</p>
            <Switch name="Tipo_de_eventos" value="Presencial" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Desconocidos</p>
            <Switch name="Tipo_de_eventos" value="Desconocido" />
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
            <Switch name="Estado" value="Activa" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Inactiva</p>
            <Switch name="Estado" value="Inactiva" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Desconocido</p>
            <Switch name="Estado" value="Desconocido" />
          </div>
        </li>
      </ul>

      <p className="menu-label">Localizacion habitual</p>
      {/*Aqui podia definir un list box de seleccion multiple con 
        las distintas provincias como opciones o poner todas y que 
        vayan filtrando */}
      <ul className="menu-list">
        <li className="menu-item"></li>
        <li className="menu-item"></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
