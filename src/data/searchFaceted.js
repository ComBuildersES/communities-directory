export const searchFaceted = (data, invertedIndex, filters) => {
  console.log(filters);

  const resultIds = Object.entries(filters).reduce((acc, [facet, value]) => {
    // Sin coincidencia en alguna faceta, retorna vacío
    if (!invertedIndex[facet] || !invertedIndex[facet][value]) return [];

    const ids = invertedIndex[facet][value];
    return acc.length ? acc.filter((id) => ids.includes(id)) : ids;
  }, []);

  // Mapear índices de comunidades a los objetos originales
  return resultIds.map((indexId) => data[indexId]);
};

export const busquedaFacetada = (data, indexInverso, filtros) => {
  const filtroskeys = Object.keys(filtros).filter(
    (key) => filtros[key].length > 0
  );

  if (filtroskeys.length === 0) return data;

  const IDsFiltrados = filtroskeys.reduce((acc, key) => {
    const conjuntoIds = filtros[key].map(
      (value) => indexInverso[key][value || new Set()]
    );

    const combinedIds = new Set(conjuntoIds.flatMap((set) => [...set]));

    // En la primera iteracion devolvemos el valor de Ids Combinados
    if (acc === null) {
      return combinedIds;
    }
    // En la siguiente iteracion vamos acumulando los ids de cada filtro.
    // Como no queremos repetir volvemos a generar un  nuevo Set
    return new Set([...acc].filter((id) => combinedIds.has(id)));
  }, null);
  console.log("el reducer: ", IDsFiltrados);

  return data.filter((comunity) => IDsFiltrados.has(comunity.ID));

  // console.log("los filtros", filtroskeys);
};
