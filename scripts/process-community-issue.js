/* eslint-env node */
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { normalizeCommunityLangs } from '../src/lib/communityLanguages.js';

const body = process.argv[2] ?? '';
const communitiesPath = './public/data/communities.json';
const communitiesMetaPath = './public/data/communities.meta.json';
const deletedCommunitiesPath = './public/data/deleted-communities.json';
const imagesFolder = './public/images';
const tagsPath = './public/data/tags.json';
const audiencePath = './public/data/audience.json';
const appBaseUrl = process.env.COMMUNITY_DIRECTORY_APP_URL ?? 'https://combuilderses.github.io/communities-directory/';
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
    urls: {},
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

export function normalizePayload(payload) {
  const normalizedTags = Array.isArray(payload.tags) ? [...new Set(payload.tags.filter(Boolean))] : [];
  const normalizedAudience = Array.isArray(payload.targetAudience) ? [...new Set(payload.targetAudience.filter(Boolean))] : [];
  const hasAllKnownTags = KNOWN_TAG_IDS.length > 0 && KNOWN_TAG_IDS.every((id) => normalizedTags.includes(id));
  const hasAllKnownAudience = KNOWN_AUDIENCE_IDS.length > 0 && KNOWN_AUDIENCE_IDS.every((id) => normalizedAudience.includes(id));
  const matchesAllTags = normalizeBoolean(payload.matchesAllTags) || hasAllKnownTags;
  const matchesAllAudience = normalizeBoolean(payload.matchesAllAudience) || hasAllKnownAudience;

  return {
    id: payload.id ?? null,
    name: normalizeString(payload.name),
    status: normalizeString(payload.status) || 'unknown',
    lastReviewed: normalizeString(payload.lastReviewed) || todayDDMMYYYY(),
    communityType: normalizeString(payload.communityType) || 'tech-meetup',
    eventFormat: normalizeString(payload.eventFormat) || 'unknown',
    location: normalizeString(payload.location),
    shortDescription: normalizeString(payload.shortDescription),
    topics: normalizeString(payload.topics),
    langs: normalizeCommunityLangs(payload.langs),
    tags: matchesAllTags ? [] : normalizedTags,
    targetAudience: matchesAllAudience ? [] : normalizedAudience,
    contactInfo: normalizeString(payload.contactInfo),
    communityUrl: normalizeString(payload.communityUrl),
    urls: Object.fromEntries(
      Object.entries(payload.urls ?? {})
        .map(([key, value]) => [normalizeString(key), normalizeString(value)])
        .filter(([key, value]) => key && value)
    ),
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
  };
}

