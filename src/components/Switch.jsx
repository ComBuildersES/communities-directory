/* eslint-disable react/prop-types */
import "./switch.css"; // Estilos personalizados
import { useCommunityActions, useFilters } from "../stores/community.store.js";
import { bajaString } from "../constants";

export function Switch({ name = "nombre", value = "valor" }) {
  const filters = useFilters();
  const { filterComunities } = useCommunityActions();

  const isOn = filters[name]?.includes(value) ?? false;

  const toggleSwitch = () => {
    filterComunities(name, isOn ? bajaString + value : value);
  };

  return (
    <div
      className={`custom-switch ${isOn ? "on" : "off"}`}
      onClick={toggleSwitch}
    >
      <span className="switch-slider"></span>
    </div>
  );
}
