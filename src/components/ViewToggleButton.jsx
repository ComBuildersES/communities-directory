import { useState } from "react";

export function ViewToggleButton ({ view, toggleView }) {
    return (
        <button className="button is-primary ml-2" onClick={toggleView}>
            <i className={`fa-solid ${view === "map" ? "fa-list" : "fa-map"}`}></i>
            &nbsp;
            {view === "map" ? "Ver lista" : "Ver mapa"}
        </button>
    );
}
