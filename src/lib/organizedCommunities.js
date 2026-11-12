/**
 * Autoría de encuentros recurrentes (issue #475).
 *
 * Hay comunidades que son dos cosas a la vez: una asociación que hace quedadas pequeñas y
 * habla por Telegram, y **además** una conferencia anual con su propia marca (GeeksCAT y la
 * GeeksCAT Conf; GDG Málaga y el Biznaga Fest). Hasta ahora había que elegir una de las dos,
 * y la que no entraba desaparecía del directorio.
 *
 * `organizedBy` son las comunidades del directorio que organizan esta. No es `parentId`
 * (pertenencia a un paraguas: GDG Spain y sus GDG locales) ni `mergedIntoId` (sucesión: la
 * comunidad dejó de existir por separado). Aquí las dos caras están vivas y la relación es
 * de autoría, así que:
 *
 * - **Es opcional**, y eso evita tener que decidir qué va antes, el huevo o la gallina:
 *   CommitConf existe sin un grupo que mantenga un canal activo, así que se queda sin
 *   `organizedBy` y no pasa nada.
 * - **Es plural**: hay conferencias y hackathones co-organizados por varias comunidades.
 * - **Solo enumera comunidades del directorio.** Un evento tiene muchos más organizadores
 *   reales (empresas, patrocinadores, apoyo institucional) que aquí no se listan, y la ficha
 *   tiene que decirlo: si no, una lista con una sola comunidad se lee como "lo hace solo
 *   esta gente".
 * - **Se guarda solo en la ficha organizada.** La cara inversa ("GDG Málaga organiza Biznaga
 *   Fest") la deriva `buildOrganizedByMap`, igual que con las fusiones: duplicar la relación
 *   en los dos ficheros garantiza que acaben desincronizados.
 *
 * Los dos lados tienen ciclo de vida propio (una asociación dormida que sigue sacando su
 * conferencia, o al revés), así que el vínculo se pinta siempre, indicando el estado del otro
 * lado. Quien llega por un enlace tiene que poder seguir hasta la otra cara.
 */

export function normalizeOrganizedBy(value, { selfId = null } = {}) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();

  return value.reduce((list, entry) => {
    const id = typeof entry === "number" ? entry : Number.parseInt(String(entry ?? ""), 10);
    if (!Number.isInteger(id)) return list;
    if (selfId != null && id === selfId) return list;
    if (seen.has(id)) return list;

    seen.add(id);
    list.push(id);
    return list;
  }, []);
}

export function hasOrganizers(community) {
  return normalizeOrganizedBy(community?.organizedBy).length > 0;
}

/**
 * Comunidades que organizan esta, en el orden en que las declara la ficha. Las que no se
 * pueden resolver se descartan: la validación ya las rechaza, y pintar "#42" no ayuda a nadie.
 */
export function findOrganizers(community, communities = []) {
  const ids = normalizeOrganizedBy(community?.organizedBy, { selfId: community?.id ?? null });
  if (ids.length === 0) return [];

  const byId = new Map(
    communities
      .filter((entry) => entry && Number.isInteger(entry.id))
      .map((entry) => [entry.id, entry])
  );

  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/**
 * `id de la organizadora` -> comunidades que organiza. Es la cara que pinta la ficha de la
 * comunidad organizadora ("organiza Biznaga Fest") y se calcula una sola vez al cargar los
 * datos.
 */
export function buildOrganizedByMap(communities = []) {
  return communities.reduce((map, community) => {
    for (const organizerId of normalizeOrganizedBy(community?.organizedBy, {
      selfId: community?.id ?? null,
    })) {
      const current = map.get(organizerId) ?? [];
      current.push(community);
      map.set(organizerId, current);
    }

    return map;
  }, new Map());
}

/**
 * Comprueba la coherencia del grafo de autoría. Devuelve una lista de mensajes de error
 * (vacía si todo cuadra) para que la consuma `scripts/validate-community-data.js`.
 *
 * Se admiten cadenas (GDG Spain es paraguas de GDG Málaga, que organiza el Biznaga Fest):
 * son dos relaciones distintas y cada salto lleva a una ficha viva. Lo que no se admite es
 * que dos fichas se declaren organizadoras la una de la otra: ahí ninguna de las dos es la
 * autora y el vínculo deja de significar nada.
 */
export function validateOrganizedByReferences(communities = []) {
  const errors = [];
  const byId = new Map(
    communities
      .filter((community) => community && Number.isInteger(community.id))
      .map((community) => [community.id, community])
  );
  const declared = new Map();

  for (const community of communities) {
    if (!community || !("organizedBy" in community)) continue;

    const label = community.name || `#${community.id ?? "sin id"}`;

    if (!Array.isArray(community.organizedBy)) {
      errors.push(`${label}: organizedBy debe ser un array de ids de comunidades.`);
      continue;
    }

    const seen = new Set();

    for (const entry of community.organizedBy) {
      if (!Number.isInteger(entry)) {
        errors.push(`${label}: organizedBy solo admite ids enteros (encontrado: ${JSON.stringify(entry)}).`);
        continue;
      }

      if (entry === community.id) {
        errors.push(`${label}: organizedBy no puede apuntar a la propia comunidad.`);
        continue;
      }

      if (seen.has(entry)) {
        errors.push(`${label}: organizedBy repite el id ${entry}.`);
        continue;
      }

      seen.add(entry);

      if (!byId.has(entry)) {
        errors.push(
          `${label}: organizedBy ${entry} no corresponde a ninguna comunidad del directorio. Solo se enumeran comunidades listadas aquí: empresas y patrocinadores no se vinculan.`
        );
      }
    }

    if (community.id != null) {
      declared.set(community.id, seen);
    }
  }

  for (const [id, organizerIds] of declared.entries()) {
    for (const organizerId of organizerIds) {
      if (declared.get(organizerId)?.has(id)) {
        const label = byId.get(id)?.name ?? `#${id}`;
        const other = byId.get(organizerId)?.name ?? `#${organizerId}`;

        // Solo una vez por pareja, en el orden de los ids.
        if (id < organizerId) {
          errors.push(
            `${label} y ${other} se declaran organizadoras la una de la otra. La autoría va en un solo sentido: deja el vínculo en la ficha del encuentro.`
          );
        }
      }
    }
  }

  return errors;
}
