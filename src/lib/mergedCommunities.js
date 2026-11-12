/**
 * Fusiones de comunidades (varias comunidades que pasan a ser una sola).
 *
 * `status: "merged"` + `mergedIntoId` es lo que distingue "esta comunidad ya no existe por
 * separado" de "esta comunidad está parada" (`inactive`) y de "esta comunidad es una pata de
 * una organización paraguas" (`parentId`, donde las hijas siguen existiendo). Caso real:
 * Makers of Murcia, GameDev Murcia y murcia dev se fusionaron en MurciaTech.
 *
 * La relación se guarda **solo en la comunidad fusionada**. La inversa ("MurciaTech integra
 * a estas tres") se deriva con `buildMergedFromMap`: duplicarla en el fichero del destino
 * garantizaría que las dos caras acabasen desincronizadas.
 *
 * Al no ser `active`, una comunidad fusionada queda fuera del listado, la búsqueda y el mapa
 * con el filtro por defecto (`status=active`), pero su ficha sigue siendo enlazable: quien
 * llega desde un enlace viejo tiene que poder ver dónde continúa la comunidad.
 */

export const MERGED_STATUS = "merged";

export function isMergedCommunity(community) {
  return community?.status === MERGED_STATUS;
}

/**
 * Comunidad en la que continúa una fusionada, o null si no se puede resolver.
 */
export function findMergeTarget(community, communities = []) {
  if (!isMergedCommunity(community) || community.mergedIntoId == null) {
    return null;
  }

  return communities.find((entry) => entry?.id === community.mergedIntoId) ?? null;
}

/**
 * `mergedIntoId` -> comunidades que se fusionaron en ella. Es la cara que pinta la ficha del
 * destino ("integra a X, Y y Z") y se calcula una sola vez al cargar los datos.
 */
export function buildMergedFromMap(communities = []) {
  return communities.reduce((map, community) => {
    if (!isMergedCommunity(community) || community.mergedIntoId == null) {
      return map;
    }

    const current = map.get(community.mergedIntoId) ?? [];
    current.push(community);
    map.set(community.mergedIntoId, current);
    return map;
  }, new Map());
}

/**
 * Comprueba la coherencia del grafo de fusiones. Devuelve una lista de mensajes de error
 * (vacía si todo cuadra) para que la consuma `scripts/validate-community-data.js`.
 *
 * No se permiten cadenas (A fusionada en B, y B fusionada en C): quien llega a A tendría que
 * dar dos saltos para encontrar la comunidad viva, y nada garantiza que la cadena termine.
 */
export function validateMergedReferences(communities = []) {
  const errors = [];
  const byId = new Map(
    communities
      .filter((community) => community && Number.isInteger(community.id))
      .map((community) => [community.id, community])
  );

  for (const community of communities) {
    if (!community) continue;

    const label = community.name || `#${community.id ?? "sin id"}`;
    const { mergedIntoId } = community;

    if (!isMergedCommunity(community)) {
      if (mergedIntoId != null) {
        errors.push(
          `${label}: mergedIntoId solo tiene sentido con status "${MERGED_STATUS}" (status actual: "${community.status}").`
        );
      }
      continue;
    }

    if (mergedIntoId == null) {
      errors.push(`${label}: status "${MERGED_STATUS}" exige mergedIntoId con la comunidad en la que continúa.`);
      continue;
    }

    if (!Number.isInteger(mergedIntoId)) {
      errors.push(`${label}: mergedIntoId debe ser un entero.`);
      continue;
    }

    if (mergedIntoId === community.id) {
      errors.push(`${label}: mergedIntoId no puede apuntar a la propia comunidad.`);
      continue;
    }

    const target = byId.get(mergedIntoId);

    if (!target) {
      errors.push(`${label}: mergedIntoId ${mergedIntoId} no corresponde a ninguna comunidad del directorio.`);
      continue;
    }

    if (isMergedCommunity(target)) {
      errors.push(
        `${label}: mergedIntoId apunta a "${target.name}", que también está fusionada. No se admiten cadenas de fusiones: apunta a la comunidad viva.`
      );
    }
  }

  return errors;
}
