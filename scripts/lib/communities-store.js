import fs from 'node:fs';
import path from 'node:path';

/**
 * Fuente de verdad del directorio: un fichero por comunidad en `data/communities/`.
 *
 * `public/data/communities.json` y `public/data/communities.geojson` son artefactos
 * generados (gitignorados) que se compilan desde esos ficheros. Mantener una comunidad
 * por fichero evita que dos propuestas simultáneas toquen las mismas líneas: el conflicto
 * de merge deja de ser posible por construcción, igual que ya ocurría con las imágenes.
 */

export const SOURCE_DIR = 'data/communities';
export const DELETED_SOURCE_DIR = 'data/deleted-communities';
export const BUNDLE_PATH = 'public/data/communities.json';
export const GEOJSON_PATH = 'public/data/communities.geojson';
export const DELETED_PATH = 'public/data/deleted-communities.json';
export const META_PATH = 'public/data/communities.meta.json';

/**
 * Orden canónico de claves al serializar. Mantenerlo estable hace que el diff de un
 * fichero de comunidad refleje solo los campos que realmente cambian.
 */
const CANONICAL_KEY_ORDER = [
  'id',
  'name',
  'status',
  'hidden',
  'lastReviewed',
  'communityType',
  'eventFormat',
  'location',
  'provinceId',
  'parentId',
  'shortDescription',
  'topics',
  'langs',
  'tags',
  'targetAudience',
  'matchesAllTags',
  'matchesAllAudience',
  'contactInfo',
  'communityUrl',
  'urls',
  'archivedUrls',
  'thumbnailUrl',
  'latLon',
  'displayOnMap',
  'humanValidated',
];

const DELETED_KEY_ORDER = [
  'id',
  'name',
  'communityUrl',
  'deletedAt',
  'removalReason',
  'deletedFromIssue',
];

/**
 * Debe producir el mismo resultado que `slugifyCommunityName` en
 * `src/lib/communitySubmission.js`: los deep links por slug dependen de esa equivalencia.
 */
export function slugifyCommunityName(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug de fichero para una comunidad. `taken` permite desambiguar nombres que colapsan
 * al mismo slug (hoy no ocurre con ningún registro, pero nada lo impide a futuro).
 */
export function communityFileSlug(community, { taken } = {}) {
  const base = slugifyCommunityName(community?.name)
    || (Number.isInteger(community?.id) ? `community-${community.id}` : 'community');

  if (!taken || !taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function sortKeys(record, order) {
  const known = order.filter((key) => key in record);
  const extra = Object.keys(record)
    .filter((key) => !order.includes(key))
    .sort();

  return Object.fromEntries([...known, ...extra].map((key) => [key, record[key]]));
}

function sortCommunityKeys(community) {
  return sortKeys(community, CANONICAL_KEY_ORDER);
}

/**
 * Serialización estable para comparar dos registros: ordena las claves en profundidad.
 *
 * Las comparaciones de "¿ha cambiado esta comunidad?" usaban `JSON.stringify` directo, que
 * es sensible al orden de claves. Al normalizar el orden al escribir, ese comparador habría
 * marcado las 631 comunidades como modificadas en cada PR.
 */
export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value) ?? 'null';
}

function serializeCommunity(community) {
  return `${JSON.stringify(sortCommunityKeys(community), null, 2)}\n`;
}

function sourceFilePath(slug) {
  return path.join(SOURCE_DIR, `${slug}.json`);
}

export function hasSourceDir() {
  if (!fs.existsSync(SOURCE_DIR)) return false;
  return listSourceSlugs().length > 0;
}

function listSourceSlugs(dir = SOURCE_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -'.json'.length))
    .sort();
}

/**
 * Orden del bundle: por `id` ascendente, y las comunidades aún sin `id` asignado al final
 * por slug. La lista que consume la UI se reordena en `CommunitiesList`, así que este orden
 * solo busca ser determinista para que el artefacto sea reproducible.
 */
function compareCommunities(a, b) {
  const aId = Number.isInteger(a.id) ? a.id : Number.POSITIVE_INFINITY;
  const bId = Number.isInteger(b.id) ? b.id : Number.POSITIVE_INFINITY;
  if (aId !== bId) return aId - bId;
  return slugifyCommunityName(a.name).localeCompare(slugifyCommunityName(b.name));
}

