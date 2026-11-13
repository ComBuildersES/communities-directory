/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAllCommunities, useCommunityActions, useFilters, useInvertedIndex } from "../../stores/community.store.js";
import { countOpenToOptions } from "../../lib/communityOpenTo.js";
import { searchFaceted } from "../../data/searchFaceted.js";
import { InfoTooltip } from "../OpenToOptions.jsx";
import { PromptList } from "../OpenDataModal/OpenDataModal.jsx";
import { GuideSection, GuideScreenshot } from "./FindCommunityGuide.jsx";
import { CommunityBuildersContent } from "../CommunityBuildersModal/CommunityBuildersModal.jsx";
import { DataSourcePicker } from "./FindCommunityAiGuide.jsx";

const COLLABORATION_PROMPTS = ["synergies"];

export function OrganizeCommunityGuide({ onSelectMember, onFilters }) {
  const { t } = useTranslation();
  const [section, setSection] = useState(null);
  const filters = useFilters();
  const communities = useAllCommunities();
  const index = useInvertedIndex();
  const { setFilters } = useCommunityActions();
  const count = useMemo(() => countOpenToOptions(searchFaceted(communities, index,
    Object.fromEntries(Object.entries(filters).filter(([key]) => key !== "openTo"))))
    .collaborations, [communities, index, filters]);
  const sectionProps = (id, icon) => ({
    id: `organize-${id}`, icon,
    title: t(`directoryGuide.organize.${id}Title`),
    hint: t(`directoryGuide.organize.${id}Hint`),
    isOpen: section === id,
    onToggle: () => setSection(current => current === id ? null : id),
  });
  return <div className="guide-organize guide-accordion">
    <GuideSection {...sectionProps("connect", "fa-people-group")}>
      <CommunityBuildersContent onSelectMember={onSelectMember} />
    </GuideSection>
    <GuideSection {...sectionProps("collaborate", "fa-handshake")}>
      <p>{t("directoryGuide.organize.collaborate")}</p>
      <GuideScreenshot name="filters" locale="es" alt={t("directoryGuide.find.filtersImageAlt")} width={1280} height={260} />
      <aside className="guide-contribute-notes guide-organize-note" aria-label={t("directoryGuide.contribute.notesTitle")}>
        <i className="fas fa-circle-info" aria-hidden="true" />
        <p>{t("directoryGuide.organize.availability")}</p>
      </aside>
      <div className="guide-contribute-actions guide-organize-action">
      <InfoTooltip className="opendata-footer-btn"
        label={t("directoryGuide.organize.collaborationsAction", { count })}
        text={t("openTo.descriptions.collaborations")} disabled={count === 0}
        onClick={() => { setFilters({ ...filters, openTo: ["collaborations"] }); onFilters(); }}>
        {t("directoryGuide.organize.collaborationsAction", { count })}
      </InfoTooltip>
      <button type="button" className="opendata-footer-btn" onClick={onFilters}>{t("directoryGuide.actions.filters")}</button>
      </div>
      <div className="guide-ai-prompts">
        <p>{t("directoryGuide.organize.ai")}</p>
        <p className="opendata-note guide-data-intro">{t("directoryGuide.find.dataIntro")}</p>
        <DataSourcePicker />
        <div className="guide-ai-prompt-list"><PromptList keys={COLLABORATION_PROMPTS} /></div>
      </div>
    </GuideSection>
  </div>;
}
