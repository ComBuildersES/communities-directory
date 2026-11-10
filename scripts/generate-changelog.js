import fs from "node:fs";
import { execFileSync } from "node:child_process";
import process from "node:process";

const CHANGELOG_PATH = "CHANGELOG.md";
// Fuente de verdad: data/communities/ (el bundle de public/data/ es un artefacto generado).
import { readCommunitiesAtRef, readDeletedCommunitiesAtRef } from "./lib/communities-git.js";
import { readCommunities, slugifyCommunityName, stableStringify } from "./lib/communities-store.js";
const APP_COMMUNITY_URL = "https://directory.communitybuilders.dev/?community=";
const GITHUB_PR_URL = "https://github.com/ComBuildersES/communities-directory/pull/";
const CATEGORY_ORDER = [
  "Features",
  "Fixes",
  "Data",
  "Improvements",
  "Docs",
  "Maintenance",
  "Reverts",
  "Other",
];

/**
 * Commits de mantenimiento del propio changelog y de los ficheros que generan los bots.
 * Aparecían como "Docs" y ahogaban los cambios reales: el historial es para leerlo.
 */
const NOISE_SUBJECT_PATTERNS = [
  /^(?:docs(?:\([^)]*\))?:\s*)?update changelog\b/i,
  /^(?:docs(?:\([^)]*\))?:\s*)?update readme(?:\.md)?\b/i,
  /^(?:docs(?:\([^)]*\))?:\s*)?update \.all-contributorsrc\b/i,
  /^chore\(data\): asignar IDs de comunidad\b/i,
];

export function isNoiseCommitSubject(subject = "") {
  return NOISE_SUBJECT_PATTERNS.some((pattern) => pattern.test(subject.trim()));
}

function getGitLog() {
  const output = execFileSync(
    "git",
    [
      "log",
      "--no-merges",
      "--date=short",
      "--pretty=format:%H%x09%ad%x09%s",
    ],
    { encoding: "utf-8" },
  );

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...subjectParts] = line.split("\t");
      return {
        hash,
        shortHash: hash.slice(0, 7),
        date,
        month: date.slice(0, 7),
        subject: subjectParts.join("\t").trim(),
      };
    })
    .filter((entry) => !entry.subject.toLowerCase().startsWith("merge "))
    .filter((entry) => !isNoiseCommitSubject(entry.subject));
}

