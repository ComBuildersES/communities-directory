/**
 * Sedes de una comunidad (`locations`, issue #45).
 *
 * Una comunidad puede tener actividad presencial fija en varias ciudades compartiendo
 * nombre, canales y equipo. `locations` es la lista de esas sedes, en orden: la primera es la
 * principal. `[]` significa "sin ubicación física registrada" — paraguas, online o dato que
 * falta, y lo que lo distingue es `communityType` y `eventFormat`, no un campo más.
 *
 * Todo el código que lee ubicaciones pasa por aquí. Antes había cinco listas distintas de
 * "esto no es una ubicación" repartidas por el código, y cada una ocultaba cosas distintas.
 */
import { inferProvinceIdFromText } from "./provinceNormalization.js";

/**
 * Marcadores de "no se ha rellenado". Lista **cerrada** a propósito: es la que autoriza a
 * descartar una sede al procesar una propuesta. Una lista amplia borraría "NA" (Navarra).
 */
export const LOCATION_PLACEHOLDERS = new Set(["", "n/a", "n.a.", "n.a", "sin completar", "sin localidad"]);

/**
 * Valores que *parecen* marcadores pero no están en la lista cerrada. No se borran nunca: se
 * ocultan al pintar (enseñar "Java User Groups · ?" parece un dato) y el validador avisa.
 */
export const LOCATION_PLACEHOLDER_HINTS = new Set([
  "na",
  "-",
  "--",
  "—",
  "?",
  "unknown",
  "desconocido",
  "desconocida",
]);

const NULL_LAT_LON = Object.freeze({ lat: null, lon: null });

/**
 * "Itinerante" es un dato (la conferencia cambia de ciudad cada edición), no un hueco: se
 * enseña. Pero no es un sitio: no se geocodifica ni pone a la comunidad en el mapa. Nominatim
 * lo resolvía a un pueblo de Perú.
 */
const ITINERANT_NAMES = new Set(["itinerante", "itinerant"]);

export function isItinerantLocation(name) {
  return ITINERANT_NAMES.has(normalizeLocationKey(name));
}

/** ¿Nombra esta sede un sitio que se pueda poner en el mapa? */
export function isMappableLocationName(name) {
  const value = typeof name === "string" ? name.trim() : "";
  return Boolean(value) && !looksLikeLocationPlaceholder(value) && !isItinerantLocation(value);
}

function cleanName(name) {
  return typeof name === "string" ? name.trim() : "";
}

/** `true` si el nombre es un marcador de la lista cerrada (se puede descartar). */
export function isLocationPlaceholder(name) {
  return LOCATION_PLACEHOLDERS.has(cleanName(name).toLowerCase());
}

/** `true` si el nombre no dice ningún sitio: lista cerrada o pistas. Sólo para pintar y avisar. */
export function looksLikeLocationPlaceholder(name) {
  const value = cleanName(name).toLowerCase();
  return LOCATION_PLACEHOLDERS.has(value) || LOCATION_PLACEHOLDER_HINTS.has(value);
}

