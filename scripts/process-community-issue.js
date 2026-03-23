/* eslint-env node */
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const body = process.argv[2] ?? '';
const communitiesPath = './public/data/communities.json';
const imagesFolder = './public/images';

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

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  return ['sí', 'si', 'true', '1', 'yes'].includes(String(value).trim().toLowerCase());
}

function normalizeLatLon(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
    lastReviewed: new Date().toLocaleDateString('es-ES'),
    communityType: extractField('Tipo de comunidad'),
    eventFormat: extractField('Formato'),
    location: extractField('Ciudad o región principal'),
    topics: extractField('Temas que trata'),
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

function readSubmission() {
  const jsonPayload = extractJsonPayload();
  if (jsonPayload) {
    return {
      mode: jsonPayload.id === null || jsonPayload.id === undefined ? 'create' : 'edit',
      payload: jsonPayload,
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

function normalizePayload(payload) {
  return {
    id: payload.id ?? null,
    name: normalizeString(payload.name),
    status: normalizeString(payload.status) || 'Desconocido',
    lastReviewed: normalizeString(payload.lastReviewed) || new Date().toLocaleDateString('es-ES'),
    communityType: normalizeString(payload.communityType) || 'Tech Meetup',
    eventFormat: normalizeString(payload.eventFormat) || 'Desconocido',
    location: normalizeString(payload.location),
    topics: normalizeString(payload.topics),
    tags: Array.isArray(payload.tags) ? [...new Set(payload.tags.filter(Boolean))] : [],
    targetAudience: Array.isArray(payload.targetAudience) ? [...new Set(payload.targetAudience.filter(Boolean))] : [],
    contactInfo: normalizeString(payload.contactInfo),
    communityUrl: normalizeString(payload.communityUrl),
    urls: Object.fromEntries(
      Object.entries(payload.urls ?? {})
        .map(([key, value]) => [normalizeString(key), normalizeString(value)])
        .filter(([key, value]) => key && value)
    ),
    thumbnailUrl: normalizeString(payload.thumbnailUrl),
    latLon: {
      lat: normalizeLatLon(payload.latLon?.lat),
      lon: normalizeLatLon(payload.latLon?.lon),
    },
    displayOnMap: normalizeBoolean(payload.displayOnMap),
    humanValidated: Boolean(payload.humanValidated),
  };
}

async function resolveCoordinates(payload) {
  if (!payload.displayOnMap) {
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

  const data = fs.readFileSync(communitiesPath, 'utf-8');
  const communities = JSON.parse(data);
  const { mode, payload: rawPayload } = readSubmission();
  const payload = normalizePayload(rawPayload);

  fs.mkdirSync('.geo', { recursive: true });

  if (mode === 'create') {
    ensureNoDuplicateCreate(communities, payload);
  }

  const existingIndex = communities.findIndex((community) => String(community.id) === String(payload.id));
  if (mode === 'edit' && existingIndex === -1) {
    throw new Error(`No se encontró la comunidad con ID ${payload.id} para editar`);
  }

  const newId = Math.max(...communities.map((community) => Number(community.id) || 0)) + 1;
  const resolvedCoordinates = await resolveCoordinates(payload);
  fs.writeFileSync(path.join('.geo', 'last-coordinates.json'), JSON.stringify(resolvedCoordinates, null, 2));

  let thumbnailUrl = payload.thumbnailUrl;
  try {
    thumbnailUrl = await resolveThumbnail(payload);
  } catch (error) {
    console.warn('⚠️ No se pudo procesar la imagen. Continuando con el valor original:', error.message);
  }

  const normalizedCommunity = {
    ...payload,
    id: mode === 'create' ? newId : communities[existingIndex].id,
    latLon: resolvedCoordinates,
    thumbnailUrl,
  };

  if (mode === 'edit') {
    communities[existingIndex] = {
      ...communities[existingIndex],
      ...normalizedCommunity,
    };
    fs.writeFileSync(communitiesPath, JSON.stringify(communities, null, 2));
    console.log(`✔ Comunidad actualizada: ${normalizedCommunity.name} (ID ${normalizedCommunity.id})`);
    return;
  }

  communities.push(normalizedCommunity);
  fs.writeFileSync(communitiesPath, JSON.stringify(communities, null, 2));
  console.log(`✔ Comunidad añadida: ${normalizedCommunity.name} (ID ${normalizedCommunity.id})`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
