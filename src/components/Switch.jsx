import { useState } from "react";
import "./Switch.css"; // Estilos personalizados

export function Switch() {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    setIsOn(!isOn);
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
