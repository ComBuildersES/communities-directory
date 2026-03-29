#!/usr/bin/env node
/**
 * apply-parent-ids.js
 * Aplica los vínculos parentId confirmados (✅) de docs/parentId-mapping-review.md
 * a public/data/communities.json.
 *
 * Uso:
 *   node scripts/apply-parent-ids.js [--dry-run]
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../public/data/communities.json");

// Vínculos confirmados ✅ de parentId-mapping-review.md
// { childId: parentId }
const PARENT_LINKS = {
  // 1. Python España [404]
  546: 404, // Python Barcelona
  555: 404, // Python Bilbao
  403: 404, // Python Coruña
  408: 404, // Python Vigo
  407: 404, // Python Málaga
  405: 404, // Python Granada
  406: 404, // Python Madrid (inactive — incluida, ver pregunta 6)
  570: 404, // Python Sevilla

  // 2. GDG Spain [207]
  206: 207, // GDG Sevilla
  195: 207, // GDG A Coruña
  202: 207, // GDG Madrid
  209: 207, // GDG Valencia
  198: 207, // GDG Granada
  203: 207, // GDG Málaga
  201: 207, // GDG La Rioja
  208: 207, // GDG Toledo
  200: 207, // GDG Jaén
  587: 207, // GDG Alicante
  205: 207, // GDG Ponferrada
  543: 207, // GDG Menorca
  604: 207, // GDG Girona

  // 3. GDG Cloud Español [196]
  197: 196, // GDG Cloud Madrid (inactive)

  // 4. Sysarmy [438]
  439: 438, // Sysarmy Galicia

  // 5. Wordpress Meetup Groups [512]
  489: 512, // WordPress Alicante
  490: 512, // WordPress Barcelona
  492: 512, // WordPress Bilbao
  499: 512, // Ferrolterra WordPress
  518: 512, // WordPress Sevilla
  525: 512, // WordPress Valencia
  529: 512, // WordPress Zaragoza

  // 6. Asociación Española de Drupal [39]
  164: 39, // Drupal Madrid
  152: 39, // Drupal Asturias
  150: 39, // Drupal Alicante
  151: 39, // Drupal Almería
  153: 39, // Drupal Cádiz
  154: 39, // Drupal Castellón
  155: 39, // Drupal Castilla y León
  156: 39, // Drupal Comunidad Valenciana
  157: 39, // Drupal Comunitat catalana del Drupal
  159: 39, // Drupal Euskadi
  160: 39, // Drupal Extremadura
  161: 39, // Drupal Galiza Drupal Group
  162: 39, // Drupal Granada
  163: 39, // Drupal León
  165: 39, // Drupal Malaga
  166: 39, // Drupal Region de Murcia y Cartagena
  167: 39, // Drupal Sevilla
  168: 39, // Drupal Zaragoza y alrededores

  // 7. MuleSoft Meetups [355]
  353: 355, // Mulesoft Barcelona
  354: 355, // Mulesoft Madrid

  // 8. Docker User Groups [142]
  141: 142, // Docker Madrid (inactive)

  // 9. PyData [399]
  400: 399, // PyData Granada
  401: 399, // PyData Madrid

  // 10. Global AI Community [214]
  550: 214, // Global AI Ponferrada

  // 11. Java User Groups [302]
  114: 302, // CoruñaJUG
  333: 302, // MadridJUG
  344: 302, // MálagaJUG
  537: 302, // Barcelona Java User Group
  227: 302, // GranadaJUG

  // 12. Cloud Native [79]
  80: 79,  // Cloud Native (CNCF) Barcelona
  82: 79,  // Cloud Native (CNCF) Galicia
  83: 79,  // Cloud Native (CNCF) Granada
  84: 79,  // Cloud Native (CNCF) Madrid
  86: 79,  // Cloud Native (CNCF) Mallorca
  87: 79,  // Cloud Native (CNCF) Rioja
  88: 79,  // Cloud Native (CNCF) Sevilla
  89: 79,  // Cloud Native (CNCF) Valencia
  81: 79,  // Cloud Native (CNCF) Bilbao (unknown)
  85: 79,  // Cloud Native (CNCF) Malaga (unknown)

  // 13. Codebar [92]
  93: 92,  // Codebar Barcelona

  // 14. Comunidad de R Hispano [103]
  36: 103,  // Asociación de usuarios de R de Castilla-La Mancha
  230: 103, // Grupo de Usuarios de R de Madrid
  534: 103, // Xornada de Usuarios de R en Galicia
  234: 103, // Grupo usuarios de R de Canarias (unknown)

  // 15. Wordcamp [483]
  484: 483, // WordCamp Alhaurín de la Torre
  485: 483, // Wordcamp Granada
  486: 483, // Wordcamp Griñón
  487: 483, // Wordcamp Sevilla
};

const isDryRun = process.argv.includes("--dry-run");

const communities = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const idSet = new Set(communities.map((c) => c.id));

// Validate all IDs exist
let validationErrors = 0;
for (const [childId, parentId] of Object.entries(PARENT_LINKS)) {
  if (!idSet.has(Number(childId))) {
    console.error(`❌ Child ID ${childId} not found in communities.json`);
    validationErrors++;
  }
  if (!idSet.has(Number(parentId))) {
    console.error(`❌ Parent ID ${parentId} not found in communities.json`);
    validationErrors++;
  }
}
if (validationErrors > 0) {
  console.error(`\n${validationErrors} validation error(s). Aborting.`);
  process.exit(1);
}

let applied = 0;
let skipped = 0;

const updated = communities.map((c) => {
  const parentId = PARENT_LINKS[c.id];
  if (parentId === undefined) return c;

  if (c.parentId === parentId) {
    skipped++;
    return c;
  }

  if (isDryRun) {
    console.log(`[dry-run] id=${c.id} "${c.name}" → parentId=${parentId}`);
  } else {
    console.log(`✅ id=${c.id} "${c.name}" → parentId=${parentId}`);
  }
  applied++;
  return { ...c, parentId };
});

console.log(`\n${applied} vínculos ${isDryRun ? "a aplicar" : "aplicados"}, ${skipped} ya existían.`);

if (!isDryRun) {
  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + "\n", "utf-8");
  console.log("communities.json actualizado.");
}

export { PARENT_LINKS };
