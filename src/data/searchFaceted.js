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
    // Mapeamos los valores de filtro y obtenemos conjuntos de IDs desde el índice inverso
    const conjuntoIds = filtros[key]
      .map((value) => indexInverso[key]?.[value])
      .filter(Boolean); // Eliminamos los valores null o undefinet

    // Combinamos los conjuntos en un solo conjunto plano
    const combinedIds = new Set(conjuntoIds.flatMap((set) => [...set]));
    console.log("acc", acc);

    if (acc === null) {
      // Si es la primera iteración, inicializamos con el conjunto actual
      return combinedIds;
    }

    // En la siguiente iteracion vamos acumulando los ids de cada filtro.
    // Como no queremos repetir volvemos a generar un  nuevo Set
    // Intersección de conjuntos: mantenemos solo los IDs que están en ambos conjuntos
    return new Set([...acc].filter((id) => combinedIds.has(id)));
  }, null);
  console.log("Ids filtrados", IDsFiltrados);
  // Si no hay IDs filtrados, devolvemos un array vacío
  if (!IDsFiltrados) return [];

  // Filtramos los datos originales según los IDs filtrados
  return data.filter((comunity) => IDsFiltrados.has(comunity.ID));
};
