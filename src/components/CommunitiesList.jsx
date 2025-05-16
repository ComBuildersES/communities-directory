// import { useMemo } from "react";

// import { CommunityCard } from "./CommunityCard.jsx";

// import {
//   useIsLoading,
//   useIsError,
//   useCommunityActions,
//   useCommunitiesFiltered,
// } from "../stores/community.store.js";

// export function CommunitiesList() {
//   const isLoading = useIsLoading();
//   const isError = useIsError();
//   const communitiesFiltered = useCommunitiesFiltered();
//   const { fetchCommunities } = useCommunityActions();

//   useMemo(() => {
//     fetchCommunities(URL);
//   }, [fetchCommunities]);

//   if (isLoading) return <p>Cargando datos...</p>;
//   if (isError) return <p>Error: {isError}</p>;

//   return (
//     <>
//       <div className="communitieslist ">
//         {communitiesFiltered.map((community) => (
//           <CommunityCard key={community.id} community={community} />
//         ))}
//       </div>
//     </>
//   );
// }


import { CommunityCard } from "./CommunityCard.jsx";

import {
  useIsLoading,
  useIsError,
  useCommunitiesFiltered,
} from "../stores/community.store.js";

export function CommunitiesList () {
  const isLoading = useIsLoading();
  const isError = useIsError();
  const communitiesFiltered = useCommunitiesFiltered();

  if (isLoading) return <p>Cargando datos...</p>;
  if (isError) return <p>Error: {isError}</p>;

  return (
    <div className="communitieslist">
      {communitiesFiltered.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  );
}