function readJsonFile(filePath, fallbackValue = null) {
  if (!fs.existsSync(filePath)) return fallbackValue;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function getMaxKnownCommunityId(communities, deletedCommunities) {
  const ids = [];

  if (Array.isArray(communities)) {
    for (const community of communities) {
      if (Number.isInteger(community?.id)) {
        ids.push(community.id);
      }
    }
  }

  if (Array.isArray(deletedCommunities)) {
    for (const community of deletedCommunities) {
      if (Number.isInteger(community?.id)) {
        ids.push(community.id);
      }
    }
  }

  return ids.length > 0 ? Math.max(...ids) : 0;
}

function getNextCommunityIdFromMeta(meta, communities, deletedCommunities) {
  const nextCommunityIdFromMeta = Number.isInteger(meta?.nextCommunityId) && meta.nextCommunityId > 0
    ? meta.nextCommunityId
    : 1;
  const minimumNextCommunityId = getMaxKnownCommunityId(communities, deletedCommunities) + 1;

  return Math.max(nextCommunityIdFromMeta, minimumNextCommunityId);
}

function updateNextCommunityId(meta, nextCommunityId) {
  return {
    ...(meta ?? {}),
    nextCommunityId,
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

async function resolveCoordinates(payload) {
  if (!payload.displayOnMap || payload.communityType === 'umbrella-org') {
    return { lat: null, lon: null };
  }

  if (payload.latLon.lat !== null && payload.latLon.lon !== null) {
    return payload.latLon;
  }

  if (!payload.location) {
    return { lat: null, lon: null };
  }

  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(payload.location)}`, {
    headers: {
      'User-Agent': 'ComunidadBot/1.0 (communitybuilders.es@gmail.com)'
    }
  });
  const geoData = await geoRes.json();
  return geoData.length ? {
    lat: parseFloat(geoData[0].lat),
    lon: parseFloat(geoData[0].lon)
  } : { lat: null, lon: null };
}

async function resolveThumbnail(payload) {
  if (!payload.thumbnailUrl || !isRemoteUrl(payload.thumbnailUrl)) {
    return payload.thumbnailUrl;
  }

  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
  }

  const imgRes = await fetch(payload.thumbnailUrl);
  const imgBuffer = await imgRes.arrayBuffer();
  const webpFilename = toWebpFileName(payload.name || `community-${Date.now()}`);
  const webpPath = path.join(imagesFolder, webpFilename);
  await sharp(Buffer.from(imgBuffer)).webp().toFile(webpPath);
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
  if (!fs.existsSync(communitiesPath)) {
    console.error('❌ No se encontró el archivo communities.json');
    process.exit(1);
  }

  const communities = readJsonFile(communitiesPath, []);
  const communitiesMeta = readJsonFile(communitiesMetaPath, { nextCommunityId: 1 });
  const deletedCommunities = readJsonFile(deletedCommunitiesPath, []);
  const { mode, payload: rawPayload } = readSubmission();
  const payload = normalizePayload(rawPayload);
  const proposalEditorUrl = buildProposalEditorUrl({ mode, payload });

  fs.mkdirSync('.geo', { recursive: true });

  if (mode === ISSUE_MODES.CREATE) {
    ensureNoDuplicateCreate(communities, payload);
  }

  const existingIndex = communities.findIndex((community) => String(community.id) === String(payload.id));
  if ((mode === ISSUE_MODES.EDIT || mode === ISSUE_MODES.DELETE) && existingIndex === -1) {
    throw new Error(`No se encontró la comunidad con ID ${payload.id} para ${mode === ISSUE_MODES.DELETE ? 'eliminar' : 'editar'}`);
  }

  const nextCommunityId = getNextCommunityIdFromMeta(communitiesMeta, communities, deletedCommunities);
  const resolvedCoordinates = mode === ISSUE_MODES.DELETE
    ? { lat: null, lon: null }
    : await resolveCoordinates(payload);
  fs.writeFileSync(path.join('.geo', 'last-coordinates.json'), JSON.stringify(resolvedCoordinates, null, 2));
  fs.writeFileSync(
    path.join('.geo', 'community-meta.json'),
    JSON.stringify({ name: payload.name, mode, proposalEditorUrl }, null, 2)
  );

  if (mode === ISSUE_MODES.DELETE) {
    const removedCommunity = communities[existingIndex];
    communities.splice(existingIndex, 1);
    deletedCommunities.push(buildDeletedCommunityEntry(removedCommunity, payload.removalReason));
    writeJsonFile(communitiesPath, communities);
    writeJsonFile(deletedCommunitiesPath, deletedCommunities);
    writeJsonFile(communitiesMetaPath, updateNextCommunityId(communitiesMeta, nextCommunityId));
    console.log(`✔ Comunidad eliminada: ${removedCommunity.name} (ID ${removedCommunity.id})`);
    return;
  }

  let thumbnailUrl = payload.thumbnailUrl;
  try {
    thumbnailUrl = await resolveThumbnail(payload);
  } catch (error) {
    console.warn('⚠️ No se pudo procesar la imagen. Continuando con el valor original:', error.message);
  }

  const normalizedCommunity = {
    ...payload,
    id: mode === ISSUE_MODES.CREATE ? nextCommunityId : communities[existingIndex].id,
    latLon: resolvedCoordinates,
    thumbnailUrl,
  };

  if (mode === ISSUE_MODES.EDIT) {
    communities[existingIndex] = {
      ...communities[existingIndex],
      ...normalizedCommunity,
    };
    writeJsonFile(communitiesPath, communities);
    writeJsonFile(communitiesMetaPath, updateNextCommunityId(communitiesMeta, nextCommunityId));
    console.log(`✔ Comunidad actualizada: ${normalizedCommunity.name} (ID ${normalizedCommunity.id})`);
    return;
  }

  communities.push(normalizedCommunity);
  writeJsonFile(communitiesPath, communities);
  writeJsonFile(communitiesMetaPath, updateNextCommunityId(communitiesMeta, nextCommunityId + 1));
  console.log(`✔ Comunidad añadida: ${normalizedCommunity.name} (ID ${normalizedCommunity.id})`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}