/** Lee todas las comunidades fuente como `[{ slug, filePath, community }]`. */
export function readCommunityFiles() {
  if (!hasSourceDir()) {
    // Antes de la migración (o en un checkout sin explotar) el bundle sigue siendo la fuente.
    return readJsonFile(BUNDLE_PATH, []).map((community) => ({
      slug: communityFileSlug(community),
      filePath: null,
      community,
    }));
  }

  return listSourceSlugs()
    .map((slug) => {
      const filePath = sourceFilePath(slug);
      let community;
      try {
        community = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (error) {
        throw new Error(`No se pudo parsear ${filePath}: ${error.message}`);
      }
      return { slug, filePath, community };
    })
    .sort((a, b) => compareCommunities(a.community, b.community));
}

/** Lee las comunidades en el mismo formato que exponía `communities.json`. */
export function readCommunities() {
  return readCommunityFiles().map((entry) => entry.community);
}

export function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Escribe una sola comunidad. Si el nombre cambió, el fichero se renombra al nuevo slug
 * para que la ruta siga siendo legible; la identidad real es el `id` (o el slug previo).
 */
export function writeCommunity(community, { recompile = true } = {}) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });

  const existing = hasSourceDir() ? readCommunityFiles() : [];
  const previous = existing.find((entry) => (
    Number.isInteger(community.id) && entry.community.id === community.id
  ));

  const taken = new Set(
    existing
      .filter((entry) => entry !== previous)
      .map((entry) => entry.slug)
  );
  const slug = communityFileSlug(community, { taken });

  if (previous && previous.slug !== slug && previous.filePath) {
    fs.rmSync(previous.filePath, { force: true });
  }

  fs.writeFileSync(sourceFilePath(slug), serializeCommunity(community));

  if (recompile) compileBundle();

  return { slug, filePath: sourceFilePath(slug) };
}

/** Borra el fichero fuente de una comunidad por `id`. Devuelve el slug eliminado. */
export function removeCommunity(id, { recompile = true } = {}) {
  const entry = readCommunityFiles().find((item) => String(item.community.id) === String(id));
  if (!entry || !entry.filePath) return null;

  fs.rmSync(entry.filePath, { force: true });
  if (recompile) compileBundle();

  return entry.slug;
}

/**
 * Sincroniza el directorio fuente con la lista completa recibida: crea, actualiza y elimina
 * los ficheros necesarios. Es el punto de entrada para los scripts de mantenimiento que
 * hasta ahora reescribían `communities.json` entero.
 */
export function writeCommunities(communities, { recompile = true } = {}) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });

  const previousBySlug = new Map(
    (hasSourceDir() ? readCommunityFiles() : []).map((entry) => [entry.slug, entry])
  );
  const taken = new Set();
  const written = new Set();

  for (const community of communities) {
    const slug = communityFileSlug(community, { taken });

    taken.add(slug);
    written.add(slug);
    fs.writeFileSync(sourceFilePath(slug), serializeCommunity(community));
  }

  for (const [slug, entry] of previousBySlug) {
    if (written.has(slug) || !entry.filePath) continue;
    fs.rmSync(entry.filePath, { force: true });
  }

  if (recompile) compileBundle();

  return { written: [...written] };
}

/**
 * Compila `public/data/communities.json` desde los ficheros fuente.
 *
 * Las comunidades sin `id` quedan fuera: el id se asigna ya en master
 * (`assign-community-ids`), y publicar un registro con `id: null` expondría a la app un
 * estado transitorio sin identificador estable. El commit de asignación dispara un deploy
 * nuevo, que es el que publica la comunidad.
 */
export function compileBundle() {
  const all = readCommunities();
  const communities = all.filter((community) => Number.isInteger(community.id));
  const pending = all.length - communities.length;

  if (pending > 0) {
    console.warn(`⚠️ ${pending} comunidad(es) sin id aún: no se publican hasta que assign-community-ids les asigne uno.`);
  }

  writeJsonFile(BUNDLE_PATH, communities);
  return communities;
}

/** Mayor `id` conocido, incluyendo las comunidades dadas de baja para no reutilizarlo. */
export function getMaxKnownCommunityId(communities = readCommunities(), deleted = readDeletedCommunities()) {
  const ids = [...(communities ?? []), ...(deleted ?? [])]
    .map((community) => community?.id)
    .filter((id) => Number.isInteger(id));

  return ids.length > 0 ? Math.max(...ids) : 0;
}

/**
 * Asigna `id` a las comunidades que aún no lo tienen.
 *
 * Se ejecuta en `master` (serializado por el `concurrency` del workflow), no en la rama de
 * la propuesta: así dos propuestas simultáneas no pueden reclamar el mismo `id`, sea cual
 * sea su origen (issue, PR manual o script). Mientras una comunidad no tiene `id`, sus
 * enlaces siguen funcionando por slug.
 */
