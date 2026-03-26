import { useTranslation } from "react-i18next";

export function ViewToggleButton ({ view, toggleView }) {
    const { t } = useTranslation();
    return (
        <button className="button is-light is-small" onClick={toggleView}>
            <span className="icon">
                <i className={`fa-solid ${view === "map" ? "fa-list" : "fa-map"}`}></i>
            </span>
            <span>{view === "map" ? t("viewToggle.list") : t("viewToggle.map")}</span>
        </button>
    );
}
