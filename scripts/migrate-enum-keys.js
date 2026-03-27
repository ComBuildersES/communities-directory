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
import fs from 'fs';

const COMMUNITIES_PATH = './public/data/communities.json';
const GEOJSON_PATH = './public/data/communities.geojson';

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

  if (!fs.existsSync(COMMUNITIES_PATH)) {
    console.error(`❌ No se encontró ${COMMUNITIES_PATH}`);
    process.exit(1);
  }

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_PATH, 'utf-8'));
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

  fs.writeFileSync(COMMUNITIES_PATH, `${JSON.stringify(updatedCommunities, null, 2)}\n`, 'utf-8');
  console.log(`✅ communities.json: ${totalChanged} comunidades migradas.`);

  // Migrate geojson if it exists
  if (!fs.existsSync(GEOJSON_PATH)) {
    console.warn(`⚠️  No se encontró ${GEOJSON_PATH} — omitido.`);
    return;
  }

  const geojson = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf-8'));
  let geoChanged = 0;

  const updatedFeatures = geojson.features.map((feature) => {
    const props = feature.properties;
    const { updated, changes } = migrateCommunity(props);
    if (changes.length > 0) geoChanged++;
    return { ...feature, properties: updated };
  });

  const updatedGeojson = { ...geojson, features: updatedFeatures };
  fs.writeFileSync(GEOJSON_PATH, `${JSON.stringify(updatedGeojson, null, 2)}\n`, 'utf-8');
  console.log(`✅ communities.geojson: ${geoChanged} features migradas.`);
}

main();
