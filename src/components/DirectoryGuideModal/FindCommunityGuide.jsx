/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FindCommunityAiGuide } from "./FindCommunityAiGuide.jsx";

export function GuideScreenshot({ name, locale, alt, width, height }) {
  const { t } = useTranslation();
  const src = `${import.meta.env.BASE_URL}images/guide/${name}-${locale}.webp`;
  return (
    <a className="guide-screenshot-link" href={src} target="_blank" rel="noopener noreferrer" aria-label={`${t("directoryGuide.expandImage")}: ${alt}`}>
      <img className="guide-screenshot" src={src} alt={alt} width={width} height={height} loading="lazy" />
      <span><i className="fas fa-magnifying-glass-plus" aria-hidden="true"></i> {t("directoryGuide.expandImage")}</span>
    </a>
  );
}

export function GuideSection({ id, icon, title, hint, isOpen, onToggle, children }) {
  return (
    <section className={`guide-accordion-item${isOpen ? " guide-accordion-item--open" : ""}`}>
      <h3>
        <button
          type="button"
          className="guide-accordion-trigger"
          id={`guide-section-${id}`}
          aria-expanded={isOpen}
          aria-controls={`guide-section-panel-${id}`}
          onClick={onToggle}
        >
          <span className="guide-accordion-icon"><i className={`fas ${icon}`} aria-hidden="true"></i></span>
          <span className="guide-accordion-label"><strong>{title}</strong><small>{hint}</small></span>
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"} guide-accordion-caret`} aria-hidden="true"></i>
        </button>
      </h3>
      <div id={`guide-section-panel-${id}`} className="guide-accordion-panel" role="region" aria-labelledby={`guide-section-${id}`} hidden={!isOpen}>
        {children}
      </div>
    </section>
  );
}

export function FindCommunityGuide({ onSearch, onFilters, onMap, onContribute }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "es";
  const [tab, setTab] = useState("directory");
  const [openSection, setOpenSection] = useState(null);
  const sectionProps = (id, icon) => ({
    id,
    icon,
    title: t(`directoryGuide.find.${id}Title`),
    hint: t(`directoryGuide.find.${id}Hint`),
    isOpen: openSection === id,
    onToggle: () => setOpenSection((current) => current === id ? null : id),
  });

  const selectTab = (next) => setTab(next);
  return (
    <>
      <div className="opendata-tabs" role="tablist" aria-label={t("directoryGuide.find.title")}>
        {["directory", "ai"].map((id) => (
          <button
            key={id}
            type="button"
            id={`guide-tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls="guide-find-panel"
            tabIndex={tab === id ? 0 : -1}
            className={`opendata-tab${tab === id ? " opendata-tab--active" : ""}`}
            onClick={() => selectTab(id)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? "directory" : event.key === "End" ? "ai" : tab === "directory" ? "ai" : "directory";
              selectTab(next);
              document.getElementById(`guide-tab-${next}`)?.focus();
            }}
          >
            {t(`directoryGuide.tabs.${id}`)}
          </button>
        ))}
      </div>
      <div id="guide-find-panel" className="opendata-panel" role="tabpanel" aria-labelledby={`guide-tab-${tab}`}>
        {tab === "directory" ? (
          <div className="guide-accordion">
            <GuideSection {...sectionProps("search", "fa-magnifying-glass")}>
              <p>{t("directoryGuide.find.search")}</p>
              <GuideScreenshot name="search" locale={locale} alt={t("directoryGuide.find.searchImageAlt")} width={940} height={locale === "en" ? 375 : 402} />
              <button className="opendata-footer-btn" type="button" onClick={onSearch}>{t("directoryGuide.actions.search")}</button>
            </GuideSection>
            <GuideSection {...sectionProps("filters", "fa-sliders")}>
              <p>{t("directoryGuide.find.filters")}</p>
              <GuideScreenshot name="filters" locale={locale} alt={t("directoryGuide.find.filtersImageAlt")} width={1280} height={260} />
              <ul className="guide-tips">
                <li>{t("directoryGuide.find.combineTip")}</li>
                <li>{t("directoryGuide.find.statusTip")}</li>
                <li>{t("directoryGuide.find.openTo")}{" "}<button className="guide-inline-link" type="button" onClick={onContribute}>{t("directoryGuide.contribute.title")}</button></li>
              </ul>
              <button className="opendata-footer-btn" type="button" onClick={onFilters}>{t("directoryGuide.actions.filters")}</button>
            </GuideSection>
            <GuideSection {...sectionProps("map", "fa-map-location-dot")}>
              <p>{t("directoryGuide.find.map")}</p>
              <p className="opendata-note">{t("directoryGuide.find.mapNote")}</p>
              <button className="opendata-footer-btn" type="button" onClick={onMap}>{t("directoryGuide.actions.map")}</button>
            </GuideSection>
          </div>
        ) : (
          <FindCommunityAiGuide />
        )}
      </div>
    </>
  );
}
