import { execFileSync } from "node:child_process";

const COMMUNITIES_PATH = "public/data/communities.json";

function execGit(args) {
  return execFileSync("git", args, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 50 * 1024 * 1024,
  }).trim();
}

function tryExecGit(args) {
  try {
    return execGit(args);
  } catch {
    return null;
  }
}

function readJsonFromGit(ref, filePath) {
  try {
    const raw = execGit(["show", `${ref}:${filePath}`]);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getParentCommit(ref) {
  const output = tryExecGit(["rev-list", "--parents", "-n", "1", ref]);
  if (!output) return null;

  const parts = output.split(" ");
  return parts[1] ?? null;
}

function getRemoteBranches() {
  return execGit(["branch", "-r", "--format=%(refname:short)"])
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("origin/add-community-"));
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeUrl(value = "") {
  const cleaned = String(value).trim();
  if (!cleaned) return "";

  try {
    const parsed = new URL(cleaned);
    parsed.hash = "";
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = parsed.pathname.replace(/\/+$/, "");
    const search = parsed.search === "?" ? "" : parsed.search;
    return `${parsed.protocol.toLowerCase()}//${host}${pathname}${search}`.toLowerCase();
  } catch {
    return cleaned.toLowerCase().replace(/^www\./, "").replace(/\/+$/, "");
  }
}

function getComparableUrls(community = {}) {
  return [
    community.communityUrl,
    ...Object.values(community.urls ?? {}),
  ]
    .map((value) => normalizeUrl(value))
    .filter(Boolean);
}

function buildMasterIndexes(communities) {
  const byName = new Map();
  const byUrl = new Map();

  for (const community of communities) {
    if (!community || !Number.isInteger(community.id)) continue;

    const normalizedName = normalizeText(community.name);
    if (normalizedName) {
      const entries = byName.get(normalizedName) ?? [];
      entries.push(community);
      byName.set(normalizedName, entries);
    }

    for (const url of getComparableUrls(community)) {
      const entries = byUrl.get(url) ?? [];
      entries.push(community);
      byUrl.set(url, entries);
    }
  }

  return { byName, byUrl };
}

function getBranchIntroducedCommunities(baseCommunities, branchCommunities) {
  const baseIds = new Set(
    Array.isArray(baseCommunities)
      ? baseCommunities
        .filter((community) => community && Number.isInteger(community.id))
        .map((community) => community.id)
      : [],
  );

  return (Array.isArray(branchCommunities) ? branchCommunities : [])
    .filter((community) => community && Number.isInteger(community.id))
    .filter((community) => !baseIds.has(community.id));
}

function findMasterMatches(community, masterIndexes) {
  const matches = new Map();
  const nameMatches = masterIndexes.byName.get(normalizeText(community.name)) ?? [];
  for (const match of nameMatches) {
    matches.set(match.id, { id: match.id, name: match.name, reason: "name" });
  }

  for (const url of getComparableUrls(community)) {
    const urlMatches = masterIndexes.byUrl.get(url) ?? [];
    for (const match of urlMatches) {
      const existing = matches.get(match.id);
      matches.set(match.id, {
        id: match.id,
        name: match.name,
        reason: existing ? `${existing.reason}+url` : "url",
      });
    }
  }

  return [...matches.values()];
}

function analyzeBranch(branch, masterCommunities, masterIndexes) {
  const parentCommit = getParentCommit(branch);
  if (!parentCommit) {
    return {
      branch,
      status: "error",
      introducedCommunities: [],
      reason: "No se pudo localizar el commit padre de la rama.",
    };
  }

  const baseCommunities = readJsonFromGit(parentCommit, COMMUNITIES_PATH);
  const branchCommunities = readJsonFromGit(branch, COMMUNITIES_PATH);

  if (!Array.isArray(baseCommunities) || !Array.isArray(branchCommunities)) {
    return {
      branch,
      status: "error",
      introducedCommunities: [],
      reason: "No se pudo leer communities.json en la rama o en su commit padre.",
    };
  }

  const introducedCommunities = getBranchIntroducedCommunities(baseCommunities, branchCommunities);
  if (introducedCommunities.length === 0) {
    return {
      branch,
      status: "no_unique_additions",
      introducedCommunities: [],
      reason: "La rama no introduce comunidades nuevas respecto a su commit padre.",
    };
  }

  const results = introducedCommunities.map((community) => ({
    id: community.id,
    name: community.name,
    communityUrl: community.communityUrl ?? "",
    matchesInMaster: findMasterMatches(community, masterIndexes),
  }));

  const allPresentInMaster = results.every((entry) => entry.matchesInMaster.length > 0);
  return {
    branch,
    status: allPresentInMaster ? "likely_stale" : "needs_review",
    introducedCommunities: results,
  };
}

function printReport(report) {
  const stale = report.filter((entry) => entry.status === "likely_stale");
  const review = report.filter((entry) => entry.status === "needs_review");
  const empty = report.filter((entry) => entry.status === "no_unique_additions");
  const errors = report.filter((entry) => entry.status === "error");

  console.log("## Ramas add-community probablemente eliminables");
  if (stale.length === 0) {
    console.log("- Ninguna");
  } else {
    for (const branch of stale) {
      const details = branch.introducedCommunities.map((community) => {
        const matches = community.matchesInMaster
          .map((match) => `${match.name} (#${match.id}, ${match.reason})`)
          .join("; ");
        return `${community.name} -> ${matches}`;
      }).join(" | ");
      console.log(`- ${branch.branch}: ${details}`);
    }
  }

  console.log("\n## Ramas add-community para revisar");
  if (review.length === 0) {
    console.log("- Ninguna");
  } else {
    for (const branch of review) {
      const details = branch.introducedCommunities.map((community) => {
        const suffix = community.matchesInMaster.length > 0
          ? `coincidencias parciales: ${community.matchesInMaster.map((match) => `${match.name} (#${match.id}, ${match.reason})`).join("; ")}`
          : "sin coincidencias en master";
        return `${community.name} (${suffix})`;
      }).join(" | ");
      console.log(`- ${branch.branch}: ${details}`);
    }
  }

  console.log("\n## Ramas sin aportación única detectable");
  if (empty.length === 0) {
    console.log("- Ninguna");
  } else {
    for (const branch of empty) {
      console.log(`- ${branch.branch}: ${branch.reason}`);
    }
  }

  if (errors.length > 0) {
    console.log("\n## Errores");
    for (const branch of errors) {
      console.log(`- ${branch.branch}: ${branch.reason}`);
    }
  }
}

function main() {
  const masterCommunities = readJsonFromGit("origin/master", COMMUNITIES_PATH);
  if (!Array.isArray(masterCommunities)) {
    throw new Error("No se pudo leer public/data/communities.json desde origin/master.");
  }

  const masterIndexes = buildMasterIndexes(masterCommunities);
  const branches = getRemoteBranches();
  const report = branches.map((branch) => analyzeBranch(branch, masterCommunities, masterIndexes));
  printReport(report);
}

main();
