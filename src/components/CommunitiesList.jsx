import { filteredMockData } from "../data/filteredMockData.js";
import { CommunityCard } from "./CommunityCard.jsx";

export function CommunitiesList() {
  return (
    <>
      <div className="communitieslist ">
        {filteredMockData.map((community) => (
          <CommunityCard key={community.Comunidad} community={community} />
        ))}
      </div>
    </>
  );
}
