/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAllCommunities, useCommunityActions, useFilters, useInvertedIndex } from "../../stores/community.store.js";
import { OPEN_TO_OPTIONS, countOpenToOptions } from "../../lib/communityOpenTo.js";
import { searchFaceted } from "../../data/searchFaceted.js";
import { InfoTooltip } from "../OpenToOptions.jsx";
import { PromptList } from "../OpenDataModal/OpenDataModal.jsx";
import { GuideSection, GuideScreenshot } from "./FindCommunityGuide.jsx";
import { DataSourcePicker } from "./FindCommunityAiGuide.jsx";

const CONTRIBUTE_PROMPTS = ["speaker", "volunteer"];

export function ContributeCommunityGuide({ onViewCommunities, onMap }) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState(null);
  const [tab, setTab] = useState("directory");
  const filters = useFilters();
  const communities = useAllCommunities();
  const { setFilters } = useCommunityActions();
  const invertedIndex = useInvertedIndex();
  const counts = useMemo(() => {
    const otherFilters = Object.fromEntries(Object.entries(filters).filter(([key]) => key !== "openTo"));
    return countOpenToOptions(searchFaceted(communities, invertedIndex, otherFilters));
  }, [communities, invertedIndex, filters]);

  const sectionProps = (id, icon) => ({
    id: `contribute-${id}`, icon,
    title: t(`directoryGuide.contribute.${id}Title`),
    hint: t(`directoryGuide.contribute.${id}Hint`),
    isOpen: openSection === id,
    onToggle: () => setOpenSection(current => current === id ? null : id),
  });

  return <>
    <div className="opendata-tabs" role="tablist" aria-label={t("directoryGuide.contribute.title")}>
      {["directory", "ai"].map((id) => <button key={id} type="button" role="tab"
        id={`contribute-tab-${id}`} aria-selected={tab === id} aria-controls="guide-contribute-panel"
        tabIndex={tab === id ? 0 : -1}
        className={`opendata-tab${tab === id ? " opendata-tab--active" : ""}`}
        onClick={() => setTab(id)} onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? "directory" : event.key === "End" ? "ai" : tab === "directory" ? "ai" : "directory";
          setTab(next);
          document.getElementById(`contribute-tab-${next}`)?.focus();
        }}>{t(`directoryGuide.tabs.${id}`)}</button>)}
    </div>
    <div id="guide-contribute-panel" className="opendata-panel" role="tabpanel" aria-labelledby={`contribute-tab-${tab}`}>
      {tab === "directory" ? <div className="guide-contribute guide-accordion">
        <GuideSection {...sectionProps("offer", "fa-hand-holding-heart")}>
        <aside className="guide-contribute-notes" aria-label={t("directoryGuide.contribute.notesTitle")}>
          <i className="fas fa-circle-info" aria-hidden="true" />
          <div>
            <strong>{t("directoryGuide.contribute.notesTitle")}</strong>
            <p>{t("directoryGuide.contribute.coverage")}</p>
            <p>{t("directoryGuide.contribute.contact")}</p>
          </div>
        </aside>
        <div className="guide-contribute-chips" role="group" aria-labelledby="contribute-chips-label">
          <span id="contribute-chips-label" className="guide-contribute-prefix">{t("directoryGuide.contribute.chipsPrefix")}</span>
          {OPEN_TO_OPTIONS.map(value => {
            const action = t(`directoryGuide.contribute.options.${value}`);
            return <InfoTooltip key={value} className="guide-contribute-chip"
              label={t("directoryGuide.contribute.chipCount", { action, count: counts[value] })}
              text={t(`openTo.descriptions.${value}`)} disabled={counts[value] === 0}
              onClick={() => {
                setFilters({ ...filters, openTo: [value] });
                onViewCommunities();
              }}>
              <span>{action}</span><span className="guide-contribute-chip-count" aria-hidden="true">{counts[value]}</span>
            </InfoTooltip>;
          })}
        </div>
        </GuideSection>
        <GuideSection {...sectionProps("refine", "fa-sliders")}>
        <p>{t("directoryGuide.contribute.combine")}</p>
        <GuideScreenshot name="filters" locale="es" alt={t("directoryGuide.find.filtersImageAlt")} width={1280} height={260} />
        <div className="guide-contribute-actions guide-contribute-explore">
          <button type="button" className="opendata-footer-btn" onClick={onViewCommunities}>{t("directoryGuide.actions.filters")}</button>
          <InfoTooltip className="opendata-footer-btn" label={t("directoryGuide.actions.map")}
            text={t("directoryGuide.find.mapNote")} onClick={onMap}>
            {t("directoryGuide.actions.map")}
          </InfoTooltip>
        </div>
        </GuideSection>
      </div> : <div className="guide-ai">
        <p className="opendata-lead">{t("directoryGuide.contribute.ai")}</p>
        <p className="opendata-note guide-data-intro">{t("directoryGuide.find.dataIntro")}</p>
        <DataSourcePicker />
        <div className="guide-ai-prompts">
          <p>{t("directoryGuide.find.promptsIntro")}</p>
          <div className="guide-ai-prompt-list"><PromptList keys={CONTRIBUTE_PROMPTS} /></div>
        </div>
      </div>}
    </div>
  </>;
}
