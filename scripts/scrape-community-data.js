/**
 * Scraping de datos de comunidades con Playwright.
 *
 * Para cada comunidad visita su communityUrl y extrae:
 *   - URLs de redes sociales/plataformas (eventsUrl, linkedin, discord, telegram, etc.)
 *   - Tags sugeridos (match contra public/data/tags.json usando label + synonyms)
 *   - Hint de estado activa/inactiva (solo para páginas de meetup.com)
 *
 * El resultado se guarda en scripts/suggestions.json para revisión humana
 * antes de aplicar los cambios con apply-suggestions.js.
 *
 * Uso:
 *   node scripts/scrape-community-data.js              # todas las comunidades
 *   node scripts/scrape-community-data.js --start 0 --end 50
 *   node scripts/scrape-community-data.js --id 42
 *   node scripts/scrape-community-data.js --resume     # salta las ya procesadas
 *
 * Requisitos:
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ─── Configuración ────────────────────────────────────────────────────────────

const COMMUNITIES_PATH  = './public/data/communities.json';
const TAGS_PATH         = './public/data/tags.json';
const AUDIENCE_PATH     = './public/data/audience.json';
const SUGGESTIONS_PATH  = './scripts/suggestions.json';

const PAGE_TIMEOUT      = 12000;  // ms por página
const DELAY_MS          = 1200;   // ms entre peticiones (respetuoso con los servidores)
const MAX_TEXT_LENGTH   = 8000;   // chars de texto a analizar por página
const MIN_TAG_CHARS     = 4;      // longitud mínima de un término para considerarlo match

// Plataformas detectables por patrón de URL
const PLATFORM_PATTERNS = {
  eventsUrl: /\b(meetup\.com|eventbrite\.(com|es)|lu\.ma|gdg\.community\.dev|community\.cncf\.io|trailblazercommunitygroups\.com|wordcamp\.org|meetups\.mulesoft\.com|saraos\.tech)\b/i,
  linkedin:  /\blinkedin\.com\/(company|in|school|groups)\b/i,
  twitter:   /\b(twitter\.com|x\.com)\b/i,
  instagram: /\binstagram\.com\b/i,
  youtube:   /\b(youtube\.com\/(channel|c\/|@|user)|youtu\.be)\b/i,
  discord:   /\b(discord\.gg|discord\.com\/invite)\b/i,
  telegram:  /\b(t\.me|telegram\.me)\b/i,
  whatsapp:  /\b(wa\.me|chat\.whatsapp\.com|whatsapp\.com)\b/i,
  slack:     /\b(join\.slack\.com|slack\.com)\b/i,
  github:    /\bgithub\.com\/[^/]+\/?$/i,
  facebook:  /\bfacebook\.com\b/i,
  twitch:    /\btwitch\.tv\b/i,
  linkAggregator: /\b(linktr\.ee|beacons\.ai|campsite\.bio|bio\.link|lnk\.bio|solo\.to|taplink\.cc|allmylinks\.com)\b/i,
  mailingList: /\b(substack\.com|buttondown\.email|mailchimp\.com|tinyletter\.com|groups\.google\.com|googlegroups\.com|groups\.io)\b/i,
  mastodon:  /\b(mastodon\.social|fosstodon\.org|hachyderm\.io|infosec\.exchange|social\.coop)\b/i,
  bluesky:   /\bbsky\.app\b/i,
};

// Términos demasiado genéricos que causan falsos positivos: los ignoramos
const BLOCKLIST_TERMS = new Set([
  'web', 'code', 'link', 'open', 'free', 'work', 'type', 'base',
  'scala', 'swift', 'dart',  // palabras inglesas comunes además de lenguajes
]);

// Plataformas que bloquean scrapers o requieren login: no intentar visitar su contenido
const SKIP_SCRAPING_RE = /\b(twitter\.com|x\.com|linkedin\.com|instagram\.com|facebook\.com|discord\.com|discord\.gg|t\.me|telegram\.me)\b/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function classifyUrl(url) {
  try {
    const normalized = url.toLowerCase();
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(normalized)) return platform;
    }
  } catch { /* ignore malformed URLs */ }
  return null;
}

/**
 * Dada la URL de una comunidad, detecta si es en sí misma una URL de plataforma.
 * Ej: "https://www.meetup.com/python-madrid/" → { eventsUrl: "https://..." }
 */
