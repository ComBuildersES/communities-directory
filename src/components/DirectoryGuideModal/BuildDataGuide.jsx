/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GuideSection } from "./FindCommunityGuide.jsx";
import { DataSourcePicker } from "./FindCommunityAiGuide.jsx";
import { AgentInstructions, CodeSnippets, DataFiles, PromptList } from "../OpenDataModal/OpenDataModal.jsx";

const ONBOARDING = ["onboarding"];
const DATA_DOC_URL = "https://github.com/ComBuildersES/communities-directory/blob/master/docs/DATA.md";

export function BuildDataGuide({ onMore }) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState(null);
  const section = (id, icon) => ({
    id: `build-${id}`, icon,
    title: t(`directoryGuide.build.${id}Title`),
    hint: t(`directoryGuide.build.${id}Hint`),
    isOpen: openSection === id,
    onToggle: () => setOpenSection(current => current === id ? null : id),
  });
  return (
    <div className="guide-accordion guide-detail guide-build">
      <GuideSection {...section("files", "fa-database")}>
        <p>{t("openData.code.lead")}</p>
        <DataSourcePicker />
        <h4 className="opendata-section-title">{t("directoryGuide.build.downloads")}</h4>
        <DataFiles />
        <aside className="guide-contribute-notes guide-detail-note">
          <i className="fas fa-scale-balanced" aria-hidden="true"></i>
          <p><a href="https://creativecommons.org/licenses/by/4.0/deed.es" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>{" — "}{t("openData.license")}</p>
        </aside>
        <a className="opendata-footer-btn" href={DATA_DOC_URL} target="_blank" rel="noopener noreferrer">{t("openData.footerDocs")}</a>
      </GuideSection>
      <GuideSection {...section("code", "fa-code")}>
        <p>{t("directoryGuide.build.examples")}</p>
        <div className="guide-ai-prompt-list"><CodeSnippets /></div>
        <p className="opendata-note">{t("openData.code.gotcha")} <a href={`${import.meta.env.BASE_URL}data/schema.json`} target="_blank" rel="noopener noreferrer">schema.json</a>.</p>
      </GuideSection>
      <GuideSection {...section("agents", "fa-wand-magic-sparkles")}>
        <p>{t("directoryGuide.build.ai")}</p>
        <div className="guide-ai-prompt-list"><PromptList keys={ONBOARDING} /></div>
        <h4 className="opendata-section-title">{t("openData.build.agentsTitle")}</h4>
        <AgentInstructions />
        <button type="button" className="guide-inline-link guide-more" onClick={onMore}>{t("directoryGuide.build.more")}</button>
      </GuideSection>
    </div>
  );
}
