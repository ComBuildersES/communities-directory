import { filteredMockData } from "../data/filteredMockData.js";
import { CommunityCard } from "./CommunityCard.jsx";
import { URL } from "../constants";
import { useCommStore } from "../stores/community.store.js";
import { useEffect } from "react";

export const filtros = {
  Estado: ["Activa"],
  Tipo_de_comunidad: [],
  "Localización habitual": ["Albacete", "Alicante"],
  Tipo_de_eventos: ["Híbridos", "Presencial"],
};

export function CommunitiesList() {
  const { data, loading, error, fetchData } = useCommStore();

  useEffect(() => {
    fetchData(URL);
  }, [fetchData]);

  console.log("data", data);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

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
