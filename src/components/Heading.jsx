/* eslint-disable react/prop-types */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher.jsx";
import { buildShareLinks } from "../lib/shareLinks.js";
import { openSupportFab } from "../lib/supportFab.js";
import { DataTransparency } from "./DataTransparency/DataTransparency.jsx";

const OpenDataModal = lazy(() =>
  import("./OpenDataModal/OpenDataModal.jsx").then((m) => ({ default: m.OpenDataModal }))
);
const CommunityBuildersModal = lazy(() =>
  import("./CommunityBuildersModal/CommunityBuildersModal.jsx").then((m) => ({ default: m.CommunityBuildersModal }))
);
import "./CommunityBuildersModal/CommunityBuildersModal.css";
import allContributorsRaw from "../../.all-contributorsrc?raw";
const allContributorsRc = JSON.parse(allContributorsRaw);

const CONTRIBUTORS_URL = "https://github.com/ComBuildersES/communities-directory?tab=readme-ov-file#contributors";
const MAX_CONTRIBUTORS_IN_POPOVER = 24;
const allContributors = allContributorsRc.contributors;

const GITHUB_URL = "https://github.com/ComBuildersES/communities-directory";
// Apunta a la página que explica dónde está cada dataset, no al directorio de ficheros:
// `public/data/` ya solo contiene taxonomías y metadatos (los bundles están gitignorados).
const DATA_URL = "https://github.com/ComBuildersES/communities-directory/blob/master/docs/DATA.md";
// El changelog se regenera en cada despliegue (hook de post-commit en local, job de
// deploy en master), así que este enlace siempre lleva a lo último publicado.
const CHANGELOG_URL = "https://github.com/ComBuildersES/communities-directory/blob/master/CHANGELOG.md";

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
  onSelectMember,
}) {
  const { t } = useTranslation();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isOpenDataOpen, setIsOpenDataOpen] = useState(false);
  const [isBuildersOpen, setIsBuildersOpen] = useState(false);
  const closeBuilders = useCallback(() => setIsBuildersOpen(false), []);
  const buildersReturnFocusRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [githubStars, setGithubStars] = useState(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/ComBuildersES/communities-directory")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count != null) {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);
  const [visibleContributors, setVisibleContributors] = useState(() => (
    shuffleContributors(allContributors).slice(0, MAX_CONTRIBUTORS_IN_POPOVER)
  ));
  const aboutRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const bookmarkShortcut = useMemo(() => (
    /mac/i.test(window.navigator.userAgent) ? "Cmd + D" : "Ctrl + D"
  ), []);
  const SHARE_LINKS = useMemo(() => buildShareLinks(t), [t]);
  const hiddenContributorsCount = Math.max(allContributors.length - visibleContributors.length, 0);
  const contributorAvatars = hiddenContributorsCount > 0
    ? visibleContributors.slice(0, Math.max(visibleContributors.length - 1, 0))
    : visibleContributors;

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
              ref={mobileMenuToggleRef}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? t("heading.closeMenu") : t("heading.openMenu")}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="icon">
                <i className={`fas ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
              </span>
            </button>

            <div className={`heading-actions-inner${isMobileMenuOpen ? " heading-actions-inner--open" : ""}`}>
              <button
                type="button"
                className="heading-action-btn heading-action-btn--builders"
                onClick={(event) => {
                  buildersReturnFocusRef.current = mobileMenuToggleRef.current?.getClientRects().length
                    ? mobileMenuToggleRef.current : event.currentTarget;
                  setIsBuildersOpen(true); setIsAboutOpen(false); closeMobileMenu();
                }}
                aria-haspopup="dialog"
                aria-label={t("builders.cta")}
                title={t("builders.cta")}
              >
                <i className="fas fa-people-group" aria-hidden="true" />
                <span className="heading-btn-label">{t("builders.cta")}</span>
              </button>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="heading-action-btn heading-github-stars"
                title="GitHub"
                aria-label="GitHub stars"
              >
                <i className="fa-brands fa-github"></i>
                {githubStars != null && (
                  <span className="heading-btn-label heading-github-stars-count">
                    <i className="fas fa-star heading-github-stars-icon"></i>
                    {githubStars}
                  </span>
                )}
              </a>
              <button
                type="button"
                className={`heading-action-btn heading-action-btn--data${isOpenDataOpen ? " heading-action-btn--active" : ""}`}
                onClick={() => { setIsOpenDataOpen(true); closeMobileMenu(); }}
                title={t("heading.openDataCtaTitle")}
                aria-haspopup="dialog"
              >
                <i className="fas fa-wand-magic-sparkles"></i>
                <span className="heading-btn-label">{t("heading.openDataCta")}</span>
              </button>
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
                      <a href="https://communitybuilders.dev" target="_blank" rel="noopener noreferrer">Community Builders ES</a>,{" "}
                      {t("heading.aboutCopy2")}{" "}
                      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">{t("heading.openSource")}</a>{" "}
                      {t("heading.aboutCopy3")}{" "}
                      <a href={DATA_URL} target="_blank" rel="noopener noreferrer">{t("heading.openData")}</a>.
                    </p>
                    <p className="heading-support-copy">
                      {t("heading.changelogLead")}{" "}
                      <a href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer">
                        {t("heading.changelogLink")}
                      </a>
                      {t("heading.changelogTail")}
                    </p>
                    <DataTransparency
                      dataUrl={DATA_URL}
                      repoUrl={GITHUB_URL}
                      onNavigate={() => setIsAboutOpen(false)}
                    />

                    <div className="heading-support-share">
                      <p className="heading-support-section-title">{t("heading.shareQuestion")}</p>
                      <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="heading-support-bookmark heading-support-bookmark--action"
                      >
                        <i className="fas fa-star heading-support-bookmark-star"></i>
                        <span>
                          <strong>{t("heading.starAction")}</strong>
                          <small>{t("heading.starHint")}</small>
                        </span>
                      </a>
                      <p className="heading-support-bookmark">
                        <i className="fas fa-bookmark"></i>
                        <span>
                          <strong>{t("heading.bookmarkAction")}</strong>
                          <small>{t("heading.bookmarkHint", { shortcut: bookmarkShortcut })}</small>
                        </span>
                      </p>
                      <p className="heading-support-copy">{t("heading.shareLead")}</p>
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

                    <div className="heading-support-section">
                      <p className="heading-support-section-title">{t("heading.collaborate")}</p>
                      <button
                        type="button"
                        className="heading-support-help-btn"
                        onClick={() => {
                          setIsAboutOpen(false);
                          openSupportFab("give");
                        }}
                      >
                        <i className="fas fa-hand-holding-heart"></i>
                        {t("heading.collaborateCta")}
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>

                    <div className="heading-support-contributors">
                      <p className="heading-support-section-title">{t("heading.contributorsTitle")}</p>
                      <div className="heading-support-contributors-grid">
                        {contributorAvatars.map((c) => (
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
                        {hiddenContributorsCount > 0 && (
                          <a
                            href={CONTRIBUTORS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="heading-support-contributor heading-support-contributor--more"
                            title={t("heading.seeAllContributors")}
                            aria-label={t("heading.seeAllContributors")}
                          >
                            +{hiddenContributorsCount}
                          </a>
                        )}
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

      {isOpenDataOpen && (
        <Suspense fallback={null}>
          <OpenDataModal
            onClose={() => setIsOpenDataOpen(false)}
            onAddCommunity={goToContribution}
          />
        </Suspense>
      )}
      {isBuildersOpen && (
        <Suspense fallback={null}>
          <CommunityBuildersModal onClose={closeBuilders} onSelectMember={onSelectMember} returnFocusRef={buildersReturnFocusRef} />
        </Suspense>
      )}
    </header>
  );
}
