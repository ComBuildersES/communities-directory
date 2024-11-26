import { create } from "zustand";
import { getAllCommunities } from "../data/API";
import { URL } from "../constants";
import { buildInverseIndex } from "../data/invertedindex";
import { devtools } from "zustand/middleware";

// El indice inverso solo se realiza cuando se carga la pagina
const initialState = {
  allCommunities: [], // Estado Inicial, Datos originales
  invertedIndex: {}, // Indice inverso de los datos
  communitiesFiltered: [], // Comunidades filtradas
  isLoading: false, // Estado para mostrar carga
  error: null, // Estado para manejar errores
  filters: {}, // Estado para los filtros
};

// Define el store Zustand
const useCommunityStore = create(
  devtools((set) => ({
    ...initialState,
    actions: {
      fetchCommunities: async () => {
        set({ isLoading: true, error: null }); // Indica que está cargando
        try {
          const data = await getAllCommunities(URL);
          const inverseIndex = buildInverseIndex(data);
          set({
            allCommunities: data,
            invertedIndex: inverseIndex,
            communitiesFiltered: data,
            isLoading: false,
          }); // Guarda los datos en el estado
        } catch (error) {
          set({ error: error.message, isLoading: false }); // Maneja el error
        }
      },
    },
  }))
);

// Selectores del estado

export const useAllCommunities = () =>
  useCommunityStore((state) => state.allCommunities);

export const useCommunitiesFiltered = () =>
  useCommunityStore((state) => state.communitiesFiltered);

export const useIsLoading = () => useCommunityStore((state) => state.isLoading);

export const useIsError = () => useCommunityStore((state) => state.error);

export const useInvertedIndex = () =>
  useCommunityStore((state) => state.invertedIndex);

export const useFilters = () => useCommunityStore((state) => state.filters);

// Selector de las acciones

export const useCommunityActions = () =>
  useCommunityStore((state) => state.actions);
