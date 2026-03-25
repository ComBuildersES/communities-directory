import { useMemo } from "react";
import { CommunityCard } from "./CommunityCard.jsx";
import { AddCommunityCTA } from "./AddCommunityCTA/AddCommunityCTA.jsx";

import {
  useIsLoading,
  useIsError,
  useCommunitiesFiltered,
  useCBMemberIds,
} from "../stores/community.store.js";

export function CommunitiesList({ onOpenCommunity }) {
  const isLoading = useIsLoading();
  const isError = useIsError();
  const communitiesFiltered = useCommunitiesFiltered();
  const cbMemberIds = useCBMemberIds();

  const sortedCommunities = useMemo(
    () => [...communitiesFiltered].sort((a, b) => {
      const aHasCB = cbMemberIds.has(a.id) ? 0 : 1;
      const bHasCB = cbMemberIds.has(b.id) ? 0 : 1;
      if (aHasCB !== bHasCB) return aHasCB - bHasCB;
      const aValidated = a.humanValidated ? 0 : 1;
      const bValidated = b.humanValidated ? 0 : 1;
      return aValidated - bValidated;
    }),
    [communitiesFiltered, cbMemberIds]
  );

  if (isLoading) return <p>Cargando datos...</p>;
  if (isError) return <p>Error: {isError}</p>;

  return (
    <div className="communitieslist-container">
      <div className="communitieslist">
        {sortedCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} hasCBMember={cbMemberIds.has(community.id)} onOpen={onOpenCommunity} />
        ))}
      </div>
      <AddCommunityCTA />
    </div>
  );
}
