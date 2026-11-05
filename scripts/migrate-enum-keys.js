/**
 * Migrates Spanish enum strings in communities.json and communities.geojson
 * to language-neutral keys.
 *
 * Mappings:
 *   status:        Activa → active, Inactiva → inactive, Desconocido → unknown
 *   eventFormat:   Presencial → in-person, Online → online, Híbridos → hybrid, Desconocido → unknown
 *   communityType: Tech Meetup → tech-meetup, Conferencia → conference,
 *                  Organización paraguas → umbrella-org, Hacklab → hacklab,
 *                  Grupo colaborativo → collaborative-group,
 *                  Meta comunidad → meta-community,
 *                  Grupo de ayuda mutua → mutual-aid
 *
 * Usage:
 *   node scripts/migrate-enum-keys.js --dry-run   # preview changes
 *   node scripts/migrate-enum-keys.js             # apply changes
 */

/* eslint-env node */
// Fuente de verdad: data/communities/ (el bundle de public/data/ es un artefacto generado).
import { hasSourceDir, readCommunities, writeCommunities } from './lib/communities-store.js';



const STATUS_MAP = {
  'Activa':      'active',
  'Inactiva':    'inactive',
  'Desconocido': 'unknown',
};

const EVENT_FORMAT_MAP = {
  'Presencial':  'in-person',
  'Online':      'online',
  'Híbridos':    'hybrid',
  'Hibridos':    'hybrid',   // fix existing typo
  'Desconocido': 'unknown',
};

const COMMUNITY_TYPE_MAP = {
  'Tech Meetup':          'tech-meetup',
  'Conferencia':          'conference',
  'Organización paraguas': 'umbrella-org',
  'Hacklab':              'hacklab',
  'Grupo colaborativo':   'collaborative-group',
  'Meta comunidad':       'meta-community',
  'Grupo de ayuda mutua': 'mutual-aid',
};

function migrateCommunity(community) {
  const changes = [];
  const updated = { ...community };

  if (community.status && STATUS_MAP[community.status]) {
    changes.push(`status: "${community.status}" → "${STATUS_MAP[community.status]}"`);
    updated.status = STATUS_MAP[community.status];
  }

  if (community.eventFormat && EVENT_FORMAT_MAP[community.eventFormat]) {
    changes.push(`eventFormat: "${community.eventFormat}" → "${EVENT_FORMAT_MAP[community.eventFormat]}"`);
    updated.eventFormat = EVENT_FORMAT_MAP[community.eventFormat];
  }

  if (community.communityType && COMMUNITY_TYPE_MAP[community.communityType]) {
    changes.push(`communityType: "${community.communityType}" → "${COMMUNITY_TYPE_MAP[community.communityType]}"`);
    updated.communityType = COMMUNITY_TYPE_MAP[community.communityType];
  }

  return { updated, changes };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (!hasSourceDir()) {
    console.error('❌ No hay ficheros fuente en data/communities/');
    process.exit(1);
  }

  const communities = readCommunities();
  let totalChanged = 0;

  const updatedCommunities = communities.map((community) => {
    const { updated, changes } = migrateCommunity(community);
    if (changes.length > 0) {
      totalChanged++;
      if (dryRun) {
        console.log(`[DRY] ${community.id} ${community.name}`);
        changes.forEach((c) => console.log(`      ${c}`));
      }
    }
    return updated;
  });

  if (dryRun) {
    console.log(`\n[DRY RUN] ${totalChanged} comunidades a migrar de ${communities.length}.`);
    console.log('Ejecuta sin --dry-run para aplicar.');
    return;
  }

  // El GeoJSON no se migra: es un artefacto que `writeCommunities` regenera desde la fuente.
  writeCommunities(updatedCommunities);
  console.log(`✅ data/communities/: ${totalChanged} comunidades migradas.`);
}

main();
