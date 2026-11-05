/**
 * Compila los artefactos de datos desde la fuente de verdad (`data/communities/`).
 *
 * Salidas (gitignoradas, nunca se editan a mano):
 *   - public/data/communities.json
 *   - public/data/communities.geojson
 *   - public/data/deleted-communities.json
 *
 * Se ejecuta en `prebuild`, así que `npm run build` y el deploy siempre parten de la fuente.
 */
import fs from 'node:fs';
import process from 'node:process';
import {
  BUNDLE_PATH,
  DELETED_PATH,
  GEOJSON_PATH,
  compileBundle,
  compileDeletedBundle,
  hasSourceDir,
} from './lib/communities-store.js';

/**
 * Las comunidades `hidden` no se publican: el store de la app ya las descarta, y dejarlas
 * fuera del GeoJSON evita que se filtren por el visor de `public/viewer/`.
 */
export function buildGeoJson(communities) {
  const features = communities
    .filter((community) => community.displayOnMap === true && community.hidden !== true)
    .map((community) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [community.latLon.lon, community.latLon.lat],
      },
      properties: {
        id: community.id,
        name: community.name,
        status: community.status,
        lastReviewed: community.lastReviewed,
        communityType: community.communityType,
        eventFormat: community.eventFormat,
        location: community.location,
        topics: community.topics,
        langs: community.langs,
        tags: community.tags,
        targetAudience: community.targetAudience,
        contactInfo: community.contactInfo,
        communityUrl: community.communityUrl,
        urls: community.urls,
        thumbnailUrl: community.thumbnailUrl,
        humanValidated: community.humanValidated,
      },
    }));

  return { type: 'FeatureCollection', features };
}

export function compileAll() {
  if (!hasSourceDir()) {
    throw new Error(
      'No hay ficheros fuente en data/communities/. Ejecuta `npm run explode-communities` primero.'
    );
  }

  const communities = compileBundle();
  const geojson = buildGeoJson(communities);
  fs.writeFileSync(GEOJSON_PATH, `${JSON.stringify(geojson, null, 2)}\n`);
  const deleted = compileDeletedBundle();

  return { communities, features: geojson.features.length, deleted: deleted.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { communities, features, deleted } = compileAll();
    console.log(`✔ ${BUNDLE_PATH}: ${communities.length} comunidades`);
    console.log(`✔ ${GEOJSON_PATH}: ${features} features`);
    console.log(`✔ ${DELETED_PATH}: ${deleted} bajas`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}
