#!/usr/bin/env node
/**
 * apply-description-translations.js
 *
 * Aplica un fichero de traducciones de `shortDescription` a la fuente de verdad, escribiendo
 * `shortDescriptionI18n` ficha a ficha (ver src/lib/localizedText.js).
 *
 * Existe como script y no a mano porque son 125 ficheros: una tanda a ojo deja a medias las
 * que nadie vuelve a mirar, y aquí la comprobación de que el slug existe y el idioma está en
 * el catálogo corre sobre todas antes de escribir nada.
 *
 * Uso:
 *   node scripts/apply-description-translations.js <fichero.json> [--dry-run]
 *
 * Formato del fichero: { "<slug>": { "<idioma>": "<texto>" } }
 */

import fs from 'node:fs';
import process from 'node:process';

import { COMMUNITY_LANGUAGE_SET } from '../src/lib/communityLanguages.js';
import {
  DESCRIPTION_I18N_KEY,
  dropEmptyDescriptionTranslations,
} from '../src/lib/localizedText.js';
// Fuente de verdad: data/communities/ (el bundle de public/data/ es un artefacto generado).
import { communityFileSlug, readCommunities, writeCommunities } from './lib/communities-store.js';

export function planTranslations(communities, translations) {
  const bySlug = new Map();
  const taken = new Set();

  for (const community of communities) {
    const slug = communityFileSlug(community, { taken });
    taken.add(slug);
    bySlug.set(slug, community);
  }

  const errors = [];
  const changes = [];

  for (const [slug, entry] of Object.entries(translations)) {
    const community = bySlug.get(slug);

    if (!community) {
      errors.push(`${slug}: no existe ninguna comunidad con ese slug.`);
      continue;
    }

    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${slug}: la entrada debe ser un objeto { idioma: texto }.`);
      continue;
    }

    for (const [lang, text] of Object.entries(entry)) {
      if (!COMMUNITY_LANGUAGE_SET.has(lang)) {
        errors.push(`${slug}: idioma fuera del catálogo: "${lang}".`);
      }
      if (typeof text !== 'string' || !text.trim()) {
        errors.push(`${slug}: ${lang} no puede estar vacío.`);
      }
    }

    // Lo que ya está escrito manda: este script rellena huecos, no pisa lo que alguien
    // tradujo a mano después.
    const existing = community[DESCRIPTION_I18N_KEY] ?? {};
    const merged = { ...entry, ...existing };

    if (JSON.stringify(merged) === JSON.stringify(existing)) continue;

    changes.push({ slug, community, translations: merged });
  }

  return { changes, errors };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const file = args.find((arg) => !arg.startsWith('--'));

  if (!file) {
    console.error('Uso: node scripts/apply-description-translations.js <fichero.json> [--dry-run]');
    process.exit(1);
  }

  const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
  const communities = readCommunities();
  const { changes, errors } = planTranslations(communities, translations);

  if (errors.length > 0) {
    console.error('No se ha escrito nada. Problemas encontrados:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  changes.forEach(({ slug, community, translations: merged }) => {
    community[DESCRIPTION_I18N_KEY] = dropEmptyDescriptionTranslations(merged);
    console.log(`${dryRun ? '[dry-run] ' : ''}${slug}: ${Object.keys(merged).join(', ')}`);
  });

  if (!dryRun) {
    writeCommunities(communities);
  }

  console.log(`\n${changes.length} ficha(s) ${dryRun ? 'se actualizarían' : 'actualizadas'}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
