export function ViewToggleButton ({ view, toggleView }) {
    return (
        <button className="button is-light" onClick={toggleView}>
            <span className="icon">
                <i className={`fa-solid ${view === "map" ? "fa-list" : "fa-map"}`}></i>
            </span>
            <span className="heading-btn-label">{view === "map" ? "Ver lista" : "Ver mapa"}</span>
        </button>
    );
}