function platformFromCommunityUrl(communityUrl) {
  const platform = classifyUrl(communityUrl);
  if (platform && platform !== 'github') return { [platform]: communityUrl };
  // github.com/org es también web oficial para muchas comunidades
  if (platform === 'github') return { github: communityUrl };
  return {};
}

/**
 * Extrae todas las URLs externas de los links de la página y las clasifica.
 */
function extractPlatformLinks(links, communityUrl) {
  const found = {};
  const communityDomain = (() => {
    try { return new URL(communityUrl).hostname; } catch { return ''; }
  })();

  for (const href of links) {
    try {
      const url = new URL(href);
      // Ignorar links del mismo dominio y no-http
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (url.hostname === communityDomain) continue;

      const platform = classifyUrl(href);
      if (platform && !found[platform]) {
        found[platform] = href;
      }
    } catch { /* ignorar URLs malformadas */ }
  }
  return found;
}

/**
 * Construye un índice de búsqueda a partir del catálogo de tags/audience.
 * Devuelve array de { id, terms[] } donde terms son los tokens a buscar.
 */
function buildSearchIndex(catalog) {
  return catalog.map(entry => {
    const terms = new Set();

    // Label completo
    terms.add(entry.label.toLowerCase());

    // Cada word del label si tiene >3 chars
    for (const word of entry.label.toLowerCase().split(/\W+/)) {
      if (word.length >= MIN_TAG_CHARS && !BLOCKLIST_TERMS.has(word)) terms.add(word);
    }

    // Synonyms con longitud mínima
    for (const syn of (entry.synonyms || [])) {
      const s = syn.toLowerCase();
      if (s.length >= MIN_TAG_CHARS && !BLOCKLIST_TERMS.has(s)) terms.add(s);
    }

    return { id: entry.id, terms: Array.from(terms) };
  });
}

/**
 * Busca qué tags/audience tienen match en el texto de la página.
 * Devuelve array de IDs ordenado por número de matches.
 */
function matchCatalog(text, index) {
  const lower = text.toLowerCase();
  const scores = [];

  for (const { id, terms } of index) {
    let score = 0;
    for (const term of terms) {
      // Buscar el término como palabra completa o parte de palabra técnica
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    if (score > 0) scores.push({ id, score });
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)  // máximo 12 sugerencias
    .filter(s => s.score >= 2)  // al menos 2 menciones para reducir ruido
    .map(s => s.id);
}

/**
 * Extrae los topics estructurados de una página de meetup.com.
 * Meetup los expone como links a /find/?keywords=<topic> en la sección de topics del grupo.
 */
function extractMeetupTopics(links) {
  const topics = [];
  for (const href of links) {
    try {
      const url = new URL(href);
      if (/meetup\.com/i.test(url.hostname) && url.pathname.includes('/find/')) {
        const kw = url.searchParams.get('keywords');
        if (kw?.trim()) topics.push(kw.trim());
      }
    } catch { /* ignorar URLs malformadas */ }
  }
  return [...new Set(topics)];
}

/**
 * Mapea topics de meetup a IDs de nuestro catálogo de tags/audience.
 * Usa coincidencia exacta o de subcadena (case-insensitive) sobre label y synonyms.
 * Un topic de meetup puede coincidir con varios tags nuestros (ej: "Data Science" → data-science + python).
 */
function matchTopicsToTagIds(topics, catalog) {
  const matched = new Set();
  for (const topic of topics) {
    const topicLower = topic.toLowerCase();
    for (const entry of catalog) {
      const label = entry.label.toLowerCase();
      const syns  = (entry.synonyms || []).map(s => s.toLowerCase());
      if ([label, ...syns].some(t => t === topicLower || t.includes(topicLower) || topicLower.includes(t))) {
        matched.add(entry.id);
      }
    }
  }
  return Array.from(matched);
}

// Emails que casi nunca son el contacto real de una comunidad
const EMAIL_BLOCKLIST = /^(noreply|no-reply|donotreply|info@sentry|support@github|notifications@|mailer@|bounce@)/i;

/**
 * Extrae un email de contacto de la página.
 * Prioriza los enlaces mailto: y luego busca patrones de email en el texto visible.
 * Devuelve el primer email válido encontrado, o null.
 */
async function extractContactEmail(page) {
  // 1. Intentar con mailto: links (fuente más fiable)
  const mailtoEmails = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="mailto:"]'))
      .map(a => a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase())
      .filter(Boolean)
  );

  for (const email of mailtoEmails) {
    if (!EMAIL_BLOCKLIST.test(email) && email.includes('@') && email.length < 100) {
      return email;
    }
  }

  // 2. Fallback: regex sobre el texto visible de la página
  const pageContent = await page.evaluate(() => document.body?.innerText ?? '');
  const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = pageContent.match(EMAIL_REGEX) ?? [];

  for (const email of matches) {
    const lower = email.toLowerCase();
    if (!EMAIL_BLOCKLIST.test(lower) && lower.length < 100) {
      return lower;
    }
  }

  return null;
}

