import { filteredMockData } from "../data/filteredMockData.js";
import { CommunityCard } from "./CommunityCard.jsx";

import {
  useAllCommunities,
  useIsLoading,
  useIsError,
  useCommunityActions,
} from "../stores/community.store.js";

import { useEffect } from "react";

export const filtros = {
  Estado: ["Activa"],
  Tipo_de_comunidad: [],
  "Localización habitual": ["Albacete", "Alicante"],
  Tipo_de_eventos: ["Híbridos", "Presencial"],
};

export function CommunitiesList() {
  const allComunities = useAllCommunities();
  const isLoading = useIsLoading();
  const isError = useIsError();
  const { fetchCommunities } = useCommunityActions();

  useEffect(() => {
    fetchCommunities(URL);
  }, [fetchCommunities]);

  if (isLoading) return <p>Cargando datos...</p>;
  if (isError) return <p>Error: {isError}</p>;

  console.log("allComunities", allComunities);
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
