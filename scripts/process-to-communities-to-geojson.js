// geojson-generator.js
import fs from 'fs/promises';
import path from 'path';

// Palabras clave para descartar ubicaciones dudosas
const invalidLocationPatterns = [
  /sin\s+localidad/i,
  /itinerante/i,
  /sin\s+completar/i,
  /n\/?a/i,
  /no\s+aplica/i,
  /desconocido/i
];

// Función que comprueba si una ubicación es válida
function isValidLocation(location = '') {
  const normalized = location.trim().toLowerCase();
  return !invalidLocationPatterns.some(pattern => pattern.test(normalized));
}

const inputPath = path.resolve('../public/data/communities.json');
const outputPath = path.resolve('../public/data/communities.geojson');

async function generateGeoJSON() {
  try {
    const rawData = await fs.readFile(inputPath, 'utf-8');
    const communities = JSON.parse(rawData);

    const features = communities
      .filter(c =>
        ['Presencial', 'Híbridos'].includes(c.eventFormat) &&
        c.latLon?.lat != null &&
        c.latLon?.lon != null &&
        isValidLocation(c.location)
      )
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
