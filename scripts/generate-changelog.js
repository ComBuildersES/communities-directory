import fs from "node:fs";
import { execFileSync } from "node:child_process";

const CHANGELOG_PATH = "CHANGELOG.md";
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
  const sections = new Map();

  for (const commit of commits) {
    const monthEntry = sections.get(commit.month) ?? new Map();
    const category = classifyCommit(commit.subject);
    const entries = monthEntry.get(category) ?? [];
    entries.push({
      ...commit,
      formattedSubject: formatSubject(commit.subject),
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
