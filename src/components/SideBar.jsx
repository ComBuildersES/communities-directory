import { useState } from "react";
import { Switch } from "./Switch";

export const Sidebar = () => {
  // Estado para controlar la visibilidad del sidebar
  const [isActive, setIsActive] = useState(false);

  // Función para alternar el estado
  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  return (
    <aside
      className={`menu column is-3 box ${
        isActive ? "is-active" : "is-hidden-mobile"
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
            <Switch />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Grupo Colaborativo</p>
            <Switch />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Grupo de Ayuda Mutua</p>
            <Switch />
          </div>
        </li>
      </ul>

      <p className="menu-label">Tipo de Eventos</p>
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Híbridos</p>
            <Switch />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Online</p>
            <Switch />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>Presencial</p>
            <Switch />
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
      <p className="menu-label">Estado de la comunidad</p>
      {/*Aqui podia definir un list box de seleccion multiple con 
        las distintas provincias como opciones */}
      <ul className="menu-list">
        <li className="menu-item"></li>
        <li className="menu-item"></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
