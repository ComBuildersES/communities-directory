import { matchesCommunityName } from "../lib/fuzzyMatch.js";

export const facetedSearch = (data, indexInverso, filtros) => {
  const filtroskeys = Object.keys(filtros).filter(
    (key) => filtros[key].length > 0
  );

  if (filtroskeys.length === 0) return data;

  // console.log("filtroskeys", filtroskeys);

  let IDsFiltrados = null;

  for (const key of filtroskeys) {
    const conjuntoIdsporkey = filtros[key]
      .map((value) => {
        const normalizedValue = value.toString().toLowerCase();
        const ids = indexInverso[key]?.[normalizedValue] || [];
        // console.log(`Filtro: ${key}, Valor: ${value}, IDs encontrados:`, ids);
        return Array.from(ids);
      })
      .filter((ids) => ids.length > 0); // Filtramos listas vacias

    // console.log(`conjuntoIdsporKey ${key}: `, conjuntoIdsporkey);

    // combinamos los resultados por key ya que pueden ser multiples opciones
    const combinedIds = conjuntoIdsporkey.flat();

    // console.log(`Combined IDs para filtro "${key}":`, combinedIds);

    if (IDsFiltrados === null) {
      // Primera iteración: inicializar con los IDs combinados
      IDsFiltrados = combinedIds;
    } else {
      // const beforeIntersection = [...IDsFiltrados];
      IDsFiltrados = IDsFiltrados.filter((id) => combinedIds.includes(id)); // Intersección manual
      //console.log(`Intersección para filtro "${key}":`);
      // console.log(`  Antes:`, beforeIntersection);
      //console.log(`  Después:`, IDsFiltrados);
    }
  }
  if (!IDsFiltrados || IDsFiltrados.length === 0) {
    console.warn("No se encontraron IDs comunes para los filtros aplicados.");
    return [];
  }

  return data.filter((comunity) => IDsFiltrados.includes(comunity.id));
};

export const searchFaceted = (data, inverseIndex, filters) => {
  const nameQueries = filters.nameQuery ?? [];
  // Filtrar registros antes de cruzar IDs evita confundir propuestas aún sin ID.
  const matchingData = nameQueries.length > 0
    ? data.filter((community) => nameQueries.some((query) => matchesCommunityName(query, community.name)))
    : data;
  const filterKeys = Object.keys(filters).filter(
    (key) => key !== "nameQuery" && key !== "tagMatch" && key !== "audienceMatch" && filters[key].length > 0
  );

  if (filterKeys.length === 0) return matchingData;

  const matchAllTagsIds = new Set(
    data.filter((c) => c.matchesAllTags).map((c) => c.id)
  );
  const matchAllAudienceIds = new Set(
    data.filter((c) => c.matchesAllAudience).map((c) => c.id)
  );

  let filteredIDs = null;

  filterKeys.forEach((key) => {
    const setIDsBykey = filters[key]
      .map((value) => {
        const normalizedValue = value.toString().trim().toLowerCase();
        const ids = inverseIndex[key]?.[normalizedValue] || new Set();
        /* console.log(`Filtro: ${key}, Valor: ${value}, IDs encontrados:`, [
          ...ids,
        ]); */
        return ids;
      });

    // En «Todas», un valor sin registros también debe vaciar la intersección.
    const matchEveryValue = (key === 'tags' && filters.tagMatch?.includes('all'))
      || (key === 'targetAudience' && filters.audienceMatch?.includes('all'));
    const combinedIds = matchEveryValue
      ? new Set([...setIDsBykey[0]].filter(id => setIDsBykey.every(ids => ids.has(id))))
      : new Set(setIDsBykey.flatMap((set) => [...set]));

    // Communities with matchesAllTags/matchesAllAudience bypass that dimension's filter but still respect all other filters
    if (key === 'tags') {
      matchAllTagsIds.forEach((id) => combinedIds.add(id));
    }
    if (key === 'targetAudience') {
      matchAllAudienceIds.forEach((id) => combinedIds.add(id));
    }

    // console.log(`Combined IDs para filtro "${key}":`, [...combinedIds]);

    if (filteredIDs === null) {
      // Primera iteración: inicializar con los IDs combinados
      filteredIDs = combinedIds;
    } else {
      // const beforeIntersection = new Set([...filteredIDs]);
      filteredIDs = new Set(
        [...filteredIDs].filter((id) => combinedIds.has(id))
      ); // Intersección
      /* console.log(`Intersección para filtro "${key}":`);
      console.log(`  Antes:`, [...beforeIntersection]);
      console.log(`  Después:`, [...filteredIDs]); */
    }
  });
  if (!filteredIDs || filteredIDs.size === 0) {
    console.warn("No se encontraron IDs comunes para los filtros aplicados.");
    return [];
  }

  return matchingData.filter((comunity) => filteredIDs.has(comunity.id));
};
