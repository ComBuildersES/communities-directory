/**
 * Alta asistida por IA: construye el prompt que se abre en Claude o ChatGPT y valida el
 * JSON que la persona pega de vuelta.
 *
 * El bucle es deliberadamente manual —abrir chat, volver, pegar— porque el directorio es
 * estático y no tiene (ni quiere) una clave de API: la IA la pone quien la usa, y nadie
 * manda datos a un tercero sin verlos.
 *
 * Todo lo que llega del portapapeles es texto arbitrario: `parseAssistedCommunityJson`
 * no confía en él. Filtra a las claves conocidas, descarta valores fuera de los enums y
 * devuelve avisos en vez de romper, para que el formulario pueda aprovechar lo que sí
 * sirve en lugar de tirar la respuesta entera.
 *
 * Los campos que son ids de otras fichas (`id`, `parentId`, `mergedIntoId`, `organizedBy`)
 * se descartan a propósito: un id solo significa algo dentro de este dataset, y un modelo
 * que lo rellena está adivinando. Esos vínculos los elige una persona en el formulario.
 */
import { OPEN_TO_OPTIONS } from "./communityOpenTo.js";
import { URL_PLATFORM_OPTIONS } from "./communitySubmission";

export const SCHEMA_URL = "https://directory.communitybuilders.dev/data/schema.json";
export const TAGS_URL = "https://directory.communitybuilders.dev/data/tags.json";
export const AUDIENCE_URL = "https://directory.communitybuilders.dev/data/audience.json";
/** Mismos catálogos, mismos IDs, etiquetas traducidas: ayudan al modelo a emparejar en inglés. */
export const TAGS_EN_URL = "https://directory.communitybuilders.dev/data/tags.en.json";
export const AUDIENCE_EN_URL = "https://directory.communitybuilders.dev/data/audience.en.json";

export const ASSIST_PROVIDERS = [
  { id: "claude", label: "Claude", icon: "fa-robot", base: "https://claude.ai/new" },
  { id: "chatgpt", label: "ChatGPT", icon: "fa-comment-dots", base: "https://chatgpt.com/" },
];

const ENUM_VALUES = {
  status: ["active", "inactive", "unknown"],
  communityType: [
    "tech-meetup",
    "conference",
    "umbrella-org",
    "hacklab",
    "collaborative-group",
    "meta-community",
    "mutual-aid",
  ],
  eventFormat: ["in-person", "online", "hybrid", "unknown"],
  geographicScope: [
    "unknown",
    "local",
    "provincial",
    "regional",
    "national",
    "international",
  ],
};

const STRING_FIELDS = [
  "name",
  "location",
  "shortDescription",
  "topics",
  "contactInfo",
  "communityUrl",
];

const ARRAY_FIELDS = ["langs", "tags", "targetAudience", "openTo"];

