import { mockComunities } from "../data/mockdata.js";
import { buildInvertedIndex } from "../data/invertedindex.js";
import { filteredMockData } from "../data/filteredMockData.js";
import { searchFaceted } from "../data/searchFaceted.js";
import { useEffect } from "react";
import { URL } from "../constants.js";
import { CommunityCard } from "./CommunityCard.jsx";
import { getAllCommunities } from "../data/API.js";

export function CommunitiesList() {
  /* useEffect(() => {
    let awaitdata = [];
    // Ejemplo de filtros
    const filters = {
      Estado: "Inactiva",
      Tipo_de_comunidad: "Conferencia",
      "Localización habitual": "Madrid",
    };

    async function fetchData() {
      try {
        awaitdata = await getAllCommunities(URL);
        console.log(awaitdata);
        const invertedIndex = buildInvertedIndex(awaitdata);
        const searchdata = searchFaceted(awaitdata, invertedIndex, filters);
        console.log("searchdata", searchdata);
      } catch (error) {
        console.error("Error obteniendo Datos", error);
      }
    }

    const invertedIndex = buildInvertedIndex(mockComunities);

    // const searchResults = searchFaceted(data, invertedIndex, filters);
    //console.log("inverted Index", invertedIndex);
    //console.log("search Resultados", searchResults);
    fetchData();
  }, [URL]); */

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
