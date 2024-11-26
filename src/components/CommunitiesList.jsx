import { filteredMockData } from "../data/filteredMockData.js";
import { CommunityCard } from "./CommunityCard.jsx";

import {
  useAllCommunities,
  useIsLoading,
  useIsError,
  useCommunityActions,
  useCommunitiesFiltered,
} from "../stores/community.store.js";

import { useMemo } from "react";

export const filtros = {
  Estado: ["Activa"],
  Tipo_de_comunidad: [],
  "Localización habitual": ["Albacete", "Alicante"],
  Tipo_de_eventos: ["Híbridos", "Presencial"],
};

export function CommunitiesList() {
  const isLoading = useIsLoading();
  const isError = useIsError();
  const communitiesFiltered = useCommunitiesFiltered();
  const { fetchCommunities } = useCommunityActions();

  useMemo(() => {
    fetchCommunities(URL);
  }, [fetchCommunities]);

  if (isLoading) return <p>Cargando datos...</p>;
  if (isError) return <p>Error: {isError}</p>;

  console.log("communities", communitiesFiltered);
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
