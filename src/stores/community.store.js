import { create } from "zustand";
import { getAllCommunities } from "../data/API";
import { bajaString, URL } from "../constants";
import { buildInverseIndex } from "../data/invertedindex";
import { devtools } from "zustand/middleware";
import { searchFaceted } from "../data/searchFaceted";

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
  numberOFCommunities: 0, // Estado para el numero de comunidades
  numberOFOnSiteCommunities: 0 // Estado para el numero de com. presenciales
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
            numberOFCommunities: data.length,
            numberOFOnSiteCommunities: data.filter(e => e.displayOnMap == true).length
          }); // Guarda los datos en el estado
        } catch (error) {
          set({ error: error.message, isLoading: false }); // Maneja el error
        }
      },
      filterComunities: (key, value) => {
        const { allCommunities, filters, invertedIndex } = get();
        // Actualizar filtros
        const newFilters = updateFilter(filters, key, value);

        const communitiesWithNewFilters = searchFaceted(
          allCommunities,
          invertedIndex,
          newFilters
        );
        set({
          communitiesFiltered: communitiesWithNewFilters,
          filters: newFilters,
          numberOFCommunities: communitiesWithNewFilters.length,
          numberOFOnSiteCommunities: communitiesWithNewFilters.filter(e => e.displayOnMap == true).length
        });
      },
    },
  }))
);

const updateFilter = (filters, key, value) => {
  // Si el valor es null

  if (value.startsWith(bajaString)) {
    const valueToremove = value.slice(bajaString.length, value.length);

    const updatevaluesbyKey = filters[key].filter(
      (item) => item !== valueToremove
    );

    if (updatevaluesbyKey.length === 0) {
      // eliminamos la key
      // eslint-disable-next-line no-unused-vars
      const { [key]: _, ...updatedFilters } = filters;
      return updatedFilters;
    } else {
      // devolvemos los filtros con el array con el valor actualizado
      // console.log({
      //   ...filters,
      //   [key]: updatevaluesbyKey,
      // });
      return {
        ...filters,
        [key]: updatevaluesbyKey,
      };
    }
  }

  // Asegurar que value siempre sea un array
  const valueArray = Array.isArray(value) ? value : [value];

  // Combinar valores existentes con el nuevo valor

  const existingValue = filters[key];
  const combinedValues = Array.isArray(existingValue)
    ? [...existingValue, value]
    : [...(existingValue ? [existingValue] : []), ...valueArray];

  // devolvemos los filtros con el array con el valor actualizado

  // console.log({
  //   ...filters,
  //   [key]: combinedValues,
  // });
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

export const useNumberOfCommunities = () =>
  useCommunityStore((state) => state.numberOFCommunities);

export const useNumberOFOnSiteCommunities = () =>
  useCommunityStore((state) => state.numberOFOnSiteCommunities);

// Selector de las acciones

export const useCommunityActions = () =>
  useCommunityStore((state) => state.actions);
