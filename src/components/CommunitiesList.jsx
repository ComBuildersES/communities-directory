import { useMemo } from "react";
import { CommunityCard } from "./CommunityCard.jsx";
import { AddCommunityCTA } from "./AddCommunityCTA/AddCommunityCTA.jsx";

import {
  useIsLoading,
  useIsError,
  useCommunitiesFiltered,
  useTags,
  useAudience,
  useCBMemberIds,
  useCBMembersMap,
} from "../stores/community.store.js";

export function CommunitiesList() {
  const isLoading = useIsLoading();
  const isError = useIsError();
  const communitiesFiltered = useCommunitiesFiltered();
  const allTags = useTags();
  const allAudience = useAudience();
  const cbMemberIds = useCBMemberIds();
  const cbMembersMap = useCBMembersMap();

  const tagsMap = useMemo(
    () => Object.fromEntries(allTags.map((t) => [t.id, t.label])),
    [allTags]
  );

  const audienceMap = useMemo(
    () => Object.fromEntries(allAudience.map((a) => [a.id, a.label])),
    [allAudience]
  );

  const sortedCommunities = useMemo(
    () => [...communitiesFiltered].sort((a, b) => {
      const aHasCB = cbMemberIds.has(a.id) ? 0 : 1;
      const bHasCB = cbMemberIds.has(b.id) ? 0 : 1;
      return aHasCB - bHasCB;
    }),
    [communitiesFiltered, cbMemberIds]
  );

  if (isLoading) return <p>Cargando datos...</p>;
  if (isError) return <p>Error: {isError}</p>;

  return (
    <div className="communitieslist-container">
      <div className="communitieslist">
        {sortedCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} tagsMap={tagsMap} audienceMap={audienceMap} hasCBMember={cbMemberIds.has(community.id)} cbHandles={cbMembersMap.get(community.id) || []} />
        ))}
      </div>
      <AddCommunityCTA />
    </div>
  );
}
