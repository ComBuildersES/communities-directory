/* eslint-env node */
import { normalizeOpenTo } from '../src/lib/communityOpenTo.js';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { normalizeCommunityLangs } from '../src/lib/communityLanguages.js';
import {
  readCommunities,
  removeCommunity,
  writeCommunity,
  writeDeletedCommunity,
} from './lib/communities-store.js';
import { buildProposalSummary } from './lib/proposal-summary.js';
import { normalizeOrganizedBy } from '../src/lib/organizedCommunities.js';
import { toUrlEntries } from '../src/lib/communityUrls.js';

const body = process.argv[2] ?? '';
const imagesFolder = './public/images';
const tagsPath = './public/data/tags.json';
const audiencePath = './public/data/audience.json';
const appBaseUrl = process.env.COMMUNITY_DIRECTORY_APP_URL ?? 'https://directory.communitybuilders.dev/';
const CARD_THUMBNAIL_MAX_DISPLAY_PX = 120;
const MODAL_THUMBNAIL_MAX_DISPLAY_PX = 88;
const CONTRIBUTION_PREVIEW_MAX_DISPLAY_PX = 112;
const THUMBNAIL_TARGET_DPR = 2;
const THUMBNAIL_DIMENSION_BUCKET_PX = 64;
const MAX_UI_THUMBNAIL_DISPLAY_PX = Math.max(
  CARD_THUMBNAIL_MAX_DISPLAY_PX,
  MODAL_THUMBNAIL_MAX_DISPLAY_PX,
  CONTRIBUTION_PREVIEW_MAX_DISPLAY_PX
);
// La UI muestra logos pequeños; guardamos un 2x redondeado para retina sin arrastrar ficheros enormes.
export const THUMBNAIL_MAX_DIMENSION_PX = Math.ceil(
  (MAX_UI_THUMBNAIL_DISPLAY_PX * THUMBNAIL_TARGET_DPR) / THUMBNAIL_DIMENSION_BUCKET_PX
) * THUMBNAIL_DIMENSION_BUCKET_PX;
const THUMBNAIL_WEBP_OPTIONS = {
  quality: 82,
  effort: 5,
};
const ISSUE_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
};

