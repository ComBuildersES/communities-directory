import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { Heading } from "./components/Heading.jsx";
import Sidebar from "./components/SideBar.jsx";

import { URL } from "./constants.js";
import { getAllCommunities } from "./data/API.js";
import { makeInverseIndex } from "./data/invertedindex.js";
import { facetedSearch } from "./data/searchFaceted.js";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    let awaitdata = [];
    // Ejemplo de filtros
    const filtros = {
      Estado: ["Activa"],
      Tipo_de_comunidad: [],
      "Localización habitual": ["Albacete", "Alicante"],
      Tipo_de_eventos: ["Híbridos", "Presencial"],
    };

    async function fetchData() {
      try {
        awaitdata = await getAllCommunities(URL);
        // console.log(awaitdata);
        // const invertedIndex = buildInvertedIndex(awaitdata);
        const invertedIndex = makeInverseIndex(awaitdata);
        console.log(invertedIndex);
        //const searchdata = searchFaceted(awaitdata, invertedIndex, filters);
        // console.log("searchdata", searchdata);
        console.log(facetedSearch(awaitdata, invertedIndex, filtros));
      } catch (error) {
        console.error("Error obteniendo Datos", error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <div className="main">
        <Heading />
        <CommunitiesList />
      </div>

      <Sidebar />
    </>
  );
}

export default App;
