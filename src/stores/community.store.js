import { create } from "zustand";
import { getAllCommunities } from "../data/API";
import { URL } from "../constants";
import { buildInverseIndex } from "../data/invertedindex";
import { devtools } from "zustand/middleware";

export const filtros = {
  Estado: ["Activa"],
  Tipo_de_comunidad: [],
  "Localización habitual": ["Albacete", "Alicante"],
  Tipo_de_eventos: ["Híbridos", "Presencial"],
};

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
  devtools((set, get) => ({
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
      filterComunities: (key, value) => {
        const { allCommunities, filters } = get();
        // Anyadir filtros a los actuales
        console.log(updateFilter(filtros, key, value));
      },
    },
  }))
);

const updateFilter = (filters, key, value) => {
  // Si el valor es un array vacío, eliminamos la key del objeto
  if (Array.isArray(value) && value.length === 0) {
    // eslint-disable-next-line no-unused-vars
    const { [key]: _, ...updatedFilters } = filters;
    return updatedFilters;
  }

  // Asegurar que value siempre sea un array
  const valueArray = Array.isArray(value) ? value : [value];

  // Combinar valores existentes con el nuevo valor

  const existingValue = filters[key];
  const combinedValues = Array.isArray(existingValue)
    ? [...existingValue, valueArray]
    : [...(existingValue ? [existingValue] : []), ...valueArray];

  return {
    ...filters,
    [key]: combinedValues,
  };
};

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