/** Clave para comparar dos nombres de sede: sin mayúsculas, acentos ni espacios de más. */
export function normalizeLocationKey(name) {
  return cleanName(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function hasCoordinates(latLon) {
  return Boolean(latLon)
    && typeof latLon.lat === "number"
    && typeof latLon.lon === "number"
    && Number.isFinite(latLon.lat)
    && Number.isFinite(latLon.lon);
}

/** Las sedes tal como están guardadas. Nunca devuelve otra cosa que un array. */
export function getLocations(community) {
  return Array.isArray(community?.locations) ? community.locations : [];
}

/** Sedes que se pueden enseñar: con nombre y que no son un marcador. Nombres sin espacios. */
export function getDisplayLocations(community) {
  return getLocations(community)
    .filter((location) => cleanName(location?.name) && !looksLikeLocationPlaceholder(location?.name))
    .map((location) => ({ ...location, name: cleanName(location.name) }));
}

/** Nombres que se pueden enseñar, en orden. */
export function getDisplayLocationNames(community) {
  return getDisplayLocations(community).map((location) => location.name);
}

/** La sede principal (la primera), o `null` si no hay ninguna. */
export function getPrimaryLocation(community) {
  return getLocations(community)[0] ?? null;
}

/** Sedes con coordenadas: las que llevan pin. */
export function getMappableLocations(community) {
  return getLocations(community).filter((location) => hasCoordinates(location?.latLon));
}

/**
 * Quita las sedes cuyo nombre es un marcador de la lista cerrada. Las demás se devuelven
 * tal cual: limpiar un nombre (trim, mayúsculas) no es cosa de esta función.
 */
export function dropPlaceholderLocations(locations) {
  if (!Array.isArray(locations)) return [];
  return locations.filter((location) => !isLocationPlaceholder(location?.name));
}

/**
 * Normaliza una lista de sedes que llega de fuera (formulario, issue, IA): descarta lo que no
 * es una sede, recorta nombres, deduplica por nombre y deja `latLon` siempre con sus dos
 * miembros. No geocodifica.
 */
export function normalizeLocations(locations) {
  if (!Array.isArray(locations)) return [];

  const seen = new Set();
  const result = [];

  for (const entry of locations) {
    const raw = typeof entry === "string" ? { name: entry } : entry;
    if (!raw || typeof raw !== "object") continue;

    const name = cleanName(raw.name);
    if (!name || isLocationPlaceholder(name)) continue;

    const key = normalizeLocationKey(name);
    if (seen.has(key)) continue;
    seen.add(key);

    const latLon = hasCoordinates(raw.latLon)
      ? { lat: raw.latLon.lat, lon: raw.latLon.lon }
      : { ...NULL_LAT_LON };

    result.push({ name, latLon });
  }

  return result;
}

/** Nombres de las sedes unidos por un separador (CSV, `llms-full.txt`). Una sola función. */
export function formatLocationNames(community, separator = " | ") {
  return getDisplayLocationNames(community).join(separator);
}

/**
 * Por qué una comunidad no tiene sede que enseñar, para que la ficha lo diga en vez de callar.
 * Devuelve `null` si sí tiene alguna.
 */
export function resolveMissingLocationReason(community) {
  if (getDisplayLocations(community).length > 0) return null;
  if (community?.communityType === "umbrella-org") return "umbrella";
  if (community?.eventFormat === "online") return "online";
  return "pending";
}

/**
 * Provincias de las sedes, en el orden de las sedes y sin repetir. Se infiere **por sede**:
 * sobre un texto unido, `inferProvinceIdFromText` devuelve el primer alias de su tabla, no el
 * primero del texto ("Madrid, Barcelona" daba `barcelona`).
 */
export function inferProvinceIdsFromLocations(locations, infer = inferProvinceIdFromText) {
  const ids = [];
  for (const location of Array.isArray(locations) ? locations : []) {
    const name = cleanName(location?.name);
    if (!name || looksLikeLocationPlaceholder(name)) continue;
    const id = infer(name);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * Provincias distintas que nombra **una** sede al trocearla por separadores. Más de una es
 * señal de que alguien metió varias ciudades en una sola entrada ("Madrid, Barcelona"), que
 * debería ser una sede por ciudad. "Vigo, Galicia" da una sola: no avisa.
 */
export function provincesInLocationName(name, infer = inferProvinceIdFromText) {
  const pieces = cleanName(name)
    .split(/\s*(?:,|\/|\sy\s)\s*/i)
    .map((piece) => piece.trim())
    .filter(Boolean);
  const ids = new Set();
  for (const piece of pieces) {
    const id = infer(piece);
    if (id) ids.add(id);
  }
  return [...ids];
}

/**
 * Un elemento por sede con coordenadas: lo que el mapa convierte en pins. Una comunidad con
 * sedes en Barcelona y Madrid da dos.
 */
export function buildMapLocations(communities) {
  return (Array.isArray(communities) ? communities : []).flatMap((community) =>
    getMappableLocations(community).map((location) => ({ community, location }))
  );
}

/**
 * Quita repetidas por `id` conservando el orden de la primera aparición. Todo lo que va del
 * mapa a la lista pasa por aquí: dos sedes en pantalla no son dos comunidades, y React no
 * admite dos tarjetas con la misma `key`.
 */
export function uniqueCommunitiesById(communities) {
  const seen = new Set();
  return (Array.isArray(communities) ? communities : []).filter((community) => {
    const key = community?.id ?? community;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/*
 * Filas del formulario. Cada sede del borrador lleva un `_rowId` estable: sin él, quitar una
 * fila no sabe a cuál se refiere (es lo que pasó con los canales, donde quitar uno borraba
 * todos). `_rowId` y `provinceId` sólo viven en el borrador; `fromLocationRows` los quita.
 */
let locationRowSeq = 0;

export function makeLocationRow(location = {}) {
  locationRowSeq += 1;
  return {
    _rowId: `location-row-${locationRowSeq}`,
    name: typeof location?.name === "string" ? location.name : "",
    latLon: {
      lat: typeof location?.latLon?.lat === "number" ? location.latLon.lat : null,
      lon: typeof location?.latLon?.lon === "number" ? location.latLon.lon : null,
    },
    provinceId: typeof location?.provinceId === "string" ? location.provinceId : "",
  };
}

/**
 * Siembra las filas del borrador desde las sedes de una ficha (o de un borrador guardado).
 * Siempre devuelve al menos una fila: el campo es obligatorio y sin fila no hay dónde
 * escribir. La fila vacía no llega al payload (`fromLocationRows` la descarta).
 */
export function toLocationRows(locations) {
  const rows = (Array.isArray(locations) ? locations : [])
    .filter((location) => location && typeof location === "object")
    // Siempre un `_rowId` nuevo, aunque la fila venga de un borrador guardado: el contador
    // vuelve a 0 en cada carga, y reutilizar el guardado chocaba con las filas nuevas
    // (escribir en una editaba las dos, quitar una quitaba las dos).
    .map((location) => makeLocationRow(location));
  return rows.length > 0 ? rows : [makeLocationRow()];
}

/** Sedes que se guardan, a partir de las filas: sin filas vacías, marcadores ni repetidas. */
export function fromLocationRows(rows) {
  return normalizeLocations(rows);
}

/**
 * Provincias de las filas, en orden y sin repetir: lo que el payload manda como
 * `provinceIds` para asignar responsables. Una fila sin provincia inferida no aporta nada;
 * el procesado del issue la vuelve a inferir por el nombre.
 */
export function provinceIdsFromLocationRows(rows) {
  const ids = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const name = cleanName(row?.name);
    if (!name || isLocationPlaceholder(name)) continue;
    const id = typeof row?.provinceId === "string" ? row.provinceId.trim() : "";
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}
