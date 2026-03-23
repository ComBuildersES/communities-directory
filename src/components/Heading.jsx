/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { ViewToggleButton } from "./ViewToggleButton.jsx";
import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store";

export function Heading ({
  view,
  toggleView,
  isContributionView = false,
  closeContributionForm,
  goToHome,
}) {
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const supportRef = useRef(null);
  const bookmarkShortcut = useMemo(() => (
    /mac/i.test(window.navigator.userAgent) ? "Cmd + D" : "Ctrl + D"
  ), []);

  useEffect(() => {
    if (!isSupportOpen) return;

    const handlePointerDown = (event) => {
      if (!supportRef.current?.contains(event.target)) {
        setIsSupportOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSupportOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSupportOpen]);

  return (
    <header id="title">
      <div className="heading-brand">
        <button type="button" className="heading-brand-button" onClick={goToHome}>
          <div className="heading-icon">
            <i className="fas fa-people-group"></i>
          </div>
          <div>
            <h1 className="heading-title">Comunidades Tech</h1>
            <p className="heading-subtitle">Directorio de comunidades tecnológicas de España</p>
          </div>
        </button>
      </div>

      <div className="heading-actions">
        {isContributionView ? (
          <button className="button is-light" onClick={closeContributionForm}>
            <span className="icon"><i className="fas fa-arrow-left"></i></span>
            <span>Volver</span>
          </button>
        ) : (
          <>
            <div className="heading-support" ref={supportRef}>
              <button
                type="button"
                className={`button ${isSupportOpen ? "is-primary" : "is-light"} heading-support-button`}
                onClick={() => setIsSupportOpen((current) => !current)}
                title="Guardar o apoyar el proyecto"
                aria-expanded={isSupportOpen}
                aria-haspopup="dialog"
              >
                <span className="icon"><i className="fas fa-star"></i></span>
                <span className="heading-btn-label">Apoyar</span>
              </button>
              {isSupportOpen && (
                <div className="heading-support-popover" role="dialog" aria-label="Opciones para apoyar el proyecto">
                  <p className="heading-support-title">Guarda y apoya el proyecto</p>
                  <p className="heading-support-copy">
                    Si te resulta útil, puedes mostrar tu apoyo dándole una ⭐ en{" "}
                    <a
                      href="https://github.com/ComBuildersES/communities-directory"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>{" "}
                    al proyecto.
                  </p>
                  <p className="heading-support-copy">
                    También buscamos{" "}
                    <a
                      href="https://github.com/ComBuildersES/communities-directory/issues/53"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      responsables provinciales
                    </a>{" "}
                    que quieran ayudar sobre todo con el mantenimiento de los datos de las comunidades y la revisión de PRs de nuevas comunidades.
                  </p>
                  <p className="heading-support-copy">
                    Nuevas ideas, bugs y cualquier otra forma de colaboración también son bienvenidas; tienes la guía en{" "}
                    <a
                      href="https://github.com/ComBuildersES/communities-directory/blob/master/CONTRIBUTING.md"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CONTRIBUTING
                    </a>.
                  </p>
                  <p className="heading-support-copy">
                    Si quieres volver rápido, guarda esta página en favoritos con <strong>{bookmarkShortcut}</strong>.
                  </p>
                </div>
              )}
            </div>
            <button
              className={`button ${isVisible ? "is-primary" : "is-light"}`}
              onClick={toggleSidebar}
              title={isVisible ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <span className="icon"><i className="fas fa-sliders"></i></span>
              <span className="heading-btn-label">Filtros</span>
            </button>
            <ViewToggleButton view={view} toggleView={toggleView} />
          </>
        )}
      </div>
    </header>
  );
}
