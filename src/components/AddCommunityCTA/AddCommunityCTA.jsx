
import { useTranslation } from "react-i18next";
import {
  useIsLoading,
} from "../../stores/community.store.js";
import { buildContributionPath } from "../../lib/communitySubmission";

import "./AddCommunityCTA.css";

export function AddCommunityCTA () {
  const { t } = useTranslation();
  const isLoading = useIsLoading();

  if (isLoading) return <></>;

  return (
    <div className="add-community-cta">
      <p className="title">
        {t("addCommunityCTA.question")}{" "}
        <a className="button is-primary" href={buildContributionPath({ mode: "new" })}>
          {t("addCommunityCTA.button")}
        </a>
      </p>
    </div>
  );
}
