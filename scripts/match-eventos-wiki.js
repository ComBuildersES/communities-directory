#!/usr/bin/env node
/**
 * Vincula comunidades del directorio con sus organizadores en eventos.wiki (issues #57, #402).
 *
 * eventos.wiki publica su catálogo completo en formato OTE (https://eventos.wiki/events.json).
 * Cada evento trae sus `organizers`, y cada organizador tiene página propia
 * (`/organizations/<slug>`) y feed OTE (`/organizations/<slug>/events.json`). Este script
 * empareja esos organizadores con las comunidades del directorio por nombre y propone
 * rellenar `urls.eventosWiki` y `urls.ote`.
 *
 * Uso:
 *   node scripts/match-eventos-wiki.js                      # informe, no toca datos
 *   node scripts/match-eventos-wiki.js --apply              # aplica solo los matches exactos
 *   node scripts/match-eventos-wiki.js --apply --include-fuzzy
 *   node scripts/match-eventos-wiki.js --input fichero.json # usa un volcado local
 */
import fs from "node:fs";
import process from "node:process";

import { readCommunities, writeCommunities } from "./lib/communities-store.js";
import {
  areCommunityNamesSimilar,
  compactComparableText,
  normalizeComparableText,
  normalizeUrlForComparison,
} from "../src/lib/communitySubmission.js";

const EVENTOS_WIKI_CATALOG_URL = "https://eventos.wiki/events.json";
const REPORT_PATH = "scripts/eventos-wiki-matches.json";

export function parseArgs(argv) {
  const options = {
    apply: false,
    includeFuzzy: false,
    input: null,
    reportPath: REPORT_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--include-fuzzy") options.includeFuzzy = true;
    else if (arg === "--input") options.input = argv[index + 1] ?? null;
    else if (arg === "--report") options.reportPath = argv[index + 1] ?? REPORT_PATH;
  }

  return options;
}

/** Organizadores únicos del catálogo, con el número de eventos que respaldan el match. */
export function collectOrganizers(catalog) {
  const byUrl = new Map();

  for (const event of catalog?.events ?? []) {
    for (const organizer of event.organizers ?? []) {
      const url = typeof organizer?.url === "string" ? organizer.url.trim() : "";
      const name = typeof organizer?.name === "string" ? organizer.name.trim() : "";
      if (!url || !name) continue;

      const current = byUrl.get(url);
      if (current) {
        current.eventCount += 1;
        continue;
      }

      byUrl.set(url, { name, url, type: organizer.type ?? null, eventCount: 1 });
    }
  }

  return [...byUrl.values()].sort((a, b) => b.eventCount - a.eventCount);
}

/** `https://eventos.wiki/organizations/python-espana` → `.../events.json` */
export function buildOteFeedUrl(organizerUrl) {
  const trimmed = organizerUrl.replace(/\/+$/, "");
  return `${trimmed}/events.json`;
}

const MIN_CONTAINMENT_LENGTH = 6;

/** Una de las dos formas compactas empieza por la otra (prefijo, no subcadena suelta). */
export function isNameContained(communityName, organizerName) {
  const community = compactComparableText(communityName);
  const organizer = compactComparableText(organizerName);

  if (community.length < MIN_CONTAINMENT_LENGTH || organizer.length < MIN_CONTAINMENT_LENGTH) {
    return false;
  }

  return community.startsWith(organizer) || organizer.startsWith(community);
}

/**
 * Un organizador puede corresponder a varias comunidades (p. ej. dos con el mismo nombre
 * en el directorio); en ese caso el match se marca como ambiguo y no se aplica solo.
 */
export function matchOrganizer(organizer, communities) {
  const organizerName = normalizeComparableText(organizer.name);
  const organizerCompact = compactComparableText(organizer.name);
  const organizerUrl = normalizeUrlForComparison(organizer.url);

  const byExistingUrl = communities.filter((community) =>
    Object.values(community.urls ?? {}).some((url) => normalizeUrlForComparison(url) === organizerUrl)
  );
  if (byExistingUrl.length > 0) {
    return { confidence: "url", candidates: byExistingUrl };
  }

  const exact = communities.filter((community) => {
    const name = normalizeComparableText(community.name);
    return name === organizerName || compactComparableText(community.name) === organizerCompact;
  });
  if (exact.length > 0) {
    return { confidence: "exact", candidates: exact };
  }

  const fuzzy = communities.filter((community) =>
    areCommunityNamesSimilar(community.name, organizer.name)
  );
  if (fuzzy.length > 0) {
    return { confidence: "fuzzy", candidates: fuzzy };
  }

  // Muchos organizadores usan el nombre corto del directorio ("Codemotion" vs "Codemotion
  // Madrid", "BilboStack" vs "BilboStack Conference"). La contención sola no basta para
  // aplicar el enlace —"Flutter" casaría con nueve comunidades— así que queda para revisión.
  const partial = communities.filter((community) =>
    isNameContained(community.name, organizer.name)
  );
  if (partial.length > 0) {
    return { confidence: "partial", candidates: partial };
  }

  return { confidence: "none", candidates: [] };
}

