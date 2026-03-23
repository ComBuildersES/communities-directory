/**
 * Para cada URL problemática del informe de check-urls, busca un snapshot en
 * Wayback Machine y actualiza communities.json con la URL archivada si la encuentra.
 *
 * Por defecto procesa:
 *   - Sección "Rotas" (HTTP 404/410)
 *   - Sección "Warnings" con "fetch failed" (error de red, sitio probablemente caído)
 *   - Sección "Warnings" con "HTTP 403" (puede ser sitio caído que bloquea)
 *
 * Siempre se omiten URLs de dominios que bloquean bots sistemáticamente
 * (twitter.com, x.com, linkedin.com, instagram.com, facebook.com) ya que sus
 * contenidos siguen siendo accesibles a humanos y no tiene sentido archivarlos.
 *
 * Uso:
 *   node scripts/archive-broken-urls.js                        # lee report.txt
 *   node scripts/archive-broken-urls.js --from-report <ruta>   # informe alternativo
 *   node scripts/archive-broken-urls.js --dry-run              # previsualiza sin escribir
 *   node scripts/archive-broken-urls.js --include-warnings     # procesa TODOS los warnings
 *   node scripts/archive-broken-urls.js --concurrency 5        # peticiones paralelas
 *
 * Flujo recomendado:
 *   npm run check-urls -- --report report.txt
 *   npm run archive-broken-urls -- --dry-run
 *   npm run archive-broken-urls
 */

import fs from "node:fs";

const COMMUNITIES_PATH = "./public/data/communities.json";
const DEFAULT_REPORT_PATH = "./report.txt";
const WAYBACK_API = "https://archive.org/wayback/available?url=";
const DEFAULT_CONCURRENCY = 3;
const TIMEOUT_MS = 12000;

// Dominios que bloquean bots pero cuyo contenido sigue accesible a humanos.
// No tiene sentido sustituir sus URLs por snapshots de archivo.
const BOT_BLOCKED_DOMAINS = new Set([
  "twitter.com",
  "x.com",
  "linkedin.com",
  "instagram.com",
  "facebook.com",
]);

