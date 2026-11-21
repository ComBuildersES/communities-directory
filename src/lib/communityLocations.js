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
