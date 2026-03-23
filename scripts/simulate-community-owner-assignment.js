/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";
import { inferProvinceIdFromNominatim } from "../src/lib/provinceNormalization.js";

const COMMUNITIES_PATH = "public/data/communities.json";
const OWNERS_PATH = ".github/community-owners.yml";
const DEFAULT_CACHE_PATH = "tmp/nominatim-community-owner-cache.json";
const DEFAULT_REPORT_PATH = "tmp/community-owner-assignment-report.json";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_DELAY_MS = 1100;
const SKIPPED_LOCATIONS = new Set(["", "n/a", "itinerante", "sin completar"]);
const EVENT_FORMATS_WITH_LOCATION = new Set(["Presencial", "Híbridos"]);

function parseArgs(argv) {
  const options = {
    limit: null,
    cachePath: DEFAULT_CACHE_PATH,
    reportPath: DEFAULT_REPORT_PATH,
    refreshCache: false,
    outputJson: false,
    quiet: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--refresh-cache") {
      options.refreshCache = true;
      continue;
    }

    if (arg === "--json") {
      options.outputJson = true;
      continue;
    }

    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      options.limit = Number.parseInt(arg.split("=").slice(1).join("="), 10);
      continue;
    }

    if (arg === "--limit") {
      options.limit = Number.parseInt(argv[index + 1] ?? "", 10);
      index += 1;
      continue;
    }

    if (arg.startsWith("--cache-path=")) {
      options.cachePath = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--cache-path") {
      options.cachePath = argv[index + 1] ?? options.cachePath;
      index += 1;
      continue;
    }

    if (arg.startsWith("--report-path=")) {
      options.reportPath = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--report-path") {
      options.reportPath = argv[index + 1] ?? options.reportPath;
      index += 1;
    }
  }

  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit <= 0)) {
    throw new Error("El argumento --limit debe ser un entero positivo");
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readYaml(filePath) {
  return YAML.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readCache(filePath) {
  if (!fs.existsSync(filePath)) return {};

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function writeCache(filePath, cache) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(cache, null, 2));
}

function writeReport(filePath, report) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
}

