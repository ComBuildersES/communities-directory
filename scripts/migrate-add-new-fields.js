/**
 * Migración: añade los campos urls, tags y targetAudience a todas las comunidades
 * existentes en communities.json que no los tengan.
 *
 * - urls: objeto con claves por plataforma (web, meetup, linkedin, ...)
 * - tags: array de IDs referenciando public/data/tags.json
 * - targetAudience: array de IDs referenciando public/data/audience.json
 *
 * Es idempotente: si el campo ya existe no lo sobreescribe.
 *
 * Uso: node scripts/migrate-add-new-fields.js
 */

import fs from 'fs';

const communitiesPath = './public/data/communities.json';

let communities;
try {
  communities = JSON.parse(fs.readFileSync(communitiesPath, 'utf-8'));
} catch (err) {
  console.error('❌ Error al leer communities.json:', err.message);
  process.exit(1);
}

// Orden de campos deseado en el objeto de cada comunidad
function migrateEntry(c) {
  return {
    id:            c.id,
    name:          c.name,
    status:        c.status,
    lastReviewed:  c.lastReviewed,
    communityType: c.communityType,
    eventFormat:   c.eventFormat,
    location:      c.location,
    topics:        c.topics,
    tags:          c.tags          ?? [],
    targetAudience:c.targetAudience ?? [],
    contactInfo:   c.contactInfo,
    communityUrl:  c.communityUrl,
    urls:          c.urls          ?? {},
    thumbnailUrl:  c.thumbnailUrl,
    latLon:        c.latLon,
    displayOnMap:  c.displayOnMap,
  };
}

const migrated = communities.map(migrateEntry);

try {
  fs.writeFileSync(communitiesPath, JSON.stringify(migrated, null, 2), 'utf-8');
  console.log(`✅ Migración completada: ${migrated.length} comunidades actualizadas.`);
} catch (err) {
  console.error('❌ Error al guardar communities.json:', err.message);
  process.exit(1);
}
