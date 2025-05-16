// process-to-communities-to-geojson.js
import fs from 'fs/promises';
import path from 'path';

const inputPath = path.resolve('../public/data/communities.json');
const outputPath = path.resolve('../public/data/communities.geojson');

async function generateGeoJSON() {
  try {
    const rawData = await fs.readFile(inputPath, 'utf-8');
    const communities = JSON.parse(rawData);

    // Filtrar únicamente por la propiedad displayOnMap
    const features = communities
      .filter(c => c.displayOnMap === true)
      .map(c => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [c.latLon.lon, c.latLon.lat]
        },
        properties: {
          id: c.id,
          name: c.name,
          status: c.status,
          eventFormat: c.eventFormat,
          location: c.location,
          communityUrl: c.communityUrl,
          thumbnailUrl: c.thumbnailUrl
        }
      }));

    const geojson = {
      type: 'FeatureCollection',
      features
    };

    await fs.writeFile(outputPath, JSON.stringify(geojson, null, 2), 'utf-8');
    console.log(`GeoJSON generado en: ${outputPath}`);
  } catch (error) {
    console.error('Error generando el GeoJSON:', error);
  }
}

generateGeoJSON();