/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GuideScreenshot, GuideSection } from "./FindCommunityGuide.jsx";
import { HelpBlock } from "../OpenDataModal/OpenDataModal.jsx";

export function ImproveDirectoryGuide({ onSearch, onAdd }) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState(null);
  const section = (id, icon) => ({
    id: `improve-${id}`, icon,
    title: t(`directoryGuide.improve.${id}Title`),
    hint: t(`directoryGuide.improve.${id}Hint`),
    isOpen: openSection === id,
    onToggle: () => setOpenSection(current => current === id ? null : id),
  });
  return (
    <div className="guide-accordion guide-detail">
      <GuideSection {...section("propose", "fa-pen-to-square")}>
        <p>{t("directoryGuide.improve.search")}</p>
        <GuideScreenshot name="search" locale="es" alt={t("directoryGuide.find.searchImageAlt")} width={940} height={402} />
        <div className="guide-detail-actions">
          <button type="button" className="opendata-footer-btn" onClick={onSearch}>{t("directoryGuide.actions.search")}</button>
          <button type="button" className="opendata-footer-btn" onClick={onAdd}>{t("directoryGuide.improve.add")}</button>
        </div>
        <p>{t("directoryGuide.improve.edit")}</p>
        <GuideScreenshot name="edit" locale="es" alt={t("directoryGuide.improve.editImageAlt")} width={600} height={138} />
        <aside className="guide-contribute-notes guide-detail-note">
          <i className="fas fa-circle-info" aria-hidden="true"></i>
          <p>{t("directoryGuide.improve.review")}</p>
        </aside>
      </GuideSection>
      <GuideSection {...section("maintain", "fa-list-check")}>
        <p>{t("directoryGuide.improve.discovery")}</p>
        <ol className="guide-maintenance-list">
          {[1, 2, 3, 4].map(n => <li key={n}><strong>{t(`openData.organizers.step${n}Title`)}</strong><p>{t(`openData.organizers.step${n}`)}</p></li>)}
        </ol>
        <div className="opendata-step-links">
          <a href="https://opentechevents.org/" target="_blank" rel="noopener noreferrer">Open Tech Events</a>
          <a href="https://reader.opentechevents.org/" target="_blank" rel="noopener noreferrer">{t("openData.organizers.oteReader")}</a>
          <a href="https://eventos.wiki/" target="_blank" rel="noopener noreferrer">eventos.wiki</a>
        </div>
      </GuideSection>
      <GuideSection {...section("ai", "fa-wand-magic-sparkles")}>
        <p>{t("directoryGuide.improve.ai")}</p>
        <GuideScreenshot name="assist" locale="es" alt={t("directoryGuide.improve.aiImageAlt")} width={934} height={65} />
        <button type="button" className="opendata-footer-btn" onClick={onAdd}>{t("directoryGuide.improve.prepare")}</button>
      </GuideSection>
      <GuideSection {...section("help", "fa-comments")}>
        <HelpBlock title={t("openData.organizers.helpTitle")} copy={t("openData.organizers.helpCopy")} />
      </GuideSection>
    </div>
  );
}