function getMergePullRequests() {
  const output = execFileSync(
    "git",
    [
      "log",
      "--merges",
      "--pretty=format:%s",
    ],
    { encoding: "utf-8" },
  );

  const map = new Map();

  for (const line of output.split("\n").map((entry) => entry.trim()).filter(Boolean)) {
    const match = line.match(/Merge pull request #(\d+) from .+\/community-issue-(\d+)/i);
    if (!match) continue;
    map.set(Number(match[2]), Number(match[1]));
  }

  return map;
}

function getParentCommit(hash) {
  const output = execFileSync("git", ["rev-list", "--parents", "-n", "1", hash], {
    encoding: "utf-8",
  }).trim();
  const parts = output.split(" ");
  return parts[1] ?? null;
}

function buildIdMap(entries) {
  const map = new Map();
  if (!Array.isArray(entries)) return map;

  for (const entry of entries) {
    if (entry && Number.isInteger(entry.id)) {
      map.set(entry.id, entry);
    }
  }

  return map;
}

/**
 * Empareja comunidades entre dos refs por `id` y, si no lo tienen, por slug del nombre.
 *
 * Hacen falta las dos claves: el `id` se asigna después del merge (ver
 * `assign-community-ids`), así que en el commit del alta todavía es `null` y solo el slug
 * identifica a la comunidad; en cambio una edición puede renombrarla, y entonces solo el
 * `id` la sigue identificando.
 */
export function getChangedCommunities(beforeEntries, afterEntries) {
  const before = Array.isArray(beforeEntries) ? beforeEntries : [];
  const after = Array.isArray(afterEntries) ? afterEntries : [];

  const beforeById = new Map();
  const beforeBySlug = new Map();

  for (const entry of before) {
    if (Number.isInteger(entry?.id)) beforeById.set(entry.id, entry);
    const slug = slugifyCommunityName(entry?.name);
    if (slug) beforeBySlug.set(slug, entry);
  }

  const matched = new Set();
  const added = [];
  const changed = [];

  for (const entry of after) {
    const match = (Number.isInteger(entry?.id) ? beforeById.get(entry.id) : undefined)
      ?? beforeBySlug.get(slugifyCommunityName(entry?.name));

    if (!match) {
      added.push(entry);
      continue;
    }

    matched.add(match);
    if (stableStringify(match) !== stableStringify(entry)) changed.push(entry);
  }

  return {
    added,
    changed,
    removed: before.filter((entry) => !matched.has(entry)),
  };
}

function getChangedIds(beforeEntries, afterEntries) {
  const beforeMap = buildIdMap(beforeEntries);
  const afterMap = buildIdMap(afterEntries);

  const added = [];
  const removed = [];
  const changed = [];

  for (const [id, entry] of afterMap.entries()) {
    if (!beforeMap.has(id)) {
      added.push(entry);
      continue;
    }

    if (stableStringify(beforeMap.get(id)) !== stableStringify(entry)) {
      changed.push(entry);
    }
  }

  for (const [id, entry] of beforeMap.entries()) {
    if (!afterMap.has(id)) {
      removed.push(entry);
    }
  }

  return { added, removed, changed };
}

function escapeMarkdown(text = "") {
  return String(text).replace(/[[\]\\]/g, "\\$&");
}

let currentIdsBySlug = null;

/**
 * Id actual de una comunidad. En el commit del alta el id era `null`, así que se resuelve
 * contra el estado presente de `data/communities/`, donde ya está asignado.
 */
function resolveCommunityId(community) {
  if (Number.isInteger(community?.id)) return community.id;

  if (!currentIdsBySlug) {
    currentIdsBySlug = new Map();
    for (const current of readCommunities()) {
      const slug = slugifyCommunityName(current?.name);
      if (slug && Number.isInteger(current.id)) currentIdsBySlug.set(slug, current.id);
    }
  }

  return currentIdsBySlug.get(slugifyCommunityName(community?.name)) ?? null;
}

function buildCommunityEntryLabel(action, community, prNumber) {
  if (!community?.name) return null;

  const communityId = resolveCommunityId(community);
  // Sin id resoluble (p. ej. comunidad eliminada después) se emite sin enlace.
  const label = communityId === null
    ? `${action} ${escapeMarkdown(community.name)}`
    : `[${action} ${escapeMarkdown(community.name)}](${APP_COMMUNITY_URL}${communityId})`;

  if (!prNumber) {
    return label;
  }

  return `${label} ([PR #${prNumber}](${GITHUB_PR_URL}${prNumber}))`;
}

/**
 * Describe qué le pasó a cada comunidad en un commit: una línea por comunidad, con su
 * acción, su enlace en el directorio y la PR de la que vino.
 *
 * Antes solo se resolvía el caso de "exactamente una comunidad tocada" y cualquier otro
 * caía al asunto crudo del commit ("Aplicar propuesta de comunidad del issue #123"), que
 * no dice ni cuál ni qué. Un commit puede tocar varias, y entonces interesan todas.
 */
export function describeCommunityChanges({ activeChanges, deletedChanges, prNumber = null }) {
  const labels = [];

  for (const community of activeChanges.added) {
    labels.push(buildCommunityEntryLabel("Añadida", community, prNumber));
  }

  for (const community of activeChanges.changed) {
    labels.push(buildCommunityEntryLabel("Actualizada", community, prNumber));
  }

  // Una baja solo se anuncia como tal si aparece en `data/deleted-communities/`. Sin ese
  // registro, la comunidad desapareció del listado por otro motivo (una migración, por
  // ejemplo) y llamarlo "eliminada" sería mentir.
  const deletedIds = new Set(deletedChanges.added.map((entry) => entry.id));

  for (const community of activeChanges.removed) {
    if (!deletedIds.has(community.id)) continue;

    const prLabel = prNumber ? `[PR #${prNumber}](${GITHUB_PR_URL}${prNumber})` : null;
    labels.push(
      prLabel
        ? `Eliminada ${escapeMarkdown(community.name)} (${prLabel})`
        : `Eliminada ${escapeMarkdown(community.name)}`
    );
  }

  return labels;
}

function getAutoCommunityEntries(commit, issueToPrMap) {
  const issueMatch = commit.subject.match(/issue #(\d+)/i);
  if (!issueMatch) return [];

  const issueNumber = Number(issueMatch[1]);
  const prNumber = issueToPrMap.get(issueNumber) ?? null;
  const parent = getParentCommit(commit.hash);
  if (!parent) return [];

  const beforeCommunities = readCommunitiesAtRef(parent);
  const afterCommunities = readCommunitiesAtRef(commit.hash);
  const beforeDeleted = readDeletedCommunitiesAtRef(parent) ?? [];
  const afterDeleted = readDeletedCommunitiesAtRef(commit.hash) ?? [];

  if (!Array.isArray(beforeCommunities) || !Array.isArray(afterCommunities)) {
    return [];
  }

  return describeCommunityChanges({
    activeChanges: getChangedCommunities(beforeCommunities, afterCommunities),
    deletedChanges: getChangedIds(beforeDeleted, afterDeleted),
    prNumber,
  });
}

function stripConventionalPrefix(subject) {
  return subject.replace(/^([a-z]+)(\([^)]+\))?!?:\s*/i, "");
}

function classifyCommit(subject) {
  const normalized = subject.toLowerCase();

  if (normalized.startsWith("feat:") || normalized.startsWith("feat(")) return "Features";
  if (normalized.startsWith("fix:") || normalized.startsWith("fix(")) return "Fixes";
  if (normalized.startsWith("perf:") || normalized.startsWith("perf(")) return "Improvements";
  if (normalized.startsWith("refactor:") || normalized.startsWith("refactor(")) return "Improvements";
  if (normalized.startsWith("docs:") || normalized.startsWith("docs(")) return "Docs";
  if (normalized.startsWith("revert:") || normalized.startsWith("revert(")) return "Reverts";

  if (
    normalized.startsWith("chore:") ||
    normalized.startsWith("chore(") ||
    normalized.startsWith("build:") ||
    normalized.startsWith("build(") ||
    normalized.startsWith("ci:") ||
    normalized.startsWith("ci(") ||
    normalized.startsWith("test:") ||
    normalized.startsWith("test(")
  ) {
    return "Maintenance";
  }

  if (
    normalized.startsWith("aplicar propuesta de comunidad") ||
    normalized.includes("community-issue") ||
    normalized.includes("communities.json") ||
    normalized.includes("community-builders-members.json")
  ) {
    return "Data";
  }

  return "Other";
}

function formatSubject(subject) {
  return stripConventionalPrefix(subject).replace(/\s+#(\d+)\s*$/u, " (#$1)");
}

function buildChangelog(commits) {
  const issueToPrMap = getMergePullRequests();
  const sections = new Map();

  for (const commit of commits) {
    const monthEntry = sections.get(commit.month) ?? new Map();
    const category = classifyCommit(commit.subject);
    const autoCommunityEntries = category === "Data"
      ? getAutoCommunityEntries(commit, issueToPrMap)
      : [];
    const entries = monthEntry.get(category) ?? [];

    // Un commit puede dar varias líneas: una por comunidad tocada.
    const subjects = autoCommunityEntries.length > 0
      ? autoCommunityEntries
      : [formatSubject(commit.subject)];

    for (const formattedSubject of subjects) {
      entries.push({ ...commit, formattedSubject });
    }
    monthEntry.set(category, entries);
    sections.set(commit.month, monthEntry);
  }

  const lines = [
    "# Changelog",
    "",
    "Historial generado automáticamente a partir de los commits del repositorio.",
    "Se organiza por mes y por tipo de cambio.",
    "",
  ];

  const sortedMonths = [...sections.keys()].sort((a, b) => b.localeCompare(a));

  for (const month of sortedMonths) {
    lines.push(`## ${month}`, "");

    const monthEntry = sections.get(month);
    for (const category of CATEGORY_ORDER) {
      const entries = monthEntry.get(category) ?? [];
      if (entries.length === 0) continue;

      lines.push(`### ${category}`, "");
      for (const entry of entries) {
        lines.push(`- ${entry.date} \`${entry.shortHash}\` ${entry.formattedSubject}`);
      }
      lines.push("");
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function main() {
  const commits = getGitLog();
  const changelog = buildChangelog(commits);
  fs.writeFileSync(CHANGELOG_PATH, changelog);
  console.log(`CHANGELOG.md actualizado con ${commits.length} commit(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
