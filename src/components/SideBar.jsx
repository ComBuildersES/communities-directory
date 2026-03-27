import { useTranslation } from "react-i18next";
import { Switch } from "./Switch";
import { useSideBarVisible, useSidebarActions } from "../stores/sidebar.store.js";
import { COMMUNITY_LANGUAGE_OPTIONS } from "../lib/communityLanguages.js";

export const Sidebar = () => {
  const { t } = useTranslation();
  const isSidebarVisible = useSideBarVisible();
  const { toggleSidebar } = useSidebarActions();

  return (
    <aside
      className={`sidebar menu column is-full-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen is-one-fifth-fullhd box sticky ${
        isSidebarVisible ? "" : "sidebar--collapsed"
      }`}
    >
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarVisible ? t("resultsBar.hideFilters") : t("resultsBar.showFilters")}
        >
          <i className={`fas ${isSidebarVisible ? "fa-chevron-right" : "fa-filter"}`}></i>
        </button>
        <p className="menu-label">{t("sidebar.communityType")}</p>
      </div>
      <div className="sidebar-content">
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.tech-meetup")}</p>
            <Switch name="communityType" value="tech-meetup" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.conference")}</p>
            <Switch name="communityType" value="conference" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.collaborative-group")}</p>
            <Switch name="communityType" value="collaborative-group" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.mutual-aid")}</p>
            <Switch name="communityType" value="mutual-aid" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.hacklab")}</p>
            <Switch name="communityType" value="hacklab" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.umbrella-org")}</p>
            <Switch name="communityType" value="umbrella-org" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("communityType.meta-community")}</p>
            <Switch name="communityType" value="meta-community" />
          </div>
        </li>
      </ul>

      <p className="menu-label">{t("sidebar.eventFormat")}</p>
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("eventFormat.hybrid")}</p>
            <Switch name="eventFormat" value="hybrid" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("eventFormat.online")}</p>
            <Switch name="eventFormat" value="online" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("eventFormat.in-person")}</p>
            <Switch name="eventFormat" value="in-person" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("eventFormat.unknown")}</p>
            <Switch name="eventFormat" value="unknown" />
          </div>
        </li>
      </ul>

      <p className="menu-label">{t("sidebar.status")}</p>
      {/*Aqui podia definir un list box de seleccion multiple con
        las distintas provincias como opciones */}
      <ul className="menu-list">
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("status.active")}</p>
            <Switch name="status" value="active" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("status.inactive")}</p>
            <Switch name="status" value="inactive" />
          </div>
        </li>
        <li className="menu-item">
          <div className="option-item is-size-7">
            <p>{t("status.unknown")}</p>
            <Switch name="status" value="unknown" />
          </div>
        </li>
      </ul>

      <p className="menu-label">{t("sidebar.langs")}</p>
      <ul className="menu-list">
        {COMMUNITY_LANGUAGE_OPTIONS.map((code) => (
          <li key={code} className="menu-item">
            <div className="option-item is-size-7">
              <p>{t(`language.${code}`)}</p>
              <Switch name="langs" value={code} />
            </div>
          </li>
        ))}
      </ul>

      {/* <p className="menu-label">Localizacion habitual</p> */}
      {/*Aqui podia definir un list box de seleccion multiple con
        las distintas provincias como opciones o poner todas y que
        vayan filtrando */}
      {/* <ul className="menu-list">
        <li className="menu-item"></li>
        <li className="menu-item"></li>
      </ul> */}
      </div>
    </aside>
  );
};

export default Sidebar;
