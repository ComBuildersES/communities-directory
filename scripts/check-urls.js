import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const COMMUNITIES_PATH = "public/data/communities.json";
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_TIMEOUT_MS = 15000;

function parseArgs(argv) {
  const options = {
    strict: false,
    changedOnly: false,
    baselineRef: "HEAD",
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    report: null,
    verbose: false,
    progress: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--strict") {
      options.strict = true;
      continue;
    }

    if (arg === "--changed-only") {
      options.changedOnly = true;
      continue;
    }

    if (arg.startsWith("--baseline-ref=")) {
      options.baselineRef = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--baseline-ref") {
      options.baselineRef = argv[index + 1] ?? options.baselineRef;
      index += 1;
      continue;
    }

    if (arg.startsWith("--concurrency=")) {
      options.concurrency = Number.parseInt(arg.split("=")[1], 10) || DEFAULT_CONCURRENCY;
      continue;
    }

    if (arg === "--concurrency") {
      options.concurrency = Number.parseInt(argv[index + 1], 10) || DEFAULT_CONCURRENCY;
      index += 1;
      continue;
    }

    if (arg.startsWith("--timeout-ms=")) {
      options.timeoutMs = Number.parseInt(arg.split("=")[1], 10) || DEFAULT_TIMEOUT_MS;
      continue;
    }

    if (arg === "--timeout-ms") {
      options.timeoutMs = Number.parseInt(argv[index + 1], 10) || DEFAULT_TIMEOUT_MS;
      index += 1;
      continue;
    }

    if (arg.startsWith("--report=")) {
      options.report = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--report") {
      options.report = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }

    if (arg === "--no-progress") {
      options.progress = false;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Uso:
  node scripts/check-urls.js [opciones]

Opciones:
  --strict                  Sale con código 1 si hay URLs caídas o con error.
  --changed-only            Revisa solo comunidades nuevas o modificadas respecto al baseline.
  --baseline-ref <ref>      Referencia git para comparar cambios. Por defecto: HEAD.
  --concurrency <n>         Número de peticiones concurrentes. Por defecto: ${DEFAULT_CONCURRENCY}.
  --timeout-ms <ms>         Timeout por petición. Por defecto: ${DEFAULT_TIMEOUT_MS}.
  --report <ruta>           Guarda un informe Markdown en la ruta indicada.
  --verbose                 Muestra cada resultado según llega.
  --no-progress             Oculta el contador de progreso.
  --help                    Muestra esta ayuda.
`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function readBaselineCommunities(ref) {
  try {
    const raw = execFileSync("git", ["show", `${ref}:${COMMUNITIES_PATH}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeUrl(url) {
  if (typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return "";
  }
}

// Dominios que bloquean bots sistemáticamente: sus URLs siguen siendo válidas
// pero cualquier check automatizado devuelve error. No tiene sentido reportarlas.
const BOT_BLOCKED_DOMAINS = new Set([
  "twitter.com",
  "x.com",
]);

function isArchiveUrl(url) {
  return typeof url === "string" && url.includes("web.archive.org/web/");
}

function isBotBlockedDomain(url) {
  try {
    const { hostname } = new URL(url);
    const bare = hostname.replace(/^www\./, "");
    return BOT_BLOCKED_DOMAINS.has(bare);
  } catch {
    return false;
  }
}

function getCommunityUrls(community) {
  const entries = [];
  const seen = new Set();
  const candidates = [
    { source: "communityUrl", url: community.communityUrl },
    ...Object.entries(community.urls ?? {}).map(([key, value]) => ({ source: `urls.${key}`, url: value })),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate.url);
    if (!normalized || seen.has(normalized) || isBotBlockedDomain(normalized)) {
      continue;
    }

    seen.add(normalized);
    entries.push({
      communityId: community.id,
      communityName: community.name,
      source: candidate.source,
      url: normalized,
      isArchive: isArchiveUrl(normalized),
    });
  }

  return entries;
}

function getChangedCommunities(currentCommunities, baselineCommunities) {
  if (!Array.isArray(currentCommunities)) {
    return [];
  }

  if (!Array.isArray(baselineCommunities)) {
    return currentCommunities;
  }

  const baselineById = new Map();

  for (const community of baselineCommunities) {
    if (isPlainObject(community) && Number.isInteger(community.id)) {
      baselineById.set(community.id, JSON.stringify(community));
    }
  }

  return currentCommunities.filter((community) => {
    if (!isPlainObject(community) || !Number.isInteger(community.id)) {
      return true;
    }

    return baselineById.get(community.id) !== JSON.stringify(community);
  });
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "CommunityBuildersDirectoryUrlChecker/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function classifyResult(status, errorMessage = "") {
  if (status >= 200 && status < 400) {
    return "ok";
  }

  if ([401, 403, 405, 429].includes(status)) {
    return "warning";
  }

  if (status === 404 || status === 410) {
    return "broken";
  }

  if (status >= 500) {
    return "warning";
  }

  if (errorMessage) {
    return "warning";
  }

  return "warning";
}

function formatSummary(results) {
  return {
    total: results.length,
    ok: results.filter((result) => result.level === "ok").length,
    warning: results.filter((result) => result.level === "warning").length,
    broken: results.filter((result) => result.level === "broken").length,
    archived: results.filter((result) => result.isArchive).length,
  };
}

function buildArchiveHint(result) {
  if (result.isArchive) {
    return "Ya apunta a web.archive.org.";
  }

  return `Si no hay web activa, intenta localizar una copia en https://web.archive.org/web/*/${result.url}`;
}

function buildMarkdownReport(results, summary, options) {
  const lines = [
    "# Informe de salud de URLs",
    "",
    `- Actualizado: ${new Date().toISOString()}`,
    `- URLs revisadas: ${summary.total}`,
    `- OK: ${summary.ok}`,
    `- Warning: ${summary.warning}`,
    `- Rotas: ${summary.broken}`,
    `- Archivadas: ${summary.archived}`,
    `- Modo estricto: ${options.strict ? "sí" : "no"}`,
    `- Solo cambios: ${options.changedOnly ? "sí" : "no"}`,
    "",
  ];

  const grouped = [
    ["Rotas", results.filter((result) => result.level === "broken")],
    ["Warnings", results.filter((result) => result.level === "warning")],
    ["Archivadas", results.filter((result) => result.isArchive)],
  ];

  for (const [title, entries] of grouped) {
    if (entries.length === 0) {
      continue;
    }

    lines.push(`## ${title}`, "");

    for (const entry of entries) {
      const details = entry.error
        ? entry.error
        : `HTTP ${entry.status}`;

      lines.push(
        `- **${entry.communityName}** \`${entry.source}\` → ${entry.url} (${details}). ${buildArchiveHint(entry)}`,
      );
    }

    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function ensureReportDirectory(reportPath) {
  if (!reportPath) {
    return;
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
}

function writeReport(reportPath, results, options) {
  if (!reportPath) {
    return;
  }

  ensureReportDirectory(reportPath);
  const summary = formatSummary(results);
  const report = buildMarkdownReport(results, summary, options);
  fs.writeFileSync(reportPath, report, "utf-8");
}

function getResultLabel(result) {
  return result.level === "ok" ? "OK" : result.level === "broken" ? "BROKEN" : "WARN";
}

function getResultDetails(result) {
  return result.error ? result.error : `HTTP ${result.status}`;
}

function printProgress(completed, total, summary) {
  const message = `[${completed}/${total}] OK ${summary.ok} · WARN ${summary.warning} · BROKEN ${summary.broken} · ARCHIVE ${summary.archived}`;
  console.log(message);
}

async function checkUrl(entry, timeoutMs) {
  if (entry.isArchive) {
    return {
      ...entry,
      level: "warning",
      status: null,
      error: "URL archivada",
    };
  }

  try {
    const response = await fetchWithTimeout(entry.url, timeoutMs);

    return {
      ...entry,
      status: response.status,
      level: classifyResult(response.status),
      error: null,
    };
  } catch (error) {
    return {
      ...entry,
      status: null,
      level: classifyResult(0, error instanceof Error ? error.message : "Error de red"),
      error: error instanceof Error ? error.message : "Error de red",
    };
  }
}

async function runPool(entries, concurrency, worker, onResult) {
  const queue = [...entries];
  const results = [];

  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) {
        return;
      }

      const result = await worker(next);
      results.push(result);

      if (onResult) {
        await onResult(result, results);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const communities = readJson(COMMUNITIES_PATH);
  const baselineCommunities = options.changedOnly ? readBaselineCommunities(options.baselineRef) : null;
  const communitiesToCheck = options.changedOnly
    ? getChangedCommunities(communities, baselineCommunities)
    : communities;
  const entries = communitiesToCheck.flatMap(getCommunityUrls);

  // Contar cuántas URLs fueron omitidas por ser de dominios bot-bloqueados
  const allCandidates = communitiesToCheck.flatMap((c) => [
    c.communityUrl,
    ...Object.values(c.urls ?? {}),
  ]).filter(Boolean);
  const skippedCount = allCandidates.filter(isBotBlockedDomain).length;

  console.log(`Revisando ${entries.length} URL(s) de ${communitiesToCheck.length} comunidad(es)...`);
  if (skippedCount > 0) {
    console.log(`(${skippedCount} URLs de dominios bot-bloqueados omitidas: ${[...BOT_BLOCKED_DOMAINS].join(", ")})`);
  }
  if (options.report) {
    console.log(`Escribiendo informe incremental en ${options.report}`);
    writeReport(options.report, [], options);
  }

  let completed = 0;
  let lastReportWrite = 0;
  const results = await runPool(
    entries,
    options.concurrency,
    (entry) => checkUrl(entry, options.timeoutMs),
    async (result, partialResults) => {
      completed += 1;
      const summary = formatSummary(partialResults);

      if (options.verbose) {
        console.log(`[${getResultLabel(result)}] ${result.communityName} · ${result.source} · ${getResultDetails(result)}`);
      }

      if (options.progress) {
        printProgress(completed, entries.length, summary);
      }

      if (options.report) {
        const now = Date.now();
        if (now - lastReportWrite > 500 || completed === entries.length) {
          writeReport(options.report, partialResults, options);
          lastReportWrite = now;
        }
      }
    },
  );

  const summary = formatSummary(results);

  if (!options.verbose) {
    for (const result of results) {
      console.log(`[${getResultLabel(result)}] ${result.communityName} · ${result.source} · ${getResultDetails(result)}`);
    }
  }

  console.log("");
  console.log(`Resumen: ${summary.ok} OK, ${summary.warning} warning, ${summary.broken} rotas, ${summary.archived} archivadas.`);

  if (summary.warning > 0 || summary.broken > 0) {
    console.log("Sugerencia: si una URL ya no existe, intenta usar una copia en web.archive.org cuando sea útil.");
  }

  if (options.report) {
    writeReport(options.report, results, options);
    console.log(`Informe guardado en ${options.report}`);
  }

  if (options.strict && summary.broken > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error inesperado al comprobar URLs.");
  process.exit(1);
});