/**
 * Intenta detectar si una página de meetup.com tiene eventos recientes.
 * Devuelve 'active', 'inactive', o null si no puede determinarlo.
 */
async function detectMeetupStatus(page) {
  try {
    // Meetup muestra fechas de eventos en elementos con estos atributos
    const dateTexts = await page.evaluate(() => {
      const els = document.querySelectorAll('time[datetime], [data-testid*="date"], .eventDateTime');
      return Array.from(els)
        .map(el => el.getAttribute('datetime') || el.textContent)
        .filter(Boolean)
        .slice(0, 5);
    });

    if (!dateTexts.length) return null;

    const now = Date.now();
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

    for (const raw of dateTexts) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const diff = now - d.getTime();
        // Si hay un evento futuro o reciente (< 1 año), está activa
        if (diff < ONE_YEAR_MS) return 'active';
      }
    }
    return 'inactive';
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };
  const hasFlag = (flag) => args.includes(flag);

  // Cargar datos
  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_PATH, 'utf-8'));
  const tags        = JSON.parse(fs.readFileSync(TAGS_PATH,        'utf-8'));
  const audience    = JSON.parse(fs.readFileSync(AUDIENCE_PATH,    'utf-8'));

  const tagsIndex    = buildSearchIndex(tags);
  const audienceIndex = buildSearchIndex(audience);

  // Determinar qué comunidades procesar
  let targets = communities;

  const idArg = getArg('--id');
  if (idArg !== null) {
    targets = communities.filter(c => c.id === parseInt(idArg));
  } else {
    const start = getArg('--start');
    const end   = getArg('--end');
    if (start !== null || end !== null) {
      const s = start !== null ? parseInt(start) : 0;
      const e = end   !== null ? parseInt(end)   : communities.length - 1;
      targets = communities.filter(c => c.id >= s && c.id <= e);
    }
  }

  // Saltar comunidades inactivas (a menos que se pida una concreta con --id)
  if (idArg === null) {
    const before = targets.length;
    targets = targets.filter(c => c.status !== 'inactive');
    const skipped = before - targets.length;
    if (skipped > 0) console.log(`⏭  ${skipped} comunidades inactivas omitidas.`);
  }

  // Modo resume: cargar suggestions existentes y saltar los ya procesados
  let existing = {};
  if (hasFlag('--resume') && fs.existsSync(SUGGESTIONS_PATH)) {
    const prev = JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, 'utf-8'));
    for (const s of prev) existing[s.id] = s;
    const before = targets.length;
    targets = targets.filter(c => !existing[c.id]);
    console.log(`⏭  Resume: ${before - targets.length} comunidades ya procesadas, ${targets.length} pendientes.`);
  }

  if (!targets.length) {
    console.log('ℹ️  No hay comunidades que procesar.');
    return;
  }

  console.log(`🔍 Procesando ${targets.length} comunidades...\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; CommunityDirectoryBot/1.0; +https://github.com/ComBuildersES)',
    locale: 'es-ES',
  });

  // Mantener colección combinada (existentes + nuevos)
  const allSuggestions = { ...existing };

  try {
    for (let i = 0; i < targets.length; i++) {
      const community = targets[i];
      const { id, name, communityUrl, status } = community;

      process.stdout.write(`[${i + 1}/${targets.length}] ${name} ... `);

      const suggestion = {
        id,
        name,
        communityUrl,
        currentStatus: status,
        suggestions: { urls: {}, tags: [], targetAudience: [], contactInfo: null, status: null },
        errors: [],
        approved: null,  // null = pendiente de revisión, true = aplicar, false = descartar
      };

      // 1. Detectar si communityUrl es una plataforma conocida
      suggestion.suggestions.urls = platformFromCommunityUrl(communityUrl);

      // Determinar URLs a visitar: saltar redes sociales que bloquean scrapers,
      // añadir urls.web como fallback si la primaria falla o no es scrapeable
      const urlsToVisit = [];
      if (!SKIP_SCRAPING_RE.test(communityUrl)) {
        urlsToVisit.push(communityUrl);
      }
      const webFallback = community.urls?.web;
      if (webFallback && webFallback !== communityUrl && !SKIP_SCRAPING_RE.test(webFallback)) {
        urlsToVisit.push(webFallback);
      }

      if (urlsToVisit.length === 0) {
        process.stdout.write(`⏭  red social (sin scraping de contenido)\n`);
      }

      let scraped = false;
      for (const urlToVisit of urlsToVisit) {
        const page = await context.newPage();
        try {
          await page.goto(urlToVisit, {
            timeout: PAGE_TIMEOUT,
            waitUntil: 'domcontentloaded',
          });

          // 2. Extraer todos los hrefs de la página
          const hrefs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('a[href]'))
              .map(a => a.href)
              .filter(h => h.startsWith('http'))
          );

          const platformLinks = extractPlatformLinks(hrefs, urlToVisit);
          // Merge: no sobreescribir lo ya detectado
          for (const [platform, url] of Object.entries(platformLinks)) {
            if (!suggestion.suggestions.urls[platform]) {
              suggestion.suggestions.urls[platform] = url;
            }
          }

          // 3. Extraer texto relevante para matching de tags
          const pageText = await page.evaluate((maxLen) => {
            const selectors = ['title', 'meta[name="description"]', 'h1', 'h2', 'h3', 'p', 'li', '[class*="about"]', '[class*="description"]'];
            let text = '';
            for (const sel of selectors) {
              for (const el of document.querySelectorAll(sel)) {
                const t = el.getAttribute('content') || el.textContent || '';
                text += ' ' + t.trim();
                if (text.length >= maxLen) break;
              }
              if (text.length >= maxLen) break;
            }
            return text.slice(0, maxLen);
          }, MAX_TEXT_LENGTH);

          suggestion.suggestions.tags          = matchCatalog(pageText, tagsIndex);
          suggestion.suggestions.targetAudience = matchCatalog(pageText, audienceIndex);

          // Si es meetup, complementar con los topics estructurados (/find/?keywords=)
          if (/meetup\.com/i.test(urlToVisit)) {
            const meetupTopics = extractMeetupTopics(hrefs);
            if (meetupTopics.length) {
              const topicIds = matchTopicsToTagIds(meetupTopics, tags);
              suggestion.suggestions.tags = [...new Set([...suggestion.suggestions.tags, ...topicIds])].slice(0, 12);
            }
          }

          // 4. Extraer email de contacto (solo si la comunidad no tiene uno ya)
          if (!community.contactInfo) {
            suggestion.suggestions.contactInfo = await extractContactEmail(page);
          }

          // 5. Detectar status solo en meetup.com
          if (/meetup\.com/i.test(urlToVisit)) {
            suggestion.suggestions.status = await detectMeetupStatus(page);
          }

          const label = urlToVisit !== communityUrl ? ' [web]' : '';
          process.stdout.write(
            `✓${label}  urls:${Object.keys(suggestion.suggestions.urls).length} tags:${suggestion.suggestions.tags.length}${suggestion.suggestions.contactInfo ? ' email:✓' : ''}\n`
          );
          scraped = true;

        } catch (err) {
          const msg = err.message?.includes('Timeout') ? 'timeout' : (err.message?.slice(0, 80) ?? 'error');
          suggestion.errors.push(`${urlToVisit}: ${msg}`);
          const hasNext = urlsToVisit.indexOf(urlToVisit) < urlsToVisit.length - 1;
          if (hasNext) {
            process.stdout.write(`⚠  ${msg} → probando web fallback...\n`);
            process.stdout.write(`[${i + 1}/${targets.length}] ${name} ... `);
          } else {
            process.stdout.write(`✗  ${msg}\n`);
          }
        } finally {
          await page.close();
        }
        if (scraped) break;
      }

      // Enriquecimiento adicional con meetup: si la URL principal no era meetup
      // pero se conoce una URL de meetup (ya en community.urls o recién descubierta),
      // visitarla para mejorar la detección de tags y el estado de actividad.
      if (scraped) {
        const meetupUrl = community.urls?.meetup || suggestion.suggestions.urls.meetup;
        const alreadyVisitedMeetup = urlsToVisit.some(u => /meetup\.com/i.test(u));
        if (meetupUrl && !alreadyVisitedMeetup) {
          const meetupPage = await context.newPage();
          try {
            await meetupPage.goto(meetupUrl, { timeout: PAGE_TIMEOUT, waitUntil: 'domcontentloaded' });

            // Extraer hrefs para topics estructurados (/find/?keywords=)
            const meetupHrefs = await meetupPage.evaluate(() =>
              Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .filter(h => h.startsWith('http'))
            );
            const meetupTopics = extractMeetupTopics(meetupHrefs);

            const meetupText = await meetupPage.evaluate((maxLen) => {
              const selectors = ['title', 'meta[name="description"]', 'h1', 'h2', 'h3', 'p', 'li', '[class*="about"]', '[class*="description"]'];
              let text = '';
              for (const sel of selectors) {
                for (const el of document.querySelectorAll(sel)) {
                  const t = el.getAttribute('content') || el.textContent || '';
                  text += ' ' + t.trim();
                  if (text.length >= maxLen) break;
                }
                if (text.length >= maxLen) break;
              }
              return text.slice(0, maxLen);
            }, MAX_TEXT_LENGTH);

            // Combinar: texto libre + topics estructurados de meetup
            const meetupTags    = matchCatalog(meetupText, tagsIndex);
            const meetupTopicIds = matchTopicsToTagIds(meetupTopics, tags);
            suggestion.suggestions.tags = [...new Set([...suggestion.suggestions.tags, ...meetupTags, ...meetupTopicIds])].slice(0, 12);
            const meetupAudience = matchCatalog(meetupText, audienceIndex);
            suggestion.suggestions.targetAudience = [...new Set([...suggestion.suggestions.targetAudience, ...meetupAudience])];
            if (!suggestion.suggestions.status) {
              suggestion.suggestions.status = await detectMeetupStatus(meetupPage);
            }
            if (!suggestion.suggestions.contactInfo && !community.contactInfo) {
              suggestion.suggestions.contactInfo = await extractContactEmail(meetupPage);
            }
            process.stdout.write(
              `  + meetup  topics:${meetupTopics.length} tags:${suggestion.suggestions.tags.length}${suggestion.suggestions.status ? ` status:${suggestion.suggestions.status}` : ''}\n`
            );
          } catch { /* visita de enriquecimiento opcional — ignorar errores */ }
          finally { await meetupPage.close(); }
        }
      }

      allSuggestions[id] = suggestion;

      // Guardar progreso tras cada comunidad (permite reanudar si se interrumpe)
      const output = Object.values(allSuggestions).sort((a, b) => a.id - b.id);
      fs.writeFileSync(SUGGESTIONS_PATH, JSON.stringify(output, null, 2), 'utf-8');

      if (i < targets.length - 1) await sleep(DELAY_MS);
    }
  } finally {
    await browser.close();
  }

  const total     = Object.keys(allSuggestions).length;
  const withUrls  = Object.values(allSuggestions).filter(s => Object.keys(s.suggestions.urls).length > 0).length;
  const withTags  = Object.values(allSuggestions).filter(s => s.suggestions.tags.length > 0).length;
  const errors    = Object.values(allSuggestions).filter(s => s.errors.length > 0).length;

  console.log(`\n✅ Completado. ${total} comunidades en ${path.resolve(SUGGESTIONS_PATH)}`);
  console.log(`   Con URLs detectadas : ${withUrls}`);
  console.log(`   Con tags sugeridos  : ${withTags}`);
  console.log(`   Con errores         : ${errors}`);
  console.log(`\n👉 Revisa el fichero y luego ejecuta: npm run apply-suggestions`);
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
