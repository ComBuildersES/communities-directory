import { create } from "zustand";
import { getAllCommunities } from "../data/API";
import { bajaString, URL } from "../constants";
import { buildInverseIndex } from "../data/invertedindex";
import { devtools } from "zustand/middleware";
import { searchFaceted } from "../data/searchFaceted";
import { parseDirectoryFilters } from "../lib/communitySubmission";

const TAGS_URL = `${import.meta.env.BASE_URL}data/tags.json`;
const AUDIENCE_URL = `${import.meta.env.BASE_URL}data/audience.json`;

function tagsUrl(locale) {
  return locale && locale !== 'es'
    ? `${import.meta.env.BASE_URL}data/tags.${locale}.json`
    : TAGS_URL;
}
function audienceUrl(locale) {
  return locale && locale !== 'es'
    ? `${import.meta.env.BASE_URL}data/audience.${locale}.json`
    : AUDIENCE_URL;
}
const CB_MEMBERS_URL = `${import.meta.env.BASE_URL}data/community-builders-members.json`;

export const filtros = {
  Estado: ["Activa"],
  Tipo_de_comunidad: [],
  "Localización habitual": ["Albacete", "Alicante"],
  Tipo_de_eventos: ["Híbridos", "Presencial"],
};

// El indice inverso solo se realiza cuando se carga la pagina
const initialState = {
  allCommunities: [], // Estado Inicial, Datos originales
  allTags: [], // Catálogo de etiquetas temáticas
  allAudience: [], // Catálogo de perfiles de público objetivo
  invertedIndex: {}, // Indice inverso de los datos
  communitiesFiltered: [], // Comunidades filtradas
  isLoading: false, // Estado para mostrar carga
  error: null, // Estado para manejar errores
  filters: {}, // Estado para los filtros
  numberOFCommunities: 0, // Estado para el numero de comunidades
  numberOFOnSiteCommunities: 0, // Estado para el numero de com. presenciales
  cbMemberIds: new Set(), // IDs de comunidades con miembro en Community Builders
  cbMembersMap: new Map(), // communityId -> [github handles]
  hasFreshData: false, // Datos confirmados desde red cuando hay conexión
  isRefreshingFreshData: false, // Revalidación online en curso
  freshnessError: null, // Aviso cuando solo hay datos de cache
};

// Define el store Zustand
const useCommunityStore = create(
  devtools((set, get) => ({
    ...initialState,
    actions: {
      fetchCommunities: async ({ preserveData = false, locale = 'es' } = {}) => {
        const currentState = get();

        if (currentState.isLoading || currentState.isRefreshingFreshData) {
          return;
        }

        const shouldRequireFreshData = typeof navigator === "undefined" ? true : navigator.onLine;
        const loadAllResources = (requestInit) => Promise.all([
          getAllCommunities(URL, requestInit),
          getAllCommunities(tagsUrl(locale), requestInit),
          getAllCommunities(audienceUrl(locale), requestInit),
          getAllCommunities(CB_MEMBERS_URL, requestInit),
        ]);

        set((state) => ({
          isLoading: preserveData && state.allCommunities.length > 0 ? false : true,
          error: null,
          hasFreshData: shouldRequireFreshData ? false : true,
          isRefreshingFreshData: shouldRequireFreshData,
          freshnessError: null,
        }));

        try {
          let resources;
          let hasFreshData = !shouldRequireFreshData;

          if (shouldRequireFreshData) {
            try {
              resources = await loadAllResources({ cache: "no-store" });
              hasFreshData = true;
            } catch {
              resources = await loadAllResources();
            }
          } else {
            resources = await loadAllResources();
          }

          const [rawData, tags, audience, cbMembers] = resources;
          // Resolve relative thumbnailUrl values to absolute paths.
          // Components receive ready-to-use URLs; no BASE_URL handling needed per-component.
          const baseUrl = import.meta.env.BASE_URL;
          const data = rawData.map((c) => {
            const { thumbnailUrl } = c;
            if (!thumbnailUrl || thumbnailUrl.startsWith("http") || thumbnailUrl.startsWith("//") || thumbnailUrl.startsWith("/")) {
              return c;
            }
            return { ...c, thumbnailUrl: `${baseUrl}${thumbnailUrl}` };
          });
          const cbMemberIds = new Set(cbMembers.map((m) => m.communityId));
          const cbMembersMap = cbMembers.reduce((map, { communityId, github }) => {
            if (!map.has(communityId)) map.set(communityId, []);
            map.get(communityId).push(github);
            return map;
          }, new Map());
          const inverseIndex = buildInverseIndex(data);
          const defaultFilters = { status: ["active"] };
          const urlFilters = parseDirectoryFilters();
          const initialFilters = Object.keys(urlFilters).length > 0
            ? {
              ...(urlFilters.status ? {} : defaultFilters),
              ...urlFilters,
            }
            : defaultFilters;
          const communitiesFiltered = searchFaceted(data, inverseIndex, initialFilters);
          set({
            allCommunities: data,
            allTags: tags,
            allAudience: audience,
            invertedIndex: inverseIndex,
            communitiesFiltered,
            filters: initialFilters,
            cbMemberIds,
            cbMembersMap,
            hasFreshData,
            isRefreshingFreshData: false,
            freshnessError: hasFreshData
              ? null
              : "No he podido confirmar la ultima version del directorio. Mientras haya conexion, los detalles y la edicion quedan bloqueados hasta sincronizar.",
            isLoading: false,
            numberOFCommunities: communitiesFiltered.length,
            numberOFOnSiteCommunities: communitiesFiltered.filter(e => e.displayOnMap == true).length
          });
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            hasFreshData: false,
            isRefreshingFreshData: false,
          });
        }
      },
      reloadTaxonomy: async (locale) => {
        const fetchWithFallback = async (url, fallbackUrl) => {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          } catch {
            const res = await fetch(fallbackUrl);
            return res.json();
          }
        };

        const [tags, audience] = await Promise.all([
          fetchWithFallback(tagsUrl(locale), TAGS_URL),
          fetchWithFallback(audienceUrl(locale), AUDIENCE_URL),
        ]);

        set({ allTags: tags, allAudience: audience });
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

  // Combinar valores existentes con el nuevo valor, evitando duplicados
  const existingValue = filters[key];
  const existingArray = Array.isArray(existingValue)
    ? existingValue
    : existingValue ? [existingValue] : [];
  const combinedValues = [
    ...existingArray,
    ...valueArray.filter((v) => !existingArray.includes(v)),
  ];

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

export const useTags = () => useCommunityStore((state) => state.allTags);

export const useAudience = () => useCommunityStore((state) => state.allAudience);

export const useCBMemberIds = () => useCommunityStore((state) => state.cbMemberIds);

export const useCBMembersMap = () => useCommunityStore((state) => state.cbMembersMap);

export const useHasFreshData = () => useCommunityStore((state) => state.hasFreshData);

export const useIsRefreshingFreshData = () =>
  useCommunityStore((state) => state.isRefreshingFreshData);

export const useFreshnessError = () => useCommunityStore((state) => state.freshnessError);

// Selector de las acciones

export const useCommunityActions = () =>
  useCommunityStore((state) => state.actions);

export const useReloadTaxonomy = () =>
  useCommunityStore((state) => state.actions.reloadTaxonomy);