function extractField(field) {
  const regex = new RegExp(`### ${field}\\s+([\\s\\S]*?)(?:\\n###|$)`, 'i');
  const match = body.match(regex);
  const value = match ? match[1].trim().replace(/["']/g, '') : '';
  return value === '_No response_' ? '' : value;
}

function toWebpFileName(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '.webp';
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function todayDDMMYYYY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  return ['sí', 'si', 'true', '1', 'yes'].includes(String(value).trim().toLowerCase());
}

function normalizeLatLon(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readCatalogIds(filePath) {
  if (!fs.existsSync(filePath)) return [];

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data)
      ? data.map((item) => normalizeString(item?.id)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

const KNOWN_TAG_IDS = readCatalogIds(tagsPath);
const KNOWN_AUDIENCE_IDS = readCatalogIds(audiencePath);

const LEGACY_LANGUAGE_MAP = {
  es: 'es',
  español: 'es',
  espanol: 'es',
  castellano: 'es',
  en: 'en',
  english: 'en',
  ingles: 'en',
  inglés: 'en',
  ca: 'ca',
  catala: 'ca',
  català: 'ca',
  catalan: 'ca',
  catalán: 'ca',
  eu: 'eu',
  euskera: 'eu',
  euskara: 'eu',
  basque: 'eu',
  gl: 'gl',
  galego: 'gl',
  gallego: 'gl',
  galician: 'gl',
  oc: 'oc',
  aranes: 'oc',
  aranés: 'oc',
  aranese: 'oc',
  occitan: 'oc',
};

function parseLegacyLangs(value) {
  if (!value) return normalizeCommunityLangs(undefined);

  const normalizedValues = value
    .split(/[\n,;/]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => LEGACY_LANGUAGE_MAP[item] ?? item);

  return normalizeCommunityLangs(normalizedValues);
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function extractJsonPayload() {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`No se pudo parsear el JSON del issue: ${error.message}`);
  }
}

function extractLegacyPayload() {
  const name = extractField('Nombre de la comunidad');
  if (!name) return null;

  return {
    id: null,
    name,
    status: extractField('Estado de la comunidad'),
    lastReviewed: todayDDMMYYYY(),
    communityType: extractField('Tipo de comunidad'),
    eventFormat: extractField('Formato'),
    location: extractField('Ciudad o región principal'),
    topics: extractField('Temas que trata'),
    langs: parseLegacyLangs(extractField('Idiomas de la comunidad')),
    tags: [],
    targetAudience: [],
    contactInfo: extractField('Correo de contacto (público)'),
    communityUrl: extractField('URL principal de la comunidad'),
    urls: [],
    thumbnailUrl: extractField('Imagen o logotipo de la comunidad'),
    latLon: {
      lat: null,
      lon: null,
    },
    displayOnMap: normalizeBoolean(extractField('Mostrar en el mapa')),
    humanValidated: false,
  };
}

function extractProposalType() {
  const match = body.match(/##\s*Tipo de propuesta\s*\n+([^\n#]+)/i);
  if (!match) return null;
  const value = match[1].trim().toLowerCase();
  if (value.includes('editar') || value.includes('edit')) return 'edit';
  if (value.includes('nueva') || value.includes('new') || value.includes('añadir')) return 'create';
  if (value.includes('baja') || value.includes('eliminar') || value.includes('delete')) return 'delete';
  return null;
}

function extractRemovalReason() {
  const match = body.match(/##\s*Motivo de la baja\s*\n+([\s\S]*?)(?:\n##|\n```|$)/i);
  if (!match) return '';
  return normalizeString(match[1]);
}

function buildProposalEditorUrl({ mode, payload }) {
  if (mode === ISSUE_MODES.DELETE) {
    return '';
  }

  const url = new URL(appBaseUrl);

  if (mode === 'edit' && payload.id !== null && payload.id !== undefined && String(payload.id).trim() !== '') {
    url.searchParams.set('edit', String(payload.id));
  } else {
    url.searchParams.set('contribute', 'new');
  }

  url.searchParams.set('proposal', JSON.stringify(payload));
  return url.toString();
}

function readSubmission() {
  const jsonPayload = extractJsonPayload();
  if (jsonPayload) {
    const proposalType = extractProposalType();
    const modeFromType = proposalType ?? (jsonPayload.id === null || jsonPayload.id === undefined ? ISSUE_MODES.CREATE : ISSUE_MODES.EDIT);
    return {
      mode: modeFromType,
      payload: {
        ...jsonPayload,
        removalReason: normalizeString(jsonPayload.removalReason) || extractRemovalReason(),
      },
    };
  }

  const legacyPayload = extractLegacyPayload();
  if (legacyPayload) {
    return {
      mode: 'create',
      payload: legacyPayload,
    };
  }

  throw new Error('No se encontró un JSON válido ni el formato antiguo del issue');
}

/**
 * Deduplica las URLs archivadas y descarta las que vuelven a estar activas en la propuesta:
 * un canal no puede estar a la vez publicado y archivado (issue #353).
 */
function normalizeArchivedUrlList(archivedUrls, payload) {
  if (!Array.isArray(archivedUrls)) return [];

  const activeUrls = new Set(
    [payload?.communityUrl, ...toUrlEntries(payload?.urls).map((entry) => entry.url)]
      .map((url) => normalizeString(url))
      .filter(Boolean)
  );
  const seen = new Set();

  return archivedUrls.reduce((list, value) => {
    const url = normalizeString(value);
    if (!url || seen.has(url) || activeUrls.has(url)) return list;

    seen.add(url);
    list.push(url);
    return list;
  }, []);
}

/**
 * Evita escribir `archivedUrls: []` u `organizedBy: []` en las fichas que no tienen nada en
 * esas claves. El array vacío sí viaja en el payload (es lo que distingue "no se tocó" de
 * "se vació"), pero no tiene por qué quedarse en el fichero.
 */
export function dropEmptyArchivedUrls(community) {
  const emptyKeys = ['archivedUrls', 'organizedBy', 'openTo'].filter(
    (key) => Array.isArray(community?.[key]) && community[key].length === 0
  );

  if (emptyKeys.length === 0) return community;

  return Object.fromEntries(
    Object.entries(community).filter(([key]) => !emptyKeys.includes(key))
  );
}

export function normalizePayload(payload) {
  const normalizedTags = Array.isArray(payload.tags) ? [...new Set(payload.tags.filter(Boolean))] : [];
  const normalizedAudience = Array.isArray(payload.targetAudience) ? [...new Set(payload.targetAudience.filter(Boolean))] : [];
  const hasAllKnownTags = KNOWN_TAG_IDS.length > 0 && KNOWN_TAG_IDS.every((id) => normalizedTags.includes(id));
  const hasAllKnownAudience = KNOWN_AUDIENCE_IDS.length > 0 && KNOWN_AUDIENCE_IDS.every((id) => normalizedAudience.includes(id));
  const matchesAllTags = normalizeBoolean(payload.matchesAllTags) || hasAllKnownTags;
  const matchesAllAudience = normalizeBoolean(payload.matchesAllAudience) || hasAllKnownAudience;
  const archivedUrls = normalizeArchivedUrlList(payload.archivedUrls, payload);

  return {
    id: payload.id ?? null,
    name: normalizeString(payload.name),
    status: normalizeString(payload.status) || 'unknown',
    lastReviewed: normalizeString(payload.lastReviewed) || todayDDMMYYYY(),
    communityType: normalizeString(payload.communityType) || 'tech-meetup',
    eventFormat: normalizeString(payload.eventFormat) || 'unknown',
    location: normalizeString(payload.location),
    geographicScope: normalizeString(payload.geographicScope) || 'unknown',
    shortDescription: normalizeString(payload.shortDescription),
    topics: normalizeString(payload.topics),
    langs: normalizeCommunityLangs(payload.langs),
    tags: matchesAllTags ? [] : normalizedTags,
    targetAudience: matchesAllAudience ? [] : normalizedAudience,
    ...(Array.isArray(payload.openTo) ? { openTo: normalizeOpenTo(payload.openTo) } : {}),
    contactInfo: normalizeString(payload.contactInfo),
    communityUrl: normalizeString(payload.communityUrl),
    // `urls` llega como lista de pares (#478). `toUrlEntries` acepta también el objeto por
    // clave del formato anterior, que es lo que traen los issues abiertos antes del cambio.
    urls: toUrlEntries(payload.urls),
    // Canales archivados (issue #353). El array viaja tal cual si la propuesta trae la
    // clave, incluso vacío: en una edición es lo que distingue "no se tocó" de "se
    // desarchivó todo". La clave vacía se limpia justo antes de escribir el fichero.
    ...(Array.isArray(payload.archivedUrls) ? { archivedUrls } : {}),
    thumbnailUrl: normalizeString(payload.thumbnailUrl),
    removalReason: normalizeString(payload.removalReason),
    latLon: {
      lat: normalizeLatLon(payload.latLon?.lat),
      lon: normalizeLatLon(payload.latLon?.lon),
    },
    displayOnMap: normalizeBoolean(payload.displayOnMap) && normalizeString(payload.communityType) !== 'umbrella-org',
    humanValidated: Boolean(payload.humanValidated),
    ...(matchesAllTags ? { matchesAllTags: true } : {}),
    ...(matchesAllAudience ? { matchesAllAudience: true } : {}),
    ...(normalizeString(payload.communityType) !== 'umbrella-org'
      ? { parentId: payload.parentId != null ? Number(payload.parentId) : null }
      : {}),
    // Fusión (status "merged"): la clave solo existe si la comunidad dejó de existir por
    // separado. Ver src/lib/mergedCommunities.js.
    ...(normalizeString(payload.status) === 'merged'
      ? { mergedIntoId: payload.mergedIntoId != null ? Number(payload.mergedIntoId) : null }
      : {}),
    // Autoría (issue #475): la clave solo existe si la propuesta la trae. Un array vacío se
    // conserva aquí —en una edición es lo que dice "se quitaron todas las organizadoras"— y
    // lo limpia `dropEmptyArchivedUrls` antes de escribir el fichero.
    ...(Array.isArray(payload.organizedBy)
      ? { organizedBy: normalizeOrganizedBy(payload.organizedBy, { selfId: payload.id ?? null }) }
      : {}),
  };
}

function buildDeletedCommunityEntry(community, removalReason) {
  const deletedFromIssue = Number.parseInt(process.env.GITHUB_ISSUE_NUMBER ?? '', 10);

  return {
    id: community.id,
    name: community.name,
    communityUrl: community.communityUrl,
    deletedAt: todayDDMMYYYY(),
    removalReason,
    deletedFromIssue: Number.isInteger(deletedFromIssue) ? deletedFromIssue : null,
  };
}

/**
 * Una edición que mueve `location` arrastra el `latLon` de la ficha anterior: el formulario
 * siembra el borrador con las coordenadas existentes y no las recalcula. Sin esto, cambiar
 * "Barcelona" por "Parc Bit, Mallorca" dejaba el pin en Barcelona (PR #457).
 *
 * Solo se regeocodifica si las coordenadas de la propuesta son exactamente las heredadas:
 * si vienen distintas, alguien las ha puesto a mano y manda su valor.
 */
export function shouldRegeocodeLocation(payload, existing) {
  if (!existing || !payload.location) return false;

  const sameLocation =
    normalizeString(existing.location).toLowerCase() === normalizeString(payload.location).toLowerCase();
  if (sameLocation) return false;

  return (
    payload.latLon.lat === normalizeLatLon(existing.latLon?.lat) &&
    payload.latLon.lon === normalizeLatLon(existing.latLon?.lon)
  );
}

async function geocodeLocation(location) {
  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
      headers: {
        'User-Agent': 'ComunidadBot/1.0 (communitybuilders.es@gmail.com)'
      }
    });
    if (!geoRes.ok) return null;

    const geoData = await geoRes.json();
    if (!Array.isArray(geoData) || geoData.length === 0) return null;

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  } catch (error) {
    console.warn('⚠️ No se pudo geocodificar la ubicación:', error.message);
    return null;
  }
}

export async function resolveCoordinates(payload, existing) {
  if (!payload.displayOnMap || payload.communityType === 'umbrella-org') {
    return { lat: null, lon: null };
  }

  const inheritedLatLon = payload.latLon.lat !== null && payload.latLon.lon !== null
    ? payload.latLon
    : null;

  if (inheritedLatLon && !shouldRegeocodeLocation(payload, existing)) {
    return inheritedLatLon;
  }

  if (!payload.location) {
    return inheritedLatLon ?? { lat: null, lon: null };
  }

  // Si la geocodificación falla, conservar las coordenadas heredadas es menos malo que
  // sacar la comunidad del mapa.
  const geocoded = await geocodeLocation(payload.location);
  return geocoded ?? inheritedLatLon ?? { lat: null, lon: null };
}

export function buildThumbnailTransform(image) {
  return image
    .rotate()
    .resize({
      width: THUMBNAIL_MAX_DIMENSION_PX,
      height: THUMBNAIL_MAX_DIMENSION_PX,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp(THUMBNAIL_WEBP_OPTIONS);
}

export async function optimizeThumbnailBuffer(inputBuffer) {
  return buildThumbnailTransform(sharp(inputBuffer)).toBuffer();
}

async function resolveThumbnail(payload) {
  if (!payload.thumbnailUrl || !isRemoteUrl(payload.thumbnailUrl)) {
    return payload.thumbnailUrl;
  }

  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
  }

  const imgRes = await fetch(payload.thumbnailUrl);
  if (!imgRes.ok) {
    throw new Error(`No se pudo descargar la imagen (${imgRes.status} ${imgRes.statusText})`);
  }

  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  const optimizedBuffer = await optimizeThumbnailBuffer(imgBuffer);
  const webpFilename = toWebpFileName(payload.name || `community-${Date.now()}`);
  const webpPath = path.join(imagesFolder, webpFilename);
  fs.writeFileSync(webpPath, optimizedBuffer);
  return `images/${webpFilename}`;
}

function ensureNoDuplicateCreate(communities, payload) {
  const nameExists = communities.some((community) =>
    community.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
  );
  const urlExists = communities.some((community) =>
    community.communityUrl && payload.communityUrl &&
    community.communityUrl.trim().toLowerCase() === payload.communityUrl.trim().toLowerCase()
  );

  if (nameExists || urlExists) {
    console.error('❌ Esta comunidad podría ser un duplicado:');
    if (nameExists) console.error(`- Ya existe una comunidad con el nombre "${payload.name}"`);
    if (urlExists) console.error(`- Ya existe una comunidad con la misma URL "${payload.communityUrl}"`);
    process.exit(1);
  }
}

async function main() {
  const communities = readCommunities();

  if (communities.length === 0) {
    console.error('❌ No se encontraron comunidades en data/communities/');
    process.exit(1);
  }

  const { mode, payload: rawPayload } = readSubmission();
  const payload = normalizePayload(rawPayload);
  const proposalEditorUrl = buildProposalEditorUrl({ mode, payload });

  fs.mkdirSync('.geo', { recursive: true });

  if (mode === ISSUE_MODES.CREATE) {
    ensureNoDuplicateCreate(communities, payload);
  }

  const existing = communities.find((community) => String(community.id) === String(payload.id));
  if ((mode === ISSUE_MODES.EDIT || mode === ISSUE_MODES.DELETE) && !existing) {
    throw new Error(`No se encontró la comunidad con ID ${payload.id} para ${mode === ISSUE_MODES.DELETE ? 'eliminar' : 'editar'}`);
  }

  const resolvedCoordinates = mode === ISSUE_MODES.DELETE
    ? { lat: null, lon: null }
    : await resolveCoordinates(payload, existing);
  fs.writeFileSync(path.join('.geo', 'last-coordinates.json'), JSON.stringify(resolvedCoordinates, null, 2));
  fs.writeFileSync(
    path.join('.geo', 'community-meta.json'),
    JSON.stringify({ name: payload.name, mode, proposalEditorUrl }, null, 2)
  );
  // Ficha legible para el cuerpo de la PR (issue #436): el revisor no debería tener que
  // descifrar ids de tags ni leer el JSON a pelo. Se escribe en un fichero porque la
  // tabla markdown no cabe en un `$GITHUB_OUTPUT` de una línea.
  fs.writeFileSync(
    path.join('.geo', 'proposal-summary.md'),
    `${buildProposalSummary({ mode, payload, existing })}\n`
  );

  if (mode === ISSUE_MODES.DELETE) {
    removeCommunity(existing.id);
    const { slug: deletedSlug } = writeDeletedCommunity(
      buildDeletedCommunityEntry(existing, payload.removalReason)
    );
    console.log(`✔ Comunidad eliminada: ${existing.name} (ID ${existing.id}) → data/deleted-communities/${deletedSlug}.json`);
    return;
  }

  let thumbnailUrl = payload.thumbnailUrl;
  try {
    thumbnailUrl = await resolveThumbnail(payload);
  } catch (error) {
    console.warn('⚠️ No se pudo procesar la imagen. Continuando con el valor original:', error.message);
  }

  // El `id` NO se asigna aquí: lo hace `assign-community-ids` ya en master, donde las
  // asignaciones están serializadas. Si se asignase en esta rama, dos propuestas
  // simultáneas reclamarían el mismo id (ver issue #437).
  const normalizedCommunity = {
    ...payload,
    id: mode === ISSUE_MODES.CREATE ? null : existing.id,
    latLon: resolvedCoordinates,
    thumbnailUrl,
  };

  if (mode === ISSUE_MODES.EDIT) {
    const { slug } = writeCommunity(dropEmptyArchivedUrls({ ...existing, ...normalizedCommunity }));
    console.log(`✔ Comunidad actualizada: ${normalizedCommunity.name} (ID ${normalizedCommunity.id}) → data/communities/${slug}.json`);
    return;
  }

  const { slug } = writeCommunity(dropEmptyArchivedUrls(normalizedCommunity));
  console.log(`✔ Comunidad añadida: ${normalizedCommunity.name} → data/communities/${slug}.json (id pendiente de asignar en master)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}
