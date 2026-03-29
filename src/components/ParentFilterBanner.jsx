import { useTranslation } from "react-i18next";
import { bajaString } from "../constants.js";
import {
  useAllCommunities,
  useCommunityActions,
  useFilters,
} from "../stores/community.store.js";

export function ParentFilterBanner() {
  const { t } = useTranslation();
  const filters = useFilters();
  const communities = useAllCommunities();
  const { filterComunities } = useCommunityActions();

  const activeParentIds = filters.parentId ?? [];
  if (activeParentIds.length === 0) return null;

  const parentId = Number(activeParentIds[0]);
  const parentName = communities.find((c) => c.id === parentId)?.name ?? String(parentId);

  const handleClear = () => {
    filterComunities("parentId", `${bajaString}${activeParentIds[0]}`);
  };

  return (
    <div className="parent-filter-banner">
      <i className="fa-solid fa-sitemap" aria-hidden="true" />
      {" "}
      <span>{t("communityCard.filteringChildren", { name: parentName })}</span>
      <button
        className="parent-filter-banner__clear"
        onClick={handleClear}
        aria-label={t("communityCard.clearChildrenFilter")}
      >
        {t("communityCard.clearChildrenFilter")}
        {" "}<i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
    </div>
  );
}
