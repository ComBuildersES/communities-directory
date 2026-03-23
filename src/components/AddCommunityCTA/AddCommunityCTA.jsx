
import {
  useIsLoading,
} from "../../stores/community.store.js";
import { buildContributionPath } from "../../lib/communitySubmission";

import "./AddCommunityCTA.css";

export function AddCommunityCTA () {
  const isLoading = useIsLoading();

  if (isLoading) return <></>;

  return (
    <div className="add-community-cta">
      <p className="title">
        ¿Echas en falta alguna comunidad?{" "}
        <a className="button is-primary" href={buildContributionPath({ mode: "new" })}>
          Solicitar nueva comunidad aquí
        </a>
      </p>
    </div>
  );
}
