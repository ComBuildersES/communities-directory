/**
 * Texto libre en varios idiomas.
 *
 * El directorio se lee en `/es/` y `/en/`, pero la descripción de las 663 fichas está
 * redactada en el idioma de la comunidad (casi siempre castellano). Quien entra por `/en/`
 * ve una interfaz en inglés con descripciones en castellano, y eso pasa en todas las
 * fichas, no solo en las que trabajan en varios idiomas.
 *
 * `langs` (en qué idioma opera la comunidad) y el locale de la interfaz (en qué idioma lee
 * la persona) son dos ejes distintos: esto resuelve el segundo. `shortDescription` sigue
 * siendo el texto canónico —el que escribió la comunidad— y `shortDescriptionI18n` guarda
 * las traducciones, omitido cuando no hay ninguna. Convertir el campo a objeto habría roto
 * `schema.json`, el CSV, `llms-full.txt` y el formulario para ganar lo mismo.
 */

import { COMMUNITY_LANGUAGE_SET, DEFAULT_COMMUNITY_LANGS } from "./communityLanguages.js";

export const DESCRIPTION_I18N_KEY = "shortDescriptionI18n";

/** Orden de preferencia cuando hay que elegir un idioma sin que nadie lo haya pedido. */
const FALLBACK_LANG_ORDER = ["es", "en"];

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Deja un mapa `{ lang: texto }` con solo idiomas del catálogo y textos no vacíos. Una
 * entrada vacía equivale a no tener traducción: si se guardase, la ficha prometería un
 * idioma que no existe.
 */
export function normalizeDescriptionTranslations(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const normalized = {};

  for (const [rawLang, rawText] of Object.entries(value)) {
    const lang = typeof rawLang === "string" ? rawLang.trim().toLowerCase() : "";
    const text = cleanText(rawText);

    if (!lang || !text || !COMMUNITY_LANGUAGE_SET.has(lang)) continue;

    normalized[lang] = text;
  }

  return normalized;
}

export const hasDescriptionTranslations = (community) =>
  Object.keys(normalizeDescriptionTranslations(community?.[DESCRIPTION_I18N_KEY])).length > 0;

/**
 * En qué idioma está `shortDescription`. No se guarda: se deduce de `langs`, porque añadir
 * un campo para marcarlo obligaría a rellenarlo en 663 fichas para acertar en las pocas que
 * no están en castellano (GeeksCAT la tiene en catalán). Quien necesite exactitud puede
 * guardar ese mismo idioma en `shortDescriptionI18n`, que manda sobre esta deducción.
 */
export function inferCanonicalDescriptionLang(community) {
  const langs = Array.isArray(community?.langs) ? community.langs : [];
  const [fallback] = DEFAULT_COMMUNITY_LANGS;

  if (langs.includes(fallback)) return fallback;

  return langs.find((lang) => COMMUNITY_LANGUAGE_SET.has(lang)) ?? fallback;
}

/**
 * Descripción a pintar y en qué idioma está de verdad.
 *
 * Devuelve `lang` además del texto porque hay que escribirlo en el `lang=` del elemento:
 * cuando en `/en/` se cae al castellano, un lector de pantalla en inglés destroza la
 * pronunciación y el traductor del navegador no sabe qué está leyendo. `isFallback` marca
 * justo ese caso: hay texto, pero no en el idioma que se pidió.
 */
export function resolveShortDescription(community, locale) {
  const translations = normalizeDescriptionTranslations(community?.[DESCRIPTION_I18N_KEY]);
  const canonicalText = cleanText(community?.shortDescription);
  const canonicalLang = inferCanonicalDescriptionLang(community);
  const requested = typeof locale === "string" ? locale.trim().toLowerCase().split("-")[0] : "";

  if (requested && translations[requested]) {
    return { text: translations[requested], lang: requested, isFallback: false };
  }

  if (canonicalText) {
    return {
      text: canonicalText,
      lang: canonicalLang,
      isFallback: Boolean(requested) && requested !== canonicalLang,
    };
  }

  const available = Object.keys(translations);
  const chosen = FALLBACK_LANG_ORDER.find((lang) => available.includes(lang)) ?? available[0];

  if (chosen) {
    return { text: translations[chosen], lang: chosen, isFallback: requested !== chosen };
  }

  return { text: "", lang: null, isFallback: false };
}

/** Idiomas en los que la ficha tiene descripción, canónico incluido. */
export function describedLangs(community) {
  const translations = normalizeDescriptionTranslations(community?.[DESCRIPTION_I18N_KEY]);
  const langs = new Set(Object.keys(translations));

  if (cleanText(community?.shortDescription)) {
    langs.add(inferCanonicalDescriptionLang(community));
  }

  return [...langs];
}

/**
 * Compacta el mapa para guardarlo: `undefined` cuando no queda nada, para no sembrar un
 * `{}` en 663 ficheros. En una edición que vacía todas las traducciones hace falta
 * distinguir "no se tocó" de "se borraron", igual que con `archivedUrls`: eso lo decide
 * quien construye el payload, no esta función.
 */
export function dropEmptyDescriptionTranslations(value) {
  const normalized = normalizeDescriptionTranslations(value);

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

/**
 * Idiomas en los que el directorio se lee de verdad. No es `COMMUNITY_LANGUAGE_OPTIONS`:
 * una comunidad puede trabajar en aranés, pero no hay interfaz en aranés donde pintar esa
 * descripción. Son los locales del routing (`/es/`, `/en/`).
 */
export const UI_READING_LOCALES = ["es", "en"];

/**
 * Qué idiomas ofrece el formulario para traducir la descripción.
 *
 * Los locales de la interfaz van primero porque son los únicos que alguien va a leer en la
 * web; detrás, los idiomas en los que trabaja la comunidad, que es donde encaja guardar el
 * texto original cuando no está en castellano. Se excluye el idioma del texto canónico (ya
 * está escrito arriba), salvo que la ficha tenga una traducción guardada en él: en una
 * edición, ocultar un texto existente equivale a perderlo sin avisar.
 */
export function resolveDescriptionTranslationLangs(community, { uiLocales = UI_READING_LOCALES } = {}) {
  const translations = normalizeDescriptionTranslations(community?.[DESCRIPTION_I18N_KEY]);
  const canonicalLang = inferCanonicalDescriptionLang(community);
  const communityLangs = Array.isArray(community?.langs) ? community.langs : [];

  const candidates = [...uiLocales, ...communityLangs, ...Object.keys(translations)];

  return [...new Set(candidates)].filter(
    (lang) =>
      COMMUNITY_LANGUAGE_SET.has(lang)
      && (lang !== canonicalLang || Boolean(translations[lang]))
  );
}
