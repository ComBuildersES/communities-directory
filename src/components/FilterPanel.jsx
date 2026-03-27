import { useTranslation } from "react-i18next";
import { Switch } from "./Switch";
import { useSideBarVisible } from "../stores/sidebar.store.js";

export function FilterPanel() {
  const { t } = useTranslation();
  const isVisible = useSideBarVisible();

  return (
    <div className={`filter-panel ${isVisible ? "filter-panel--open" : ""}`}>
      <div className="filter-panel-inner">
        <div className="filter-group">
          <p className="filter-group-label">{t("sidebar.communityType")}</p>
          <div className="filter-group-items">
            <div className="option-item is-size-7"><p>{t("communityType.tech-meetup")}</p><Switch name="communityType" value="tech-meetup" /></div>
            <div className="option-item is-size-7"><p>{t("communityType.conference")}</p><Switch name="communityType" value="conference" /></div>
            <div className="option-item is-size-7"><p>{t("communityType.collaborative-group")}</p><Switch name="communityType" value="collaborative-group" /></div>
            <div className="option-item is-size-7"><p>{t("communityType.mutual-aid")}</p><Switch name="communityType" value="mutual-aid" /></div>
            <div className="option-item is-size-7"><p>{t("communityType.hacklab")}</p><Switch name="communityType" value="hacklab" /></div>
            <div className="option-item is-size-7"><p>{t("communityType.umbrella-org")}</p><Switch name="communityType" value="umbrella-org" /></div>
            <div className="option-item is-size-7"><p>{t("communityType.meta-community")}</p><Switch name="communityType" value="meta-community" /></div>
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
      </div>
    </div>
  );
}
