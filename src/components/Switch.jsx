/* eslint-disable react/prop-types */
import { useState } from "react";

import "./Switch.css"; // Estilos personalizados
import { useCommunityActions } from "../stores/community.store";

export function Switch({ name = "nombre", value = "valor" }) {
  const [isOn, setIsOn] = useState(false);
  const { filterComunities } = useCommunityActions();

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    console.log("valor", value);
    console.log("isOn", newState);
    filterComunities(name, newState ? value : []);
  };

  return (
    <div
      className={`custom-switch ${isOn ? "on" : "off"}`}
      onClick={toggleSwitch}
      name={name}
      value={isOn ? value : []}
    >
      <span className="switch-slider"></span>
    </div>
  );
}
