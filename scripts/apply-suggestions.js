/**
 * Aplica las sugerencias revisadas de scripts/suggestions.json a communities.json.
 *
 * Solo aplica entradas donde `approved` no sea false:
 *   - approved: null  → se aplica (comportamiento por defecto: confiar en el scraping)
 *   - approved: true  → se aplica
 *   - approved: false → se descarta
 *
 * Para cada sugerencia aprobada:
 *   - Mergea urls (las claves existentes en la comunidad tienen prioridad)
 *   - Mergea tags (une sin duplicados)
 *   - Mergea targetAudience (une sin duplicados)
 *   - Actualiza status solo si la sugerencia tiene valor y el actual es "Desconocido"
 *
 * Uso:
 *   node scripts/apply-suggestions.js
 *   node scripts/apply-suggestions.js --dry-run   # muestra cambios sin escribir
 *   node scripts/apply-suggestions.js --only-approved  # solo approved: true
 */

import fs from 'fs';
import { mergeDraftUrls, splitDraftUrls, toUrlEntries } from '../src/lib/communityUrls.js';
// Fuente de verdad: data/communities/ (el bundle de public/data/ es un artefacto generado).
import { readCommunities, writeCommunities } from './lib/communities-store.js';

const SUGGESTIONS_PATH = './scripts/suggestions.json';

function comparableUrl(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\/+$/, '');
}

function mergeUrls(existing, suggested, archivedUrls = []) {
  const merged = { ...suggested };
  // Las URLs ya presentes en la comunidad tienen prioridad
  for (const [key, val] of Object.entries(existing)) {
    if (val) merged[key] = val;
  }
  // Un canal archivado (issue #353) no vuelve a entrar como activo por scraping: se
  // archivó justamente porque nadie lo atiende.
  const archived = new Set(archivedUrls.map(comparableUrl));

  return Object.fromEntries(
    Object.entries(merged).filter(([, v]) => v && !archived.has(comparableUrl(v)))
  );
}

function mergeArray(existing, suggested) {
  return Array.from(new Set([...existing, ...suggested]));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun       = args.includes('--dry-run');
  const onlyApproved = args.includes('--only-approved');

  if (!fs.existsSync(SUGGESTIONS_PATH)) {
    console.error(`❌ No se encontró ${SUGGESTIONS_PATH}. Ejecuta primero npm run scrape-community-data.`);
    process.exit(1);
  }

  const communities = readCommunities();
  const suggestions  = JSON.parse(fs.readFileSync(SUGGESTIONS_PATH,  'utf-8'));

  const suggestionMap = {};
  for (const s of suggestions) suggestionMap[s.id] = s;

  let applied = 0;
  let skipped = 0;

  const updated = communities.map(community => {
    const suggestion = suggestionMap[community.id];
    if (!suggestion) return community;

    // Filtrar por aprobación
    if (suggestion.approved === false) { skipped++; return community; }
    if (onlyApproved && suggestion.approved !== true) { skipped++; return community; }

    const { urls: sugUrls, tags: sugTags, targetAudience: sugAudience, contactInfo: sugContact, status: sugStatus } = suggestion.suggestions;

    let changed = false;

    // Merge URLs. `urls` es una lista de pares (#478): se mergea sobre el mapa por clave y
    // los canales que no caben en una clave se conservan tal cual.
    const { primary: urlsByKind, extras: urlExtras } = splitDraftUrls(community.urls);
    const mergedByKind = mergeUrls(urlsByKind, sugUrls ?? {}, community.archivedUrls ?? []);
    const mergedUrls = mergeDraftUrls(mergedByKind, urlExtras);
    if (JSON.stringify(mergedUrls) !== JSON.stringify(toUrlEntries(community.urls))) changed = true;

    // Merge tags
    const mergedTags = mergeArray(community.tags ?? [], sugTags ?? []);
    if (mergedTags.length !== (community.tags ?? []).length) changed = true;

    // Merge targetAudience
    const mergedAudience = mergeArray(community.targetAudience ?? [], sugAudience ?? []);
    if (mergedAudience.length !== (community.targetAudience ?? []).length) changed = true;

    // contactInfo: solo rellenar si la comunidad no tiene uno ya
    const newContact = (!community.contactInfo && sugContact) ? sugContact : community.contactInfo;
    if (newContact !== community.contactInfo) changed = true;

    // Status: solo actualizar si el actual es "Desconocido" y hay sugerencia
    let newStatus = community.status;
    if (sugStatus && community.status === 'unknown') {
      newStatus = sugStatus;
      changed = true;
    }

    if (changed) {
      applied++;
      if (dryRun) {
        console.log(`[DRY] ${community.id} ${community.name}`);
        if (JSON.stringify(mergedUrls) !== JSON.stringify(toUrlEntries(community.urls)))
          console.log(`      urls:        ${JSON.stringify(mergedUrls)}`);
        if (mergedTags.length !== (community.tags ?? []).length)
          console.log(`      tags:        ${JSON.stringify(mergedTags)}`);
        if (mergedAudience.length !== (community.targetAudience ?? []).length)
          console.log(`      audience:    ${JSON.stringify(mergedAudience)}`);
        if (newContact !== community.contactInfo)
          console.log(`      contactInfo: ${community.contactInfo || '(vacío)'} → ${newContact}`);
        if (newStatus !== community.status)
          console.log(`      status:      ${community.status} → ${newStatus}`);
      }
      return { ...community, urls: mergedUrls, tags: mergedTags, targetAudience: mergedAudience, contactInfo: newContact, status: newStatus };
    }

    return community;
  });

  if (dryRun) {
    console.log(`\n[DRY RUN] Se aplicarían cambios a ${applied} comunidades. ${skipped} descartadas.`);
    console.log('Ejecuta sin --dry-run para aplicar.');
  } else {
    writeCommunities(updated);
    console.log(`✅ Cambios aplicados: ${applied} comunidades actualizadas. ${skipped} descartadas.`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
