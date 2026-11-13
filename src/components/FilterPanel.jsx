import { useTranslation } from "react-i18next";
import { InfoTooltip, OpenToFilters } from "./OpenToOptions.jsx";
import { Switch } from "./Switch";
import { useSideBarVisible } from "../stores/sidebar.store.js";
import { COMMUNITY_LANGUAGE_OPTIONS } from "../lib/communityLanguages.js";

export function FilterPanel() {
  const { t } = useTranslation();
  const isVisible = useSideBarVisible();

  return (
    <div className={`filter-panel ${isVisible ? "filter-panel--open" : ""}`} tabIndex={-1} role="region" aria-label={t("resultsBar.filters")}>
      <div className="filter-panel-inner">
        <div className="filter-group">
          <div className="filter-group-label filter-group-label--with-info">
            <span>{t("sidebar.communityType")}</span>
            <InfoTooltip label={t("sidebar.communityTypeHelp")} text={t("sidebar.communityTypeNote")} />
          </div>
          <div className="filter-group-items">
            {["tech-meetup", "conference", "collaborative-group", "mutual-aid", "hacklab", "umbrella-org", "meta-community"].map((type) => (
              <div className="option-item community-type-option is-size-7" key={type}>
                <p>{t(`communityType.${type}`)}</p>
                <InfoTooltip
                  label={t("openTo.info", { option: t(`communityType.${type}`) })}
                  text={t(`sidebar.communityTypeDescriptions.${type}`)}
                />
                <Switch name="communityType" value={type} />
              </div>
            ))}
          </div>
        </div>

        <div className="filter-group-divider" />

        <div className="filter-group">
          <p className="filter-group-label">{t("sidebar.eventFormat")}</p>
          <div className="filter-group-items">
            <div className="option-item is-size-7"><p>{t("eventFormat.hybrid")}</p><Switch name="eventFormat" value="hybrid" /></div>
            <div className="option-item is-size-7"><p>{t("eventFormat.online")}</p><Switch name="eventFormat" value="online" /></div>
            <div className="option-item is-size-7"><p>{t("eventFormat.in-person")}</p><Switch name="eventFormat" value="in-person" /></div>
            <div className="option-item is-size-7"><p>{t("eventFormat.unknown")}</p><Switch name="eventFormat" value="unknown" /></div>
          </div>
        </div>

        <div className="filter-group-divider" />

        <div className="filter-group">
          <p className="filter-group-label">{t("sidebar.status")}</p>
          <div className="filter-group-items">
            <div className="option-item is-size-7"><p>{t("status.active")}</p><Switch name="status" value="active" /></div>
            <div className="option-item is-size-7"><p>{t("status.inactive")}</p><Switch name="status" value="inactive" /></div>
            <div className="option-item is-size-7"><p>{t("status.unknown")}</p><Switch name="status" value="unknown" /></div>
          </div>
        </div>

        <div className="filter-group-divider" />

        <div className="filter-group">
          <p className="filter-group-label">{t("openTo.title")}</p>
          <OpenToFilters />
        </div>
        <div className="filter-group-divider" />
        <div className="filter-group">
          <p className="filter-group-label">{t("sidebar.langs")}</p>
          <div className="filter-group-items">
            {COMMUNITY_LANGUAGE_OPTIONS.map((code) => (
              <div key={code} className="option-item is-size-7">
                <p>{t(`language.${code}`)}</p>
                <Switch name="langs" value={code} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
