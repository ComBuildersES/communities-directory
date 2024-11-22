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
