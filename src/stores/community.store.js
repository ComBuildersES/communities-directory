import { create } from "zustand";
import { getAllCommunities } from "../data/API";
import { URL } from "../constants";
import { buildInverseIndex } from "../data/invertedindex";

// El indice inverso solo se realiza cuando se carga la pagina
const initialState = {
  allCommunities: [], // Estado Inicial, Datos originales
  invertedIndex: {}, // Indice inverso de los datos
  isLoading: false, // Estado para mostrar carga
  error: null, // Estado para manejar errores
};

const useCommunitiesStoreOLD = create((set, get) => {
  return {
    allCommunities: [], // Estado Inicial, Datos originales
    invertedIndex: {},
    isLoading: false, // Estado de carga
    error: null, // Error si ocurre algo
    hasFetched: false, // Controla si los datos ya se cargaron

    // Actions
    getCommunities: async () => {
      const { hasFetched } = get();
      if (hasFetched) {
        console.log("Datos ya cargados, evitando recarga.");
        return;
      } // Evita cargar más de una vez

      console.log("Cargando datos por primera vez...");
      set({ isLoading: true, error: null });

      try {
        const data = await getAllCommunities(URL);
        console.log("Datos cargados exitosamente:", data);

        const inverseIndex = buildInverseIndex(data);
        console.log("Índice invertido construido.");
        set({
          allCommunities: data,
          invertedIndex: inverseIndex,
          isLoading: false,
          hasFetched: true, // Marca como cargado
        });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },
  };
});

// Define el store Zustand
export const useCommStore = create((set) => ({
  ...initialState,
  fetchData: async () => {
    set({ isLoading: true, error: null }); // Indica que está cargando
    try {
      const data = await getAllCommunities(URL);
      set({ allCommunities: data, isLoading: false }); // Guarda los datos en el estado
    } catch (error) {
      set({ error: error.message, isLoading: false }); // Maneja el error
    }
  },
}));
