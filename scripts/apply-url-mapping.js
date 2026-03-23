/**
 * Aplica el mapeo de URLs alternativas definido en scripts/url-mapping.json
 * a las comunidades de communities.json.
 *
 * Para cada entrada del mapeo:
 *   - Busca la comunidad cuyo communityUrl coincida con twitterUrl (normalizado)
 *   - Clasifica las additionalUrls por plataforma y las añade al campo urls{}
 *   - Mueve el twitterUrl al campo urls.twitter si aún no está ahí
 *   - Aplica statusHint si la comunidad tiene status "Desconocido" o si el hint
 *     es "Inactiva" y el status actual es "Activa" (requiere --force-status)
 *
 * Uso:
 *   node scripts/apply-url-mapping.js             # aplica los cambios
 *   node scripts/apply-url-mapping.js --dry-run   # muestra sin escribir
 *   node scripts/apply-url-mapping.js --force-status  # sobreescribe status aunque sea "Activa"
 */

import fs from 'fs';

const COMMUNITIES_PATH = './public/data/communities.json';
const MAPPING_PATH     = './scripts/url-mapping.json';

// ─── Clasificación de URLs por plataforma ────────────────────────────────────

const PLATFORM_PATTERNS = [
  { key: 'eventsUrl', re: /\b(meetup\.com|eventbrite\.(com|es)|lu\.ma|gdg\.community\.dev|community\.cncf\.io|trailblazercommunitygroups\.com|wordcamp\.org|meetups\.mulesoft\.com|saraos\.tech)\b/i },
  { key: 'youtube',   re: /\b(youtube\.com|youtu\.be)\b/i },
  { key: 'github',    re: /\bgithub\.com\b/i },
  { key: 'telegram',  re: /\b(t\.me|telegram\.me)\b/i },
  { key: 'whatsapp',  re: /\b(wa\.me|chat\.whatsapp\.com|whatsapp\.com)\b/i },
  { key: 'slack',     re: /\b(join\.slack\.com|slack\.com)\b/i },
  { key: 'discord',   re: /\b(discord\.gg|discord\.com\/invite)\b/i },
  { key: 'instagram', re: /\binstagram\.com\b/i },
  { key: 'linkedin',  re: /\blinkedin\.com\b/i },
  { key: 'facebook',  re: /\bfacebook\.com\b/i },
  { key: 'twitch',    re: /\btwitch\.tv\b/i },
  { key: 'linkAggregator', re: /\b(linktr\.ee|beacons\.ai|campsite\.bio|bio\.link|lnk\.bio|solo\.to|taplink\.cc|allmylinks\.com)\b/i },
  { key: 'mailingList', re: /\b(substack\.com|buttondown\.email|mailchimp\.com|tinyletter\.com|groups\.google\.com|googlegroups\.com|groups\.io)\b/i },
  { key: 'mastodon',  re: /\/@[\w.-]+$/ },   // patrón ActivityPub: /user en cualquier instancia
  { key: 'bluesky',   re: /\bbsky\.app\b/i },
  { key: 'twitter',   re: /\b(twitter\.com|x\.com)\b/i },
];

function classifyUrl(url) {
  for (const { key, re } of PLATFORM_PATTERNS) {
    if (re.test(url)) return key;
  }
  return 'web';
}

// ─── Normalización de URLs para matching ────────────────────────────────────

function normalizeUrl(url) {
  try {
    const u = new URL(url.trim().toLowerCase());
    // Ignorar query params y hash para el matching
    return `${u.hostname}${u.pathname}`.replace(/\/+$/, '');
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, '');
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args         = process.argv.slice(2);
  const dryRun       = args.includes('--dry-run');
  const forceStatus  = args.includes('--force-status');

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_PATH, 'utf-8'));
  const mapping     = JSON.parse(fs.readFileSync(MAPPING_PATH,     'utf-8'));

  // Índice para buscar comunidades por communityUrl o urls.twitter normalizados
  const byUrl = new Map();
  for (const c of communities) {
    if (c.communityUrl) byUrl.set(normalizeUrl(c.communityUrl), c.id);
    if (c.urls?.twitter) byUrl.set(normalizeUrl(c.urls.twitter), c.id);
  }

  let matched   = 0;
  let unmatched = 0;
  let changed   = 0;

  for (const entry of mapping) {
    const { twitterUrl, additionalUrls, statusHint, note } = entry;

    // Buscar comunidad
    const normalizedTwitter = normalizeUrl(twitterUrl);
    const communityId = byUrl.get(normalizedTwitter);

    if (communityId === undefined) {
      console.warn(`⚠️  Sin match: ${twitterUrl}`);
      unmatched++;
      continue;
    }

    matched++;
    const community = communities.find(c => c.id === communityId);
    const before    = JSON.stringify(community);

    // Inicializar urls si no existe
    if (!community.urls) community.urls = {};

    // Mover communityUrl a urls.twitter si no está ya registrado
    if (!community.urls.twitter) {
      community.urls.twitter = twitterUrl.replace(/\/$/, ''); // normalizar trailing slash
    }

    // Clasificar y añadir las URLs adicionales (sin sobreescribir existentes)
    for (const url of (additionalUrls || [])) {
      if (!url || url.startsWith('t.co/')) continue; // saltar t.co no resolubles
      const platform = classifyUrl(url);
      if (!community.urls[platform]) {
        community.urls[platform] = url;
      }
    }

    // Actualizar communityUrl a la URL web si hay una y la actual es Twitter
    const newWeb = community.urls.web;
    if (newWeb && /\b(twitter\.com|x\.com)\b/i.test(community.communityUrl)) {
      community.communityUrl = newWeb;
    }

    // Status hint
    if (statusHint) {
      const canUpdate =
        community.status === 'Desconocido' ||
        (forceStatus && statusHint === 'Inactiva');
      if (canUpdate) community.status = statusHint;
    }

    const after = JSON.stringify(community);
    if (before !== after) {
      changed++;
      if (dryRun) {
        console.log(`[DRY] id:${community.id} ${community.name}`);
        console.log(`      communityUrl: ${JSON.parse(before).communityUrl} → ${community.communityUrl}`);
        console.log(`      urls:   ${JSON.stringify(community.urls)}`);
        if (JSON.parse(before).status !== community.status)
          console.log(`      status: ${JSON.parse(before).status} → ${community.status}`);
        if (note) console.log(`      nota:   ${note}`);
      }
    }
  }

  if (!dryRun) {
    fs.writeFileSync(COMMUNITIES_PATH, JSON.stringify(communities, null, 2), 'utf-8');
  }

  const mode = dryRun ? '[DRY RUN] ' : '';
  console.log(`\n${mode}Resultado:`);
  console.log(`  Comunidades encontradas : ${matched}/${mapping.length}`);
  console.log(`  Sin match               : ${unmatched}`);
  console.log(`  Con cambios aplicados   : ${changed}`);
  if (unmatched > 0) console.log(`\n  Revisa los avisos ⚠️  para las entradas sin match.`);
  if (dryRun) console.log(`\n  Ejecuta sin --dry-run para aplicar.`);
}

main();
