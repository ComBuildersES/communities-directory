/**
 * Asigna `id` a las comunidades que llegaron sin él.
 *
 * Se ejecuta SOLO en `master` (workflow `assign-community-ids.yml`, serializado por su
 * `concurrency` group). Asignar el id en la rama de la propuesta es lo que provocaba que
 * dos propuestas simultáneas reclamasen el mismo id; haciéndolo aquí la colisión es
 * imposible sea cual sea el origen de la propuesta (issue, PR manual o script).
 *
 * Mientras una comunidad no tiene id, sigue siendo enlazable por slug
 * (`resolveCommunityFromIdentifier` en src/lib/communitySubmission.js).
 */
import fs from 'node:fs';
import process from 'node:process';

import { assignMissingIds } from './lib/communities-store.js';

const isDryRun = process.argv.includes('--dry-run');

function main() {
  const { assigned, nextCommunityId } = assignMissingIds({ dryRun: isDryRun });
  const prefix = isDryRun ? '(dry-run)' : '✔';

  if (assigned.length === 0) {
    console.log(`${prefix} No hay comunidades pendientes de id.`);
    return;
  }

  assigned.forEach(({ slug, id, name }) => console.log(`${prefix} ${slug} → id ${id} (${name})`));
  console.log(`${prefix} nextCommunityId: ${nextCommunityId}`);

  // Consumido por el workflow para decidir si hay commit y con qué mensaje.
  if (!isDryRun && process.env.GITHUB_OUTPUT) {
    const summary = assigned.map(({ slug, id }) => `${slug}#${id}`).join(', ');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `assigned=${assigned.length}\nsummary=${summary}\n`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
