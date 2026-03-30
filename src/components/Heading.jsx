/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher.jsx";
import allContributorsRaw from "../../.all-contributorsrc?raw";
const allContributorsRc = JSON.parse(allContributorsRaw);

const CONTRIBUTORS_URL = "https://github.com/ComBuildersES/communities-directory?tab=readme-ov-file#contributors";
const MAX_CONTRIBUTORS_IN_POPOVER = 24;
const allContributors = allContributorsRc.contributors;

const APP_URL = "https://combuilderses.github.io/communities-directory/";
const GITHUB_URL = "https://github.com/ComBuildersES/communities-directory";
const DATA_URL = "https://github.com/ComBuildersES/communities-directory/tree/master/public/data";

function shareText(handle, t) {
  return t("heading.shareText", { handle, url: APP_URL });
}

function buildShareLinks(t) {
  return [
    {
      label: "X / Twitter",
      icon: "fa-brands fa-x-twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText("@ComBuilders_ES", t))}`,
    },
    {
      label: "Bluesky",
      icon: "fa-brands fa-bluesky",
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText("@communitybuilders.bsky.social", t))}`,
    },
    {
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`,
    },
    {
      label: "WhatsApp",
      icon: "fa-brands fa-whatsapp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText("Community Builders", t))}`,
    },
    {
      label: "Telegram",
      icon: "fa-brands fa-telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(shareText("Community Builders", t))}`,
    },
  ];
}

function shuffleContributors(contributors) {
  const shuffled = [...contributors];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function Heading ({
  isContributionView = false,
  closeContributionForm,
  goToHome,
  goToContribution,
}) {
  const { t } = useTranslation();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visibleContributors, setVisibleContributors] = useState(() => (
    shuffleContributors(allContributors).slice(0, MAX_CONTRIBUTORS_IN_POPOVER)
  ));
  const aboutRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const bookmarkShortcut = useMemo(() => (
    /mac/i.test(window.navigator.userAgent) ? "Cmd + D" : "Ctrl + D"
  ), []);
  const SHARE_LINKS = useMemo(() => buildShareLinks(t), [t]);

  useEffect(() => {
    if (isAboutOpen) {
      setVisibleContributors(
        shuffleContributors(allContributors).slice(0, MAX_CONTRIBUTORS_IN_POPOVER),
      );
    }
  }, [isAboutOpen]);

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
            <h1 className="heading-title">{t("heading.title")}</h1>
            <p className="heading-subtitle">{t("heading.subtitle")}</p>
          </div>
        </button>
      </div>

      <div className="heading-actions" ref={mobileMenuRef}>
        {isContributionView ? (
          <button className="heading-action-btn" onClick={closeContributionForm}>
            <i className="fas fa-arrow-left"></i>
            <span>{t("heading.back")}</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              className="button is-light heading-hamburger"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? t("heading.closeMenu") : t("heading.openMenu")}
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
                  title={t("heading.about")}
                  aria-expanded={isAboutOpen}
                  aria-haspopup="dialog"
                >
                  <i className="fas fa-circle-info"></i>
                  <span className="heading-btn-label">{t("heading.about")}</span>
                </button>
                {isAboutOpen && (
                  <>
                  <div className="heading-support-backdrop" onClick={() => setIsAboutOpen(false)} aria-hidden="true" />
                  <div className="heading-support-popover" role="dialog" aria-label={t("heading.about")}>
                    <p className="heading-support-title">{t("heading.about")}</p>
                    <p className="heading-support-copy">
                      {t("heading.aboutCopy1")}{" "}
                      <a href="https://communitybuilders.es" target="_blank" rel="noopener noreferrer">Community Builders ES</a>,{" "}
                      {t("heading.aboutCopy2")}{" "}
                      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">{t("heading.openSource")}</a>{" "}
                      {t("heading.aboutCopy3")}{" "}
                      <a href={DATA_URL} target="_blank" rel="noopener noreferrer">{t("heading.openData")}</a>.
                      {" "}{t("heading.aboutStar")}{" "}
                      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
                    </p>
                    <p className="heading-support-copy">
                      {t("heading.bookmarkHint", { shortcut: bookmarkShortcut })}
                    </p>
                    <div className="heading-support-section">
                      <p className="heading-support-section-title">{t("heading.collaborate")}</p>
                      <p className="heading-support-copy">
                        {t("heading.collaborateCopy1")}{" "}
                        <a
                          href="https://github.com/ComBuildersES/communities-directory/issues"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("heading.openIssue")}
                        </a>{" "}
                        {t("heading.collaborateCopy2")}{" "}
                        <a
                          href="https://github.com/ComBuildersES/communities-directory/blob/master/CONTRIBUTING.md"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          CONTRIBUTING
                        </a>.
                      </p>
                      <p className="heading-support-copy">
                        {t("heading.seekingPart1")}{" "}
                        <a
                          href="https://github.com/ComBuildersES/communities-directory/issues/53"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("heading.provincialMaintainers")}
                        </a>{" "}
                        {t("heading.seekingPart2")}
                      </p>
                    </div>

                    <div className="heading-support-share">
                      <p className="heading-support-section-title">{t("heading.shareQuestion")}</p>
                      <div className="heading-support-share-buttons">
                        {SHARE_LINKS.map(({ label, icon, href }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="heading-support-share-btn"
                            title={t("heading.shareOn", { platform: label })}
                            aria-label={t("heading.shareOn", { platform: label })}
                          >
                            <i className={icon}></i>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="heading-support-contributors">
                      <p className="heading-support-section-title">{t("heading.contributorsTitle")}</p>
                      <div className="heading-support-contributors-grid">
                        {visibleContributors.map((c) => (
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
                        {t("heading.seeAllContributors")} <i className="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                  </>
                )}
              </div>
              <LanguageSwitcher />
              <button
                type="button"
                className="heading-action-btn heading-action-btn--cta"
                onClick={() => { goToContribution(); closeMobileMenu(); }}
                title={t("heading.addCommunityTitle")}
              >
                <i className="fas fa-plus"></i>
                <span className="heading-btn-label">{t("heading.addCommunity")}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
