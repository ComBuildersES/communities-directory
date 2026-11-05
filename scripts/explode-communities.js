/**
 * Migración: convierte `public/data/communities.json` en un fichero por comunidad
 * dentro de `data/communities/`.
 *
 * Idempotente: re-ejecutarlo sobre un directorio ya explotado deja el mismo resultado.
 * Tras la migración el bundle pasa a ser un artefacto generado por `compile-communities`.
 */
import fs from 'node:fs';
import process from 'node:process';

import {
  BUNDLE_PATH,
  DELETED_PATH,
  DELETED_SOURCE_DIR,
  SOURCE_DIR,
  communityFileSlug,
  readJsonFile,
  slugifyCommunityName,
  writeCommunities,
  writeDeletedCommunities,
} from './lib/communities-store.js';

const isDryRun = process.argv.includes('--dry-run');

function reportSlugCollisions(communities) {
  const bySlug = new Map();

  for (const community of communities) {
    const slug = slugifyCommunityName(community.name) || `community-${community.id}`;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(community);
  }

  const collisions = [...bySlug.entries()].filter(([, list]) => list.length > 1);

  for (const [slug, list] of collisions) {
    const ids = list.map((community) => community.id).join(', ');
    console.warn(`⚠️ Slug duplicado "${slug}" (ids ${ids}): se desambigua con sufijo numérico.`);
  }

  return collisions.length;
}

function main() {
  const communities = readJsonFile(BUNDLE_PATH, null);

  if (!Array.isArray(communities) || communities.length === 0) {
    console.error(`❌ No se pudo leer ${BUNDLE_PATH} o está vacío.`);
    process.exit(1);
  }

  reportSlugCollisions(communities);

  if (isDryRun) {
    const taken = new Set();
    for (const community of communities) {
      const slug = communityFileSlug(community, { taken });
      taken.add(slug);
    }
    console.log(`(dry-run) ${communities.length} comunidades → ${SOURCE_DIR}/<slug>.json`);
    console.log(`(dry-run) ${taken.size} ficheros distintos`);
    return;
  }

  // Sin recompilar: el bundle actual ya es equivalente y `compile-communities` lo regenera.
  const { written } = writeCommunities(communities, { recompile: false });

  const onDisk = fs.readdirSync(SOURCE_DIR).filter((file) => file.endsWith('.json'));
  console.log(`✔ ${written.length} comunidades escritas en ${SOURCE_DIR}/`);
  console.log(`✔ ${onDisk.length} ficheros en disco`);

  // Las bajas comparten el problema: dos bajas simultáneas chocaban en la cola del JSON.
  const deleted = readJsonFile(DELETED_PATH, []);
  if (Array.isArray(deleted) && deleted.length > 0) {
    const { written: deletedWritten } = writeDeletedCommunities(deleted, { recompile: false });
    console.log(`✔ ${deletedWritten.length} bajas escritas en ${DELETED_SOURCE_DIR}/`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