// Errores de warning que por defecto también se buscan en Wayback
const DEFAULT_WARNING_ERRORS = new Set(["fetch failed", "HTTP 403"]);

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = {
    dryRun: false,
    reportPath: DEFAULT_REPORT_PATH,
    concurrency: DEFAULT_CONCURRENCY,
    includeAllWarnings: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--include-warnings") {
      options.includeAllWarnings = true;
    } else if (arg === "--from-report" || arg === "--report") {
      options.reportPath = argv[++i] ?? DEFAULT_REPORT_PATH;
    } else if (arg === "--concurrency") {
      options.concurrency = parseInt(argv[++i], 10) || DEFAULT_CONCURRENCY;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Uso: node scripts/archive-broken-urls.js [opciones]

Opciones:
  --from-report <ruta>   Informe generado por check-urls (default: report.txt)
  --dry-run              Muestra los cambios sin escribir en disco
  --include-warnings     Procesa TODOS los warnings (además de los habituales)
  --concurrency <n>      Peticiones paralelas a Wayback Machine (default: ${DEFAULT_CONCURRENCY})
  --help                 Muestra esta ayuda

Por defecto procesa: HTTP 404 (Rotas) + "fetch failed" + HTTP 403 (Warnings).
Siempre omite: ${[...BOT_BLOCKED_DOMAINS].join(", ")}
`);
      process.exit(0);
    }
  }

  return options;
}

// ---------------------------------------------------------------------------
// Dominios bot-bloqueados
// ---------------------------------------------------------------------------

function isBotBlockedDomain(url) {
  try {
    const { hostname } = new URL(url);
    const bare = hostname.replace(/^www\./, "");
    return BOT_BLOCKED_DOMAINS.has(bare);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Parseo del informe Markdown generado por check-urls.js
// ---------------------------------------------------------------------------

function extractErrorDetail(line) {
  // Extrae el contenido entre el último par de paréntesis antes del punto
  // Ej: "... (fetch failed). ..." → "fetch failed"
  // Ej: "... (HTTP 403). ..."     → "HTTP 403"
  const match = line.match(/\(([^)]+)\)\./);
  return match ? match[1].trim() : "";
}

function shouldProcessWarning(errorDetail, includeAllWarnings) {
  if (includeAllWarnings) return true;
  return DEFAULT_WARNING_ERRORS.has(errorDetail);
}

function parseReport(reportText, includeAllWarnings) {
  const entries = [];
  let section = null;

  for (const line of reportText.split("\n")) {
    if (line.startsWith("## Rotas")) { section = "broken"; continue; }
    if (line.startsWith("## Warnings")) { section = "warning"; continue; }
    if (line.startsWith("## ")) { section = null; continue; }

    if (section !== "broken" && section !== "warning") continue;

    // Formato: - **Nombre** `campo` → https://url.com (HTTP 404). ...
    const match = line.match(/^\s*-\s+\*\*(.+?)\*\*\s+`(.+?)`\s+→\s+(\S+)\s+\(/);
    if (!match) continue;

    const errorDetail = extractErrorDetail(line);
    const isWarning = section === "warning";

    if (isWarning && !shouldProcessWarning(errorDetail, includeAllWarnings)) continue;

    entries.push({
      name: match[1].trim(),
      field: match[2].trim(),
      url: match[3].trim(),
      errorDetail,
      isWarning,
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Índice URL → {community, field} para localizar y actualizar registros
// ---------------------------------------------------------------------------

function normalizeUrl(url) {
  if (typeof url !== "string") return "";
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function buildUrlIndex(communities) {
  const index = new Map();

  for (const community of communities) {
    if (community.communityUrl) {
      index.set(normalizeUrl(community.communityUrl), { community, field: "communityUrl" });
    }
    for (const [key, url] of Object.entries(community.urls ?? {})) {
      if (url) {
        index.set(normalizeUrl(url), { community, field: `urls.${key}` });
      }
    }
  }

  return index;
}

// ---------------------------------------------------------------------------
// Wayback Machine Availability API
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CommunityBuildersDirBot/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function lookupWayback(url) {
  try {
    const res = await fetchWithTimeout(
      `${WAYBACK_API}${encodeURIComponent(url)}`,
      TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const snapshot = data?.archived_snapshots?.closest;
    if (snapshot?.available && snapshot?.url && snapshot?.status === "200") {
      return snapshot.url;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Pool de concurrencia
// ---------------------------------------------------------------------------

async function runPool(items, concurrency, worker) {
  const queue = [...items];
  const results = [];

  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(1, items.length)) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) results.push(await worker(item));
      }
    }),
  );

  return results;
}

// ---------------------------------------------------------------------------
// Escritura del campo en el objeto community
// ---------------------------------------------------------------------------

function applyChange(community, field, newUrl) {
  if (field === "communityUrl") {
    community.communityUrl = newUrl;
  } else if (field.startsWith("urls.")) {
    if (!community.urls) community.urls = {};
    community.urls[field.slice(5)] = newUrl;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(options.reportPath)) {
    console.error(`No se encontró el informe: ${options.reportPath}`);
    console.error("Genera uno primero con:  npm run check-urls -- --report report.txt");
    process.exit(1);
  }

  const reportText = fs.readFileSync(options.reportPath, "utf-8");
  const allEntries = parseReport(reportText, options.includeAllWarnings);

  if (allEntries.length === 0) {
    console.log("No se encontraron URLs a procesar en el informe. Nada que hacer.");
    return;
  }

  // Filtrar: ya archivadas, dominios bot-bloqueados
  const alreadyArchived = allEntries.filter((e) => e.url.includes("web.archive.org"));
  const botBlocked = allEntries.filter(
    (e) => !e.url.includes("web.archive.org") && isBotBlockedDomain(e.url),
  );
  const toProcess = allEntries.filter(
    (e) => !e.url.includes("web.archive.org") && !isBotBlockedDomain(e.url),
  );

  const byError = toProcess.reduce((acc, e) => {
    acc[e.errorDetail] = (acc[e.errorDetail] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`URLs en el informe: ${allEntries.length}`);
  console.log(`  → ${alreadyArchived.length} ya apuntan a web.archive.org (se saltan)`);
  if (botBlocked.length > 0) {
    console.log(`  → ${botBlocked.length} de dominios bot-bloqueados (se saltan)`);
  }
  console.log(`  → ${toProcess.length} para buscar en Wayback Machine`);
  if (Object.keys(byError).length > 0) {
    for (const [err, count] of Object.entries(byError)) {
      console.log(`       ${count}× ${err}`);
    }
  }
  console.log();

  if (toProcess.length === 0) {
    console.log("Nada que procesar.");
    return;
  }

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_PATH, "utf-8"));
  const urlIndex = buildUrlIndex(communities);

  const changes = [];
  const notFound = [];
  const notMatched = [];

  await runPool(toProcess, options.concurrency, async (entry) => {
    const normalized = normalizeUrl(entry.url);
    const match = urlIndex.get(normalized);

    if (!match) {
      notMatched.push(entry);
      return;
    }

    process.stdout.write(`  [${entry.errorDetail}] ${entry.url.slice(0, 65)}… `);
    const archiveUrl = await lookupWayback(entry.url);

    if (archiveUrl) {
      console.log("✓");
      changes.push({
        community: match.community,
        field: match.field,
        oldUrl: entry.url,
        newUrl: archiveUrl,
      });
    } else {
      console.log("✗ sin snapshot");
      notFound.push(entry);
    }
  });

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Snapshots encontrados: ${changes.length}`);
  console.log(`Sin snapshot disponible: ${notFound.length}`);
  if (notMatched.length > 0) {
    console.log(`No localizadas en communities.json: ${notMatched.length}`);
  }

  if (changes.length === 0) {
    console.log("\nSin cambios que aplicar.");
    return;
  }

  console.log("\nCambios a aplicar:");
  for (const c of changes) {
    console.log(`  [${c.community.name}] ${c.field}`);
    console.log(`    - ${c.oldUrl}`);
    console.log(`    + ${c.newUrl}`);
  }

  if (options.dryRun) {
    console.log("\n[dry-run] No se ha escrito nada en disco.");
    return;
  }

  for (const c of changes) {
    applyChange(c.community, c.field, c.newUrl);
  }

  fs.writeFileSync(COMMUNITIES_PATH, JSON.stringify(communities, null, 2) + "\n", "utf-8");
  console.log(`\n✓ ${changes.length} URL(s) actualizadas en ${COMMUNITIES_PATH}`);
  console.log("Ejecuta 'npm run check-urls -- --report report.txt' para verificar el resultado.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "Error inesperado");
  process.exit(1);
});
