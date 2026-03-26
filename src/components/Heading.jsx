/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import allContributorsRaw from "../../.all-contributorsrc?raw";
const allContributorsRc = JSON.parse(allContributorsRaw);

const CONTRIBUTORS_URL = "https://github.com/ComBuildersES/communities-directory?tab=readme-ov-file#contributors";
const MAX_CONTRIBUTORS_IN_POPOVER = 24;
const contributors = allContributorsRc.contributors.slice(0, MAX_CONTRIBUTORS_IN_POPOVER);

const APP_URL = "https://combuilderses.github.io/communities-directory/";
const GITHUB_URL = "https://github.com/ComBuildersES/communities-directory";
const DATA_URL = "https://github.com/ComBuildersES/communities-directory/tree/master/public/data";

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
  isContributionView = false,
  closeContributionForm,
  goToHome,
  goToContribution,
}) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const aboutRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const bookmarkShortcut = useMemo(() => (
    /mac/i.test(window.navigator.userAgent) ? "Cmd + D" : "Ctrl + D"
  ), []);

  useEffect(() => {
    if (!isAboutOpen) return;

    const handlePointerDown = (event) => {
      if (!aboutRef.current?.contains(event.target)) {
        setIsAboutOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsAboutOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAboutOpen]);

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
        setIsAboutOpen(false);
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
          <button className="heading-action-btn" onClick={closeContributionForm}>
            <i className="fas fa-arrow-left"></i>
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
              <div className="heading-support" ref={aboutRef}>
                <button
                  type="button"
                  className={`heading-action-btn${isAboutOpen ? " heading-action-btn--active" : ""}`}
                  onClick={() => setIsAboutOpen((current) => !current)}
                  title="Sobre el proyecto"
                  aria-expanded={isAboutOpen}
                  aria-haspopup="dialog"
                >
                  <i className="fas fa-circle-info"></i>
                  <span className="heading-btn-label">Sobre el proyecto</span>
                </button>
                {isAboutOpen && (
                  <>
                  <div className="heading-support-backdrop" onClick={() => setIsAboutOpen(false)} aria-hidden="true" />
                  <div className="heading-support-popover" role="dialog" aria-label="Sobre el proyecto">
                    <p className="heading-support-title">Sobre el proyecto</p>
                    <p className="heading-support-copy">
                      Nuestro objetivo es mantener el mayor directorio de comunidades tecnológicas de España. Iniciativa de{" "}
                      <a href="https://communitybuilders.es" target="_blank" rel="noopener noreferrer">Community Builders ES</a>,{" "}
                      con{" "}
                      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">código abierto</a>{" "}
                      y{" "}
                      <a href={DATA_URL} target="_blank" rel="noopener noreferrer">datos abiertos</a>.
                      Si te resulta útil, dale una ⭐ en{" "}
                      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
                    </p>
                    <p className="heading-support-copy">
                      Y no te olvides de guardar en favoritos: <strong>{bookmarkShortcut}</strong>.
                    </p>
                    <div className="heading-support-section">
                      <p className="heading-support-section-title">Colabora</p>
                      <p className="heading-support-copy">
                        Nuevas ideas, bugs y cualquier otra colaboración son bienvenidas —{" "}
                        <a
                          href="https://github.com/ComBuildersES/communities-directory/issues"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          abre un issue
                        </a>{" "}
                        o consulta{" "}
                        <a
                          href="https://github.com/ComBuildersES/communities-directory/blob/master/CONTRIBUTING.md"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CONTRIBUTING
                        </a>.
                      </p>
                      <p className="heading-support-copy">
                        Buscamos{" "}
                        <a
                          href="https://github.com/ComBuildersES/communities-directory/issues/53"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          responsables provinciales
                        </a>{" "}
                        que ayuden a mantener los datos de las comunidades locales.
                      </p>
                    </div>

                    <div className="heading-support-share">
                      <p className="heading-support-section-title">¿Nos ayudas a difundirlo?</p>
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
                      <p className="heading-support-section-title">La comunidad que lo hace posible</p>
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
                        Ver a todas las personas que contribuyen <i className="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="heading-action-btn heading-action-btn--cta"
                onClick={() => { goToContribution(); closeMobileMenu(); }}
                title="Añadir una nueva comunidad al directorio"
              >
                <i className="fas fa-plus"></i>
                <span className="heading-btn-label">Añadir comunidad</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