const URL_KEYS = new Set(URL_PLATFORM_OPTIONS.map((option) => option.key));

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Los modelos devuelven el JSON envuelto de mil formas: en una valla ```json, con una
 * frase delante, o ambas. Quedarse con el primer objeto de nivel superior cubre todas.
 */
export function extractJsonObject(raw) {
  const text = cleanString(raw);
  if (!text) return null;

  const withoutFence = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  const candidates = [withoutFence];
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start !== -1 && end > start) {
    candidates.push(withoutFence.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // Se prueba el siguiente candidato.
    }
  }

  return null;
}

/**
 * @returns {{ community: object|null, error: string|null, warnings: string[], fieldCount: number }}
 *   `error` es un código traducible, no un mensaje: el texto lo pone el formulario.
 */
export function parseAssistedCommunityJson(raw, { knownTagIds = [], knownAudienceIds = [] } = {}) {
  const parsed = extractJsonObject(raw);

  if (!parsed) {
    return { community: null, error: "invalidJson", warnings: [], fieldCount: 0 };
  }

  const warnings = [];
  const community = {};

  STRING_FIELDS.forEach((field) => {
    const value = cleanString(parsed[field]);
    if (value) community[field] = value;
  });

  Object.entries(ENUM_VALUES).forEach(([field, allowed]) => {
    const value = cleanString(parsed[field]);
    if (!value) return;
    if (allowed.includes(value)) {
      community[field] = value;
    } else {
      warnings.push(`enum:${field}:${value}`);
    }
  });

  const knownTags = new Set(knownTagIds);
  const knownAudience = new Set(knownAudienceIds);

  ARRAY_FIELDS.forEach((field) => {
    const raw = parsed[field];
    if (!Array.isArray(raw)) return;

    const values = raw.map((item) => cleanString(item)).filter(Boolean);
    const catalogue =
      field === "openTo" ? new Set(OPEN_TO_OPTIONS) : field === "tags" ? knownTags : field === "targetAudience" ? knownAudience : null;

    if (!catalogue || catalogue.size === 0) {
      if (values.length > 0) community[field] = [...new Set(values)];
      return;
    }

    const kept = [...new Set(values.filter((value) => catalogue.has(value)))];
    const dropped = values.filter((value) => !catalogue.has(value));

    if (dropped.length > 0) {
      warnings.push(`unknown:${field}:${[...new Set(dropped)].join(", ")}`);
    }
    if (kept.length > 0) community[field] = kept;
  });

  if (parsed.urls && typeof parsed.urls === "object" && !Array.isArray(parsed.urls)) {
    const urls = {};
    const droppedKeys = [];

    Object.entries(parsed.urls).forEach(([key, value]) => {
      const url = cleanString(value);
      if (!url) return;
      if (URL_KEYS.has(key)) {
        urls[key] = url;
      } else {
        droppedKeys.push(key);
      }
    });

    if (droppedKeys.length > 0) {
      warnings.push(`unknown:urls:${[...new Set(droppedKeys)].join(", ")}`);
    }
    if (Object.keys(urls).length > 0) community.urls = urls;
  }

  ["matchesAllTags", "matchesAllAudience"].forEach((field) => {
    if (typeof parsed[field] === "boolean") community[field] = parsed[field];
  });

  const fieldCount = Object.keys(community).length;

  if (fieldCount === 0) {
    return { community: null, error: "noFields", warnings, fieldCount: 0 };
  }

  // Una ficha generada por IA no está revisada por una persona hasta que alguien le da a
  // enviar habiéndola leído; eso lo decide el formulario, no este parser.
  return { community, error: null, warnings, fieldCount };
}

/**
 * El prompt enlaza a `schema.json` y a los catálogos en vez de incrustarlos: 166 tags no
 * caben en una query string, y así el modelo trabaja siempre contra la versión vigente.
 */
/**
 * Cuantas más fuentes, mejor sale la ficha: la web dice de qué va la comunidad, pero el
 * Meetup dice si sigue viva, LinkedIn quién la dinamiza y el GitHub qué publican. Acepta
 * una URL suelta o una lista, y descarta vacíos y duplicados.
 */
export function normalizeAssistUrls(value) {
  const list = Array.isArray(value) ? value : [value];

  return [...new Set(list.map((item) => cleanString(item)).filter(Boolean))];
}

export function buildAssistPrompt({ communityUrl = "", locale = "es", draft = null } = {}) {
  const urls = normalizeAssistUrls(communityUrl);
  const url = urls[0] ?? "";
  const known = [];

  if (draft) {
    if (cleanString(draft.name)) known.push(`- Nombre: ${cleanString(draft.name)}`);
    if (cleanString(draft.location)) known.push(`- Ubicación: ${cleanString(draft.location)}`);
    if (cleanString(draft.communityUrl) && cleanString(draft.communityUrl) !== url) {
      known.push(`- URL principal: ${cleanString(draft.communityUrl)}`);
    }
  }

  const isSpanish = locale !== "en";

  if (!isSpanish) {
    return `I want to add a community to the Community Builders directory of Spanish tech communities, and I would like your help filling in its record.

${
      urls.length > 0
        ? `Links to the community (use every one you can reach):\n${urls.map((item) => `- ${item}`).join("\n")}`
        : "Links to the community: [paste the website, and any social, events or code channel you know]"
    }
${known.length > 0 ? `\nWhat I already know:\n${known.join("\n")}\n` : ""}
Please:
1. Read the field definitions at ${SCHEMA_URL} — it is a JSON Schema and it explains every field and every allowed enum value.
2. Read the catalogues at ${TAGS_URL} and ${AUDIENCE_URL}. The "tags" and "targetAudience" fields take **ids from those files**, never free text and never invented ids. Match on label, description and synonyms. The same catalogues exist in English at ${TAGS_EN_URL} and ${AUDIENCE_EN_URL} — same ids, translated labels — so use whichever helps you match, and if the community describes itself in English, check both.
3. Visit every link I gave you and work out what the community actually is. Each source tells you something different: the website says what they are about, an events platform says whether they are still alive and how often they meet, social channels say who runs it and in what language, a code repository says what they build. Cross-check them, and if two sources disagree, trust the most recent one and tell me about it.
4. Reply with **one JSON object and nothing else**, using only these keys: name, status, communityType, eventFormat, location, geographicScope, shortDescription, langs, tags, targetAudience, openTo, contactInfo, communityUrl, urls, matchesAllTags, matchesAllAudience.

