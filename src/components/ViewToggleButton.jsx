export function ViewToggleButton ({ view, toggleView }) {
    return (
        <button className="button is-light is-small" onClick={toggleView}>
            <span className="icon">
                <i className={`fa-solid ${view === "map" ? "fa-list" : "fa-map"}`}></i>
            </span>
            <span>{view === "map" ? "Lista" : "Mapa"}</span>
        </button>
    );
}