export function assignMissingIds({ recompile = true, dryRun = false } = {}) {
  const entries = readCommunityFiles();
  const pending = entries.filter((entry) => !Number.isInteger(entry.community.id));
  const meta = readJsonFile(META_PATH, { nextCommunityId: 1 });
  const metaNext = Number.isInteger(meta?.nextCommunityId) && meta.nextCommunityId > 0
    ? meta.nextCommunityId
    : 1;

  let nextId = Math.max(metaNext, getMaxKnownCommunityId() + 1);

  if (pending.length === 0) {
    return { assigned: [], nextCommunityId: nextId };
  }

  const assigned = [];

  // Orden por slug: determinista e independiente del orden de lectura del directorio.
  for (const entry of [...pending].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const community = { ...entry.community, id: nextId };
    if (!dryRun) {
      fs.writeFileSync(sourceFilePath(entry.slug), serializeCommunity(community));
    }
    assigned.push({ slug: entry.slug, id: nextId, name: community.name });
    nextId += 1;
  }

  if (dryRun) {
    return { assigned, nextCommunityId: nextId };
  }

  writeJsonFile(META_PATH, { ...(meta ?? {}), nextCommunityId: nextId });
  if (recompile) compileBundle();

  return { assigned, nextCommunityId: nextId };
}

// --- Comunidades dadas de baja -------------------------------------------------------
//
// Mismo motivo que las activas: un fichero por baja evita que dos propuestas de baja
// simultáneas conflicten en la cola de un único JSON (issue #437).

function deletedFilePath(slug) {
  return path.join(DELETED_SOURCE_DIR, `${slug}.json`);
}

function serializeDeleted(entry) {
  return `${JSON.stringify(sortKeys(entry, DELETED_KEY_ORDER), null, 2)}\n`;
}

export function hasDeletedSourceDir() {
  return listSourceSlugs(DELETED_SOURCE_DIR).length > 0;
}

/** Bajas en el formato que exponía `deleted-communities.json`, ordenadas por id. */
export function readDeletedCommunities() {
  if (!hasDeletedSourceDir()) {
    // Antes de la migración (o en un checkout sin explotar) el bundle sigue siendo la fuente.
    return readJsonFile(DELETED_PATH, []);
  }

  return listSourceSlugs(DELETED_SOURCE_DIR)
    .map((slug) => {
      const filePath = deletedFilePath(slug);
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (error) {
        throw new Error(`No se pudo parsear ${filePath}: ${error.message}`);
      }
    })
    .sort((a, b) => {
      const aId = Number.isInteger(a.id) ? a.id : Number.POSITIVE_INFINITY;
      const bId = Number.isInteger(b.id) ? b.id : Number.POSITIVE_INFINITY;
      if (aId !== bId) return aId - bId;
      return slugifyCommunityName(a.name).localeCompare(slugifyCommunityName(b.name));
    });
}

/** Añade una baja como fichero propio. */
export function writeDeletedCommunity(entry, { recompile = true } = {}) {
  fs.mkdirSync(DELETED_SOURCE_DIR, { recursive: true });

  const taken = new Set(listSourceSlugs(DELETED_SOURCE_DIR));
  const slug = communityFileSlug(entry, { taken });

  fs.writeFileSync(deletedFilePath(slug), serializeDeleted(entry));
  if (recompile) compileDeletedBundle();

  return { slug, filePath: deletedFilePath(slug) };
}

/** Sincroniza el directorio de bajas con la lista completa recibida. */
export function writeDeletedCommunities(entries, { recompile = true } = {}) {
  fs.mkdirSync(DELETED_SOURCE_DIR, { recursive: true });

  const previous = new Set(listSourceSlugs(DELETED_SOURCE_DIR));
  const taken = new Set();

  for (const entry of entries) {
    const slug = communityFileSlug(entry, { taken });
    taken.add(slug);
    fs.writeFileSync(deletedFilePath(slug), serializeDeleted(entry));
  }

  for (const slug of previous) {
    if (taken.has(slug)) continue;
    fs.rmSync(deletedFilePath(slug), { force: true });
  }

  if (recompile) compileDeletedBundle();

  return { written: [...taken] };
}

/** Compila `public/data/deleted-communities.json` desde los ficheros fuente. */
export function compileDeletedBundle() {
  const entries = readDeletedCommunities();
  writeJsonFile(DELETED_PATH, entries);
  return entries;
}
