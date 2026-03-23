import { ViewToggleButton } from "./ViewToggleButton.jsx";
import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store";

export function Heading ({ view, toggleView }) {
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();

  return (
    <header id="title">
      <div className="heading-brand">
        <div className="heading-icon">
          <i className="fas fa-people-group"></i>
        </div>
        <div>
          <h1 className="heading-title">Comunidades Tech</h1>
          <p className="heading-subtitle">Directorio de comunidades tecnológicas de España</p>
        </div>
      </div>

      <div className="heading-actions">
        <button
          className={`button ${isVisible ? "is-primary" : "is-light"}`}
          onClick={toggleSidebar}
          title={isVisible ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <span className="icon"><i className="fas fa-sliders"></i></span>
          <span>Filtros</span>
        </button>
        <ViewToggleButton view={view} toggleView={toggleView} />
      </div>
    </header>
  );
}