export function buildMatchReport(catalog, communities) {
  return collectOrganizers(catalog).map((organizer) => {
    const { confidence, candidates } = matchOrganizer(organizer, communities);
    const oteUrl = buildOteFeedUrl(organizer.url);

    return {
      organizer: organizer.name,
      eventCount: organizer.eventCount,
      eventosWiki: organizer.url,
      ote: oteUrl,
      confidence,
      ambiguous: candidates.length > 1,
      matches: candidates.map((community) => ({
        id: community.id,
        name: community.name,
        slug: community.name,
        alreadyLinked: Boolean(community.urls?.eventosWiki) && Boolean(community.urls?.ote),
        archivedConflict: (community.archivedUrls ?? []).some((url) =>
          [organizer.url, oteUrl].some((candidate) =>
            normalizeUrlForComparison(url) === normalizeUrlForComparison(candidate)
          )
        ),
      })),
    };
  });
}

/**
 * Entradas que se pueden aplicar sin revisión humana: un único candidato, match no difuso
 * (salvo `--include-fuzzy`) y sin el canal archivado (regla del issue #353: lo archivado no
 * se reintroduce automáticamente).
 */
export function selectApplicableEntries(report, { includeFuzzy = false } = {}) {
  const accepted = new Set(includeFuzzy ? ["url", "exact", "partial", "fuzzy"] : ["url", "exact"]);

  return report.filter((entry) =>
    accepted.has(entry.confidence) &&
    !entry.ambiguous &&
    entry.matches.length === 1 &&
    !entry.matches[0].archivedConflict
  );
}

/** Devuelve las comunidades con `urls.eventosWiki` / `urls.ote` ya rellenos. */
export function applyMatches(communities, entries) {
  const updates = new Map();

  for (const entry of entries) {
    const [match] = entry.matches;
    updates.set(match.id, entry);
  }

  const changed = [];
  const nextCommunities = communities.map((community) => {
    const entry = updates.get(community.id);
    if (!entry) return community;

    const urls = { ...(community.urls ?? {}) };
    const additions = {};

    if (!urls.eventosWiki) additions.eventosWiki = entry.eventosWiki;
    if (!urls.ote) additions.ote = entry.ote;
    if (Object.keys(additions).length === 0) return community;

    changed.push({ id: community.id, name: community.name, additions });
    return { ...community, urls: { ...urls, ...additions } };
  });

  return { communities: nextCommunities, changed };
}

async function loadCatalog(options) {
  if (options.input) {
    return JSON.parse(fs.readFileSync(options.input, "utf8"));
  }

  const response = await fetch(EVENTOS_WIKI_CATALOG_URL, {
    headers: { Accept: "application/ote+json, application/json" },
  });

  if (!response.ok) {
    throw new Error(`eventos.wiki devolvió ${response.status}`);
  }

  return response.json();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = await loadCatalog(options);
  const communities = readCommunities();
  const report = buildMatchReport(catalog, communities);
  const applicable = selectApplicableEntries(report, { includeFuzzy: options.includeFuzzy });

  fs.writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const unmatched = report.filter((entry) => entry.confidence === "none");
  const ambiguous = report.filter((entry) => entry.ambiguous);
  const fuzzy = report.filter((entry) => ["fuzzy", "partial"].includes(entry.confidence));

  console.log(`Organizadores en eventos.wiki: ${report.length}`);
  console.log(`  · emparejados por URL ya presente: ${report.filter((e) => e.confidence === "url").length}`);
  console.log(`  · emparejados por nombre exacto:   ${report.filter((e) => e.confidence === "exact").length}`);
  console.log(`  · emparejados por similitud:       ${fuzzy.length}`);
  console.log(`  · ambiguos (varios candidatos):    ${ambiguous.length}`);
  console.log(`  · sin comunidad en el directorio:  ${unmatched.length}`);
  console.log(`Informe: ${options.reportPath}`);

  if (unmatched.length > 0) {
    console.log("\nSin match:");
    unmatched.forEach((entry) => console.log(`  - ${entry.organizer} (${entry.eventosWiki})`));
  }

  if (fuzzy.length > 0) {
    console.log("\nMatches por similitud (revisar):");
    fuzzy.forEach((entry) => {
      const names = entry.matches.map((m) => `${m.name} (#${m.id})`).join(", ");
      console.log(`  - ${entry.organizer} → ${names}`);
    });
  }

  if (!options.apply) {
    console.log(`\nAplicables ahora: ${applicable.length}. Repite con --apply para escribirlos.`);
    return;
  }

  const { communities: nextCommunities, changed } = applyMatches(communities, applicable);

  if (changed.length === 0) {
    console.log("\nNada que escribir: todos los matches aplicables ya estaban enlazados.");
    return;
  }

  writeCommunities(nextCommunities);
  console.log(`\n✔ ${changed.length} comunidades actualizadas:`);
  changed.forEach(({ id, name, additions }) => {
    console.log(`  - ${name} (#${id}): ${Object.keys(additions).join(", ")}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
