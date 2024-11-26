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

  return data.filter((comunity) => IDsFiltrados.includes(comunity.ID));
};

export const searchFaceted = (data, inverseIndex, filters) => {
  const filterKeys = Object.keys(filters).filter(
    (key) => filters[key].length > 0
  );

  if (filterKeys.length === 0) return data;

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
      })
      .filter((ids) => ids.size > 0); // Filtrar los conjuntos vacios

    const combinedIds = new Set(setIDsBykey.flatMap((set) => [...set])); // Combinar conjuntos en un único Set
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

  return data.filter((comunity) => filteredIDs.has(comunity.ID));
};
