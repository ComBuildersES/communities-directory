/* eslint-disable react/prop-types */
import { useState } from "react";

import "./switch.css"; // Estilos personalizados
import { useCommunityActions } from "../stores/community.store";
import { bajaString } from "../constants";

export function Switch({ name = "nombre", value = "valor" }) {
  const [isOn, setIsOn] = useState(false);
  const { filterComunities } = useCommunityActions();

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    filterComunities(name, newState ? value : bajaString + value);
  };

  return (
    <div
      className={`custom-switch ${isOn ? "on" : "off"}`}
      onClick={toggleSwitch}
      name={name}
      value={isOn ? value : `BAJA${value}`}
    >
      <span className="switch-slider"></span>
    </div>
  );
}
