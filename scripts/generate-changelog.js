import fs from "node:fs";
import { execFileSync } from "node:child_process";

const CHANGELOG_PATH = "CHANGELOG.md";
const COMMUNITIES_PATH = "public/data/communities.json";
const DELETED_COMMUNITIES_PATH = "public/data/deleted-communities.json";
const APP_COMMUNITY_URL = "https://combuilderses.github.io/communities-directory/?community=";
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
    .filter((entry) => !entry.subject.toLowerCase().startsWith("merge "));
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

function readJsonFromGit(ref, filePath) {
  try {
    const output = execFileSync("git", ["show", `${ref}:${filePath}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 50 * 1024 * 1024,
    });
    return JSON.parse(output);
  } catch {
    return null;
  }
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

    if (JSON.stringify(beforeMap.get(id)) !== JSON.stringify(entry)) {
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

function buildCommunityEntryLabel(action, community, prNumber) {
  if (!community?.name || !Number.isInteger(community?.id)) return null;

  const communityLink = `${APP_COMMUNITY_URL}${community.id}`;
  const label = `[${action} ${escapeMarkdown(community.name)}](${communityLink})`;

  if (!prNumber) {
    return label;
  }

  return `${label} ([PR #${prNumber}](${GITHUB_PR_URL}${prNumber}))`;
}

function getAutoCommunityEntry(commit, issueToPrMap) {
  const issueMatch = commit.subject.match(/issue #(\d+)/i);
  if (!issueMatch) return null;

  const issueNumber = Number(issueMatch[1]);
  const prNumber = issueToPrMap.get(issueNumber) ?? null;
  const parent = getParentCommit(commit.hash);
  if (!parent) return null;

  const beforeCommunities = readJsonFromGit(parent, COMMUNITIES_PATH);
  const afterCommunities = readJsonFromGit(commit.hash, COMMUNITIES_PATH);
  const beforeDeleted = readJsonFromGit(parent, DELETED_COMMUNITIES_PATH) ?? [];
  const afterDeleted = readJsonFromGit(commit.hash, DELETED_COMMUNITIES_PATH) ?? [];

  if (!Array.isArray(beforeCommunities) || !Array.isArray(afterCommunities)) {
    return null;
  }

  const activeChanges = getChangedIds(beforeCommunities, afterCommunities);
  const deletedChanges = getChangedIds(beforeDeleted, afterDeleted);

  if (activeChanges.added.length === 1 && activeChanges.removed.length === 0) {
    return buildCommunityEntryLabel("Añadida", activeChanges.added[0], prNumber);
  }

  if (activeChanges.changed.length === 1 && activeChanges.added.length === 0 && activeChanges.removed.length === 0) {
    return buildCommunityEntryLabel("Actualizada", activeChanges.changed[0], prNumber);
  }

  if (activeChanges.removed.length === 1 && deletedChanges.added.length === 1) {
    const removedCommunity = activeChanges.removed[0];
    const prLabel = prNumber ? `[PR #${prNumber}](${GITHUB_PR_URL}${prNumber})` : null;
    return prLabel
      ? `Eliminada ${escapeMarkdown(removedCommunity.name)} (${prLabel})`
      : `Eliminada ${escapeMarkdown(removedCommunity.name)}`;
  }

  return null;
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
    const autoCommunityEntry = category === "Data"
      ? getAutoCommunityEntry(commit, issueToPrMap)
      : null;
    const entries = monthEntry.get(category) ?? [];
    entries.push({
      ...commit,
      formattedSubject: autoCommunityEntry ?? formatSubject(commit.subject),
    });
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

main();
