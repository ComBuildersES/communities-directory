import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CommunityCard } from "./CommunityCard.jsx";
import { AddCommunityCTAPanel } from "./AddCommunityCTA/AddCommunityCTA.jsx";
import { resolveCtaPanelPlacement } from "../lib/addCommunityCTA.js";
import { EmptyResults } from "./EmptyResults.jsx";

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
  const gridRef = useRef(null);
  const [gridColumns, setGridColumns] = useState(1);

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

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measureColumns = () => {
      const tracks = getComputedStyle(grid).gridTemplateColumns;
      setGridColumns(Math.max(1, tracks.split(/\s+/).filter(Boolean).length));
    };
    measureColumns();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measureColumns) : null;
    observer?.observe(grid);
    window.addEventListener("resize", measureColumns);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measureColumns);
    };
  }, [isLoading, isError, sortedCommunities.length]);

  if (isLoading) {
    return (
      <div className="communitieslist-container">
        <div className="communitieslist" aria-busy="true" aria-label="Cargando comunidades…">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton-card" aria-hidden="true" />
          ))}
        </div>
      </div>
    );
  }
  if (isError) return <p>Error: {isError}</p>;

  if (sortedCommunities.length === 0) {
    return (
      <div className="communitieslist-container">
        <EmptyResults />
        <AddCommunityCTAPanel />
      </div>
    );
  }

  const placement = resolveCtaPanelPlacement({ resultCount: sortedCommunities.length, columnCount: gridColumns });
  return (
    <div className="communitieslist-container">
      <div className="communitieslist" ref={gridRef}>
        {sortedCommunities.map((community, index) => (
          <Fragment key={community.id}>
            <CommunityCard
              community={community}
              hasCBMember={cbMemberIds.has(community.id)}
              onOpen={onOpenCommunity}
            />
            {placement.afterIndex === index + 1 && <AddCommunityCTAPanel />}
          </Fragment>
        ))}
      </div>
      {placement.atEnd && <AddCommunityCTAPanel />}
    </div>
  );
}
