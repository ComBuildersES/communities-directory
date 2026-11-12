/**
 * Filtro por persona de Community Builders (`cbMembers`).
 *
 * La relación persona ↔ comunidad vive fuera de la ficha, en
 * `public/data/community-builders-members.json`: una comunidad no "pertenece" a nadie, lo que
 * hay es gente del programa que se hace cargo de mantenerla. Por eso el campo se **deriva al
 * cargar los datos** y se mete en el registro (`community.cbMembers`), no en el fichero fuente:
 * así el índice invertido lo indexa como cualquier otro array y el filtro no necesita lógica
 * propia en `searchFaceted`.
 *
 * El disparador en la barra de búsqueda es `@`, la misma convención que una mención: sin él
 * habría que teclear el handle completo y nadie se sabe el de los demás.
 */

export const MEMBER_QUERY_PREFIX = "@";

/** Normaliza un handle de GitHub: son insensibles a mayúsculas. */
export function normalizeHandle(handle) {
  return handle?.toString().trim().toLowerCase() ?? "";
}

/**
 * Decide si lo que se está escribiendo es una mención.
 *
 * Con `@` solo ya se listan todas las personas: quien no conoce ningún handle tiene que poder
 * ver la lista antes de teclear nada.
 */
export function parseMemberQuery(query) {
  const raw = query ?? "";
  if (!raw.startsWith(MEMBER_QUERY_PREFIX)) {
    return { isMemberQuery: false, term: "" };
  }

  return { isMemberQuery: true, term: normalizeHandle(raw.slice(MEMBER_QUERY_PREFIX.length)) };
}

/**
 * Deriva de la lista plana de miembros lo que necesitan el store y el desplegable.
 *
 * Solo cuenta comunidades que estén en el dataset cargado: una asignación a una ficha
 * borrada u oculta daría una persona con "3 comunidades" de las que solo se ven dos.
 */
export function buildCbMemberIndex(cbMembers = [], communities = []) {
  const knownIds = new Set(communities.map((community) => community.id));
  const cbMemberIds = new Set();
  const cbMembersMap = new Map();
  const handleCounts = new Map();
  const handleLabels = new Map();

  cbMembers.forEach(({ communityId, github }) => {
    if (!github) return;

    cbMemberIds.add(communityId);

    if (!cbMembersMap.has(communityId)) cbMembersMap.set(communityId, []);
    cbMembersMap.get(communityId).push(github);

    if (!knownIds.has(communityId)) return;

    const handle = normalizeHandle(github);
    handleCounts.set(handle, (handleCounts.get(handle) ?? 0) + 1);
    // El handle se guarda tal cual lo escribió quien lo añadió: el filtro es insensible a
    // mayúsculas, pero en pantalla se enseña como la persona lo escribe en GitHub.
    if (!handleLabels.has(handle)) handleLabels.set(handle, github.toString().trim());
  });

  const cbMemberHandles = [...handleCounts.entries()]
    .map(([handle, count]) => ({ handle, label: handleLabels.get(handle), count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.handle.localeCompare(b.handle)));

  return { cbMemberIds, cbMembersMap, cbMemberHandles };
}

/** Handles que mantienen una comunidad concreta, normalizados para el índice invertido. */
export function memberHandlesForCommunity(cbMembersMap, communityId) {
  return (cbMembersMap.get(communityId) ?? []).map(normalizeHandle);
}

/**
 * Sugerencias del desplegable: coincidencia por subcadena, no fuzzy. Un handle no es prosa
 * —no tiene sinónimos ni acentos— y una tolerancia a erratas aquí devuelve a gente que no es.
 */
export function filterMemberSuggestions(term, members = [], activeHandles = []) {
  const active = new Set(activeHandles.map(normalizeHandle));
  const needle = normalizeHandle(term);

  return members
    .filter(({ handle }) => !active.has(handle))
    .filter(({ handle }) => !needle || handle.includes(needle))
    .sort((a, b) => {
      if (!needle) return 0;
      // Quien empieza por lo tecleado va antes que quien solo lo contiene.
      const aStarts = a.handle.startsWith(needle) ? 0 : 1;
      const bStarts = b.handle.startsWith(needle) ? 0 : 1;
      return aStarts - bStarts;
    });
}

/** Avatar público de GitHub. `s` es el tamaño en px que sirve GitHub, no el del CSS. */
export function githubAvatarUrl(handle, size = 48) {
  return `https://avatars.githubusercontent.com/${encodeURIComponent(handle)}?s=${size}`;
}

export function githubProfileUrl(handle) {
  return `https://github.com/${encodeURIComponent(handle)}`;
}