function normalizeText(value = "") {
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function shouldSkipLocation(value = "") {
  return SKIPPED_LOCATIONS.has(normalizeText(value));
}

function shouldSkipCommunity(community = {}) {
  const normalizedCommunityType = normalizeText(community.communityType);

  if (normalizedCommunityType === normalizeText("Organización paraguas")) {
    return {
      skipped: true,
      reason: "community-type-without-location",
    };
  }

  if (!EVENT_FORMATS_WITH_LOCATION.has(community.eventFormat)) {
    return {
      skipped: true,
      reason: "event-format-without-location",
    };
  }

  if (shouldSkipLocation(community.location ?? "")) {
    return {
      skipped: true,
      reason: "location-no-simulable",
    };
  }

  return {
    skipped: false,
    reason: null,
  };
}

function buildOwnersLookup(config = {}) {
  const provinceOwners = new Map();

  for (const [provinceId, provinceConfig] of Object.entries(config.provinces ?? {})) {
    provinceOwners.set(provinceId, Array.isArray(provinceConfig?.assignees) ? provinceConfig.assignees.filter(Boolean) : []);
  }

  return {
    defaults: Array.isArray(config.defaults?.assignees) ? config.defaults.assignees.filter(Boolean) : [],
    provinceOwners,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeLocation(location) {
  const params = new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
    "accept-language": "es",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ComBuildersCommunityAssignmentSimulator/1.0 (https://github.com/ComBuildersES/communities-directory)",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim devolvió ${response.status} ${response.statusText}`);
  }

  const results = await response.json();
  return Array.isArray(results) && results.length > 0 ? results[0] : null;
}

async function resolveLocation(location, cache, { refreshCache }) {
  if (!refreshCache && cache[location]) {
    return {
      ...cache[location],
      source: "cache",
    };
  }

  const nominatim = await geocodeLocation(location);
  const provinceId = inferProvinceIdFromNominatim(nominatim);
  const cacheEntry = {
    fetchedAt: new Date().toISOString(),
    provinceId,
    nominatim,
  };

  cache[location] = cacheEntry;

  return {
    ...cacheEntry,
    source: "live",
  };
}

function summarizeResult(result) {
  return {
    id: result.id,
    name: result.name,
    location: result.location,
    provinceId: result.provinceId,
    assignees: result.assignees,
    usedFallback: result.usedFallback,
    fallbackReason: result.fallbackReason ?? null,
    geocodingSource: result.geocodingSource,
  };
}

function printProgress(message, options) {
  if (options.quiet || options.outputJson) return;
  process.stdout.write(`${message}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const communities = readJson(COMMUNITIES_PATH);
  const ownersConfig = readYaml(OWNERS_PATH);
  const ownersLookup = buildOwnersLookup(ownersConfig);
  const cache = readCache(options.cachePath);
  const selectedCommunities = options.limit ? communities.slice(0, options.limit) : communities;
  const results = [];
  const stats = {
    total: selectedCommunities.length,
    simulated: 0,
    matchedOwner: 0,
    fallback: 0,
    skipped: 0,
    unresolvedProvince: 0,
    liveRequests: 0,
    cachedRequests: 0,
  };

  printProgress(
    `Iniciando simulación sobre ${selectedCommunities.length} comunidades. Reporte: ${options.reportPath}`,
    options
  );

  for (const [index, community] of selectedCommunities.entries()) {
    const location = community.location ?? "";
    const skipDecision = shouldSkipCommunity(community);
    const progressPrefix = `[${index + 1}/${selectedCommunities.length}] [${community.id}] ${community.name}`;

    if (skipDecision.skipped) {
      stats.skipped += 1;
      const skippedResult = {
        id: community.id,
        name: community.name,
        location,
        provinceId: null,
        assignees: [],
        usedFallback: false,
        fallbackReason: null,
        skipped: true,
        skipReason: skipDecision.reason,
      };
      results.push(skippedResult);
      printProgress(`${progressPrefix} -> skip (${skipDecision.reason})`, options);
      continue;
    }

    const resolution = await resolveLocation(location, cache, options);
    const provinceId = resolution.provinceId;
    const assigneesFromProvince = provinceId ? ownersLookup.provinceOwners.get(provinceId) ?? [] : [];
    const usedFallback = assigneesFromProvince.length === 0;
    const fallbackReason = !usedFallback
      ? null
      : provinceId
        ? "province-without-owner"
        : "province-unresolved";
    const assignees = usedFallback ? ownersLookup.defaults : assigneesFromProvince;

    stats.simulated += 1;
    if (resolution.source === "live") {
      stats.liveRequests += 1;
      writeCache(options.cachePath, cache);
      await sleep(REQUEST_DELAY_MS);
    } else {
      stats.cachedRequests += 1;
    }

    if (!provinceId) {
      stats.unresolvedProvince += 1;
    }

    if (usedFallback) {
      stats.fallback += 1;
    } else {
      stats.matchedOwner += 1;
    }

    results.push({
      id: community.id,
      name: community.name,
      location,
      provinceId,
      assignees,
      usedFallback,
      fallbackReason,
      geocodingSource: resolution.source,
      displayName: resolution.nominatim?.display_name ?? null,
    });

    printProgress(
      `${progressPrefix} -> provinceId=${provinceId ?? "null"} | assignees=${assignees.join(", ") || "-"} | ${resolution.source}${usedFallback ? ` | fallback:${fallbackReason}` : ""}`,
      options
    );
  }

  writeCache(options.cachePath, cache);
  const report = {
    generatedAt: new Date().toISOString(),
    stats,
    results: results.map(summarizeResult),
  };
  writeReport(options.reportPath, report);

  if (options.outputJson) {
    process.stdout.write(JSON.stringify(report, null, 2));
    return;
  }

  console.log("");
  console.log("Simulación de asignación por provincia");
  console.log(`- Total revisadas: ${stats.total}`);
  console.log(`- Simuladas: ${stats.simulated}`);
  console.log(`- Saltadas: ${stats.skipped}`);
  console.log(`- Con owner directo: ${stats.matchedOwner}`);
  console.log(`- Con fallback: ${stats.fallback}`);
  console.log(`- Provincia no resuelta: ${stats.unresolvedProvince}`);
  console.log(`- Consultas live a Nominatim: ${stats.liveRequests}`);
  console.log(`- Consultas servidas desde caché: ${stats.cachedRequests}`);
  console.log(`- Reporte guardado en: ${options.reportPath}`);
  console.log("");

  const unresolved = results
    .filter((result) => !result.skipped && !result.provinceId)
    .slice(0, 20);

  if (unresolved.length > 0) {
    console.log("Primeros casos sin provincia resuelta:");
    unresolved.forEach((result) => {
      console.log(`- [${result.id}] ${result.name} | location="${result.location}"`);
    });
    console.log("");
  }

  const fallbackResults = results
    .filter((result) => !result.skipped && result.usedFallback)
    .slice(0, 20);

  if (fallbackResults.length > 0) {
    console.log("Primeros casos que caerían en fallback:");
    fallbackResults.forEach((result) => {
      console.log(`- [${result.id}] ${result.name} | location="${result.location}" | provinceId=${result.provinceId ?? "null"}`);
    });
  }
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
