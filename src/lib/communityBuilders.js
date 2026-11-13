import { normalizeHandle } from "./cbMembers.js";
import { COMMUNITY_STATUS_OPTIONS } from "./communitySubmission.js";

export const JOIN_BUILDERS_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd5Idc1wG2uhHBT11veYVx6JUfrvb_ylc1WC0ZfuXykvm1rtw/viewform";
export const BUILDERS_TELEGRAM_URL = "https://t.me/hhkaos";
export const BUILDERS_EMAIL = "communitybuilders.es@gmail.com";
// Las iniciativas en curso se listan en la web de Community Builders, no aquí: enlazar
// cada proyecto por separado obliga a tocar este modal cada vez que arranca uno nuevo.
export const BUILDERS_INITIATIVES_URL = "https://communitybuilders.dev/#initiatives";

/**
 * Cada historia se cuenta con dos lados: quién pidió ayuda y quién respondió. Es lo único
 * que hay que entender de un vistazo, así que la tarjeta pinta las caras y el título, no el
 * relato: el párrafo con avatares incrustados obligaba a leer tres líneas para sacar lo
 * mismo, y las caras a media frase rompían el interlineado.
 *
 * Un lado vacío significa "el grupo", no "falta un dato": hay peticiones que no salieron de
 * una persona concreta, sino de un encuentro en el que el tema apretaba a varias (la de
 * financiación). Se pinta como una cara más, con icono de grupo.
 */
export const BUILDER_STORIES = [
  { id: "funding", askers: [], helpers: ["ilopmar", "astrojuanlu", "guldoe", "lsybarguen"], links: ["https://groups.google.com/u/1/g/community-builders-es/c/DFYoLmc3_Y8/m/A9HYR53IAQAJ", "https://github.com/orgs/ComBuildersES/discussions/139"] },
  { id: "tax", askers: ["mariomnts", "lvignali", "AbrahamOtero"], helpers: ["hhkaos"], links: ["https://groups.google.com/u/1/g/community-builders-es/c/ukbes_pufio/m/wHOVYGtrAwAJ"] },
  { id: "venue", askers: ["RicardoRB"], helpers: ["malvinito", "hhkaos"], links: [] },
  { id: "local", askers: ["oskarcalvo"], helpers: ["Qwor01"], links: [] },
  { id: "formats", askers: ["dgomezg"], helpers: ["anabuigues", "astrojuanlu"], links: ["https://groups.google.com/u/1/g/community-builders-es/c/jNGb5aNFp74/m/S-IiVQVJAgAJ"] },
  { id: "website", askers: ["ilopmar"], helpers: ["dbonillaf"], links: ["https://groups.google.com/g/community-builders-es/c/hHeTxabwNMs"] },
];

/**
 * `location` es texto libre y arrastra marcadores de "esto no se ha rellenado". Pintarlos
 * en el tooltip ("Java User Groups · n/a") es peor que no decir nada: parece un dato.
 */
const PLACEHOLDER_LOCATIONS = new Set(["n/a", "na", "n.a.", "sin completar", "-", "—", "?", "unknown", "desconocido", "desconocida"]);

export function displayLocation(location) {
  const value = location?.toString().trim() ?? "";
  return PLACEHOLDER_LOCATIONS.has(value.toLowerCase()) ? "" : value;
}

/** Derive public profiles from the same visible records used by the member filter. */
export function buildBuilderProfiles(communities) {
  const profiles = new Map();
  for (const community of communities) {
    if (community.hidden) continue;
    for (const rawHandle of community.cbMembers ?? []) {
      const handle = normalizeHandle(rawHandle);
      if (!handle) continue;
      if (!profiles.has(handle)) profiles.set(handle, { handle, communities: [] });
      const profile = profiles.get(handle);
      if (!profile.communities.some(({ id }) => id === community.id)) {
        profile.communities.push(community);
      }
    }
  }
  return profiles;
}

/**
 * Orden aleatorio estable mientras el modal está abierto.
 *
 * Alfabético, las mismas cuatro personas encabezaban la lista siempre y el resto no existía
 * para quien no hacía scroll. Fisher-Yates con el generador inyectado para poder testarlo.
 */
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Qué caras se ven en cada momento: una ventana que avanza sobre la lista barajada.
 *
 * Enseñar las 40 de golpe convertía la sección en una cuadrícula de iconos que nadie mira;
 * la ventana que rota deja ver que hay gente detrás sin pedir atención para todas a la vez.
 * Si caben todas (`size >= total`) no hay rotación que valga: se devuelven tal cual.
 */
export function visibleFaces(handles, size, step) {
  if (handles.length === 0) return [];
  if (handles.length <= size) return handles;
  const offset = ((step % handles.length) + handles.length) % handles.length;
  return Array.from({ length: size }, (_, index) => handles[(offset + index) % handles.length]);
}

// Replace other facets so an avatar always reveals all of this person's communities.
export function builderFilters(handle) {
  // Explicit statuses also preserve the full selection when the URL is reloaded:
  // an absent status facet normally restores the directory's active-only default.
  return { status: [...COMMUNITY_STATUS_OPTIONS], cbMembers: [normalizeHandle(handle)] };
}

/**
 * Los textos del modal llevan enlaces dentro de la frase (el hilo del open space, OTE, el
 * formulario de solicitud). Van en los locales con sintaxis markdown, `[texto](url)`, para
 * que quien escribe el copy pueda mover un enlace sin tocar el componente.
 *
 * Es un reparto en trozos, no un parser de markdown: solo entiende enlaces, y lo que no
 * encaja se queda como texto plano. Un enlace mal escrito se ve, no rompe la ficha.
 */
const COPY_LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseCopyLinks(text) {
  const source = text ?? "";
  const parts = [];
  let cursor = 0;
  for (const match of source.matchAll(COPY_LINK_RE)) {
    if (match.index > cursor) parts.push({ type: "text", value: source.slice(cursor, match.index) });
    // Lo que no empieza por http es del propio directorio (`?community=71`): se abre en la
    // misma pestaña, porque no es salir a ninguna parte.
    parts.push({ type: "link", value: match[1], href: match[2], external: /^https?:/i.test(match[2]) });
    cursor = match.index + match[0].length;
  }
  if (cursor < source.length) parts.push({ type: "text", value: source.slice(cursor) });
  return parts;
}