Rules that matter:
- "openTo" is an array of these ids: volunteers, collaborations, co-organisers, speakers, sponsors, venues, mentors. Include only explicitly documented openness to these contributions; it does not mean urgent recruitment. Omit it without evidence; an empty or absent field means unknown, not refusal.
- "location" is where the events happen ("City, Region"); "geographicScope" is the territory served. They are different.
- "urls" only takes the platform keys listed in the schema. Meetup, Eventbrite and Luma have their own keys ("meetup", "eventbrite", "luma"); "eventsUrl" is for any other events platform.
- Set "matchesAllTags" (or "matchesAllAudience") to true only for a genuinely generalist community, and leave its array empty in that case.
- Fill "urls" with the channels you found, each under its own key.
- Leave out any field you cannot establish. Do not guess, and do not invent contact emails or URLs.
- If something is ambiguous, say so **after** the JSON, not inside it.

I will paste your JSON back into the directory form and review it before submitting.`;
  }

  return `Quiero dar de alta una comunidad en el directorio de comunidades tecnológicas de España de Community Builders, y me gustaría que me ayudes a rellenar su ficha.

${
    urls.length > 0
      ? `Enlaces de la comunidad (usa todos los que puedas abrir):\n${urls.map((item) => `- ${item}`).join("\n")}`
      : "Enlaces de la comunidad: [pega la web y cualquier canal social, de eventos o de código que conozcas]"
  }
${known.length > 0 ? `\nLo que ya sé:\n${known.join("\n")}\n` : ""}
Haz lo siguiente:
1. Lee la definición de los campos en ${SCHEMA_URL}: es un JSON Schema y explica cada campo y cada valor permitido de los enums.
2. Lee los catálogos ${TAGS_URL} y ${AUDIENCE_URL}. Los campos "tags" y "targetAudience" llevan **IDs de esos ficheros**, nunca texto libre ni IDs inventados. Busca por label, description y synonyms. Los mismos catálogos están en inglés en ${TAGS_EN_URL} y ${AUDIENCE_EN_URL} (mismos IDs, etiquetas traducidas): usa el que te sirva para emparejar, y si la comunidad se describe en inglés, consulta los dos.
3. Visita todos los enlaces que te he dado y entiende qué es realmente esa comunidad. Cada fuente te dice algo distinto: la web dice de qué va, una plataforma de eventos dice si sigue viva y cada cuánto se reúne, los canales sociales dicen quién la dinamiza y en qué idioma, un repositorio dice qué construyen. Crúzalos, y si dos se contradicen, hazle caso al más reciente y avísame.
4. Respóndeme con **un único objeto JSON y nada más**, usando solo estas claves: name, status, communityType, eventFormat, location, geographicScope, shortDescription, langs, tags, targetAudience, openTo, contactInfo, communityUrl, urls, matchesAllTags, matchesAllAudience.

Reglas que importan:
- "openTo" es un array de estos IDs: volunteers, collaborations, co-organisers, speakers, sponsors, venues, mentors. Incluye solo disponibilidad explícitamente documentada para esas aportaciones; no significa búsqueda urgente. Omítelo si no hay evidencia: vacío o ausente significa sin información, no rechazo.
- "location" es dónde se celebran los eventos ("Ciudad, Comunidad Autónoma"); "geographicScope" es el territorio al que da servicio. No son lo mismo.
- "urls" solo admite las claves de plataforma del esquema. Meetup, Eventbrite y Luma tienen clave propia ("meetup", "eventbrite", "luma"); "eventsUrl" es para cualquier otra plataforma de eventos.
- Pon "matchesAllTags" (o "matchesAllAudience") a true solo si la comunidad es realmente generalista, y en ese caso deja su array vacío.
- Rellena "urls" con los canales que hayas encontrado, cada uno en su clave.
- Omite cualquier campo que no puedas establecer. No adivines, y no te inventes correos ni URLs.
- Si algo es ambiguo, dímelo **después** del JSON, no dentro.

Voy a pegar tu JSON en el formulario del directorio y lo revisaré antes de enviarlo.`;
}

export function buildAssistChatUrl(providerId, prompt) {
  const provider = ASSIST_PROVIDERS.find((item) => item.id === providerId);
  if (!provider) return null;

  return `${provider.base}?q=${encodeURIComponent(prompt)}`;
}
