/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { ViewToggleButton } from "./ViewToggleButton.jsx";
import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store.js";
import allContributorsRaw from "../../.all-contributorsrc?raw";
const allContributorsRc = JSON.parse(allContributorsRaw);

const CONTRIBUTORS_URL = "https://github.com/ComBuildersES/communities-directory?tab=readme-ov-file#contributors";
const MAX_CONTRIBUTORS_IN_POPOVER = 24;
const contributors = allContributorsRc.contributors.slice(0, MAX_CONTRIBUTORS_IN_POPOVER);

const APP_URL = "https://combuilderses.github.io/communities-directory/";

function shareText(handle) {
  return `Este directorio de ${handle} no puede faltar en vuestra barra de favoritos, es el mayor listado de meetups, conferencias y comunidades técnicas de España: ${APP_URL} (y encima es open source & opendata! :D)`;
}

const SHARE_LINKS = [
  {
    label: "X / Twitter",
    icon: "fa-brands fa-x-twitter",
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText("@ComBuilders_ES"))}`,
  },
  {
    label: "Bluesky",
    icon: "fa-brands fa-bluesky",
    href: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText("@communitybuilders.bsky.social"))}`,
  },
  {
    label: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`,
  },
  {
    label: "WhatsApp",
    icon: "fa-brands fa-whatsapp",
    href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText("Community Builders"))}`,
  },
  {
    label: "Telegram",
    icon: "fa-brands fa-telegram",
    href: `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(shareText("Community Builders"))}`,
  },
];

export function Heading ({
  view,
  toggleView,
  isContributionView = false,
  closeContributionForm,
  goToHome,
  goToContribution,
}) {
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supportRef = useRef(null);
  const mobileMenuRef = useRef(null);
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

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event) => {
      if (!mobileMenuRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSupportOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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

      <div className="heading-actions" ref={mobileMenuRef}>
        {isContributionView ? (
          <button className="button is-light" onClick={closeContributionForm}>
            <span className="icon"><i className="fas fa-arrow-left"></i></span>
            <span>Volver</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              className="button is-light heading-hamburger"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="icon">
                <i className={`fas ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
              </span>
            </button>

            <div className={`heading-actions-inner${isMobileMenuOpen ? " heading-actions-inner--open" : ""}`}>
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
                  <>
                  <div className="heading-support-backdrop" onClick={() => setIsSupportOpen(false)} aria-hidden="true" />
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
                      que quieran ayudar sobre todo con el mantenimiento de los datos de las comunidades.
                    </p>
                    <p className="heading-support-copy">
                      Nuevas ideas, bugs y cualquier otra forma de colaboración también son bienvenidas; puedes abrir un{" "}
                      <a
                        href="https://github.com/ComBuildersES/communities-directory/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        issue
                      </a>{" "}
                      o consultar la guía en{" "}
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
                    <div className="heading-support-share">
                      <p className="heading-support-share-label">Comparte el directorio</p>
                      <div className="heading-support-share-buttons">
                        {SHARE_LINKS.map(({ label, icon, href }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="heading-support-share-btn"
                            title={`Compartir en ${label}`}
                            aria-label={`Compartir en ${label}`}
                          >
                            <i className={icon}></i>
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="heading-support-contributors">
                      <p className="heading-support-share-label">Gracias a todas las personas que nos apoyáis</p>
                      <div className="heading-support-contributors-grid">
                        {contributors.map((c) => (
                          <a
                            key={c.login}
                            href={c.profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="heading-support-contributor"
                            title={c.name || c.login}
                            aria-label={c.name || c.login}
                          >
                            <img src={c.avatar_url} alt={c.name || c.login} />
                          </a>
                        ))}
                      </div>
                      <a
                        href={CONTRIBUTORS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="heading-support-contributors-more"
                      >
                        Ver todos los contribuidores <i className="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="button is-light"
                onClick={() => { goToContribution(); closeMobileMenu(); }}
                title="Añadir una nueva comunidad al directorio"
              >
                <span className="icon"><i className="fas fa-plus"></i></span>
                <span className="heading-btn-label">Añadir comunidad</span>
              </button>
              <button
                className={`button ${isVisible ? "is-primary" : "is-light"}`}
                onClick={() => { toggleSidebar(); closeMobileMenu(); }}
                title={isVisible ? "Ocultar filtros" : "Mostrar filtros"}
              >
                <span className="icon"><i className="fas fa-sliders"></i></span>
                <span className="heading-btn-label">Filtros</span>
              </button>
              <ViewToggleButton view={view} toggleView={() => { toggleView(); closeMobileMenu(); }} />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
