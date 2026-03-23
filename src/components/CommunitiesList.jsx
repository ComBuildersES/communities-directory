import { useMemo } from "react";
import { CommunityCard } from "./CommunityCard.jsx";
import { AddCommunityCTA } from "./AddCommunityCTA/AddCommunityCTA.jsx";

import {
  useIsLoading,
  useIsError,
  useCommunitiesFiltered,
  useTags,
  useAudience,
} from "../stores/community.store.js";

export function CommunitiesList() {
  const isLoading = useIsLoading();
  const isError = useIsError();
  const communitiesFiltered = useCommunitiesFiltered();
  const allTags = useTags();
  const allAudience = useAudience();

  const tagsMap = useMemo(
    () => Object.fromEntries(allTags.map((t) => [t.id, t.label])),
    [allTags]
  );

  const audienceMap = useMemo(
    () => Object.fromEntries(allAudience.map((a) => [a.id, a.label])),
    [allAudience]
  );

  if (isLoading) return <p>Cargando datos...</p>;
  if (isError) return <p>Error: {isError}</p>;

  return (
    <div className="communitieslist-container">
      <div className="communitieslist">
        {communitiesFiltered.map((community) => (
          <CommunityCard key={community.id} community={community} tagsMap={tagsMap} audienceMap={audienceMap} />
        ))}
      </div>
      <AddCommunityCTA />
    </div>
  );
}
