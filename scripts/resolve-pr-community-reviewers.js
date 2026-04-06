/* eslint-env node */
import fs from "node:fs";
import process from "node:process";

function normalizeGitHubHandle(value) {
  return String(value ?? "")
    .trim()
    .replace(/^@+/, "");
}

function normalizeCommunityId(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  return String(value).trim();
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

function readJsonFile(filePath, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return null;
  }
}

function buildCommunityMap(communities = []) {
  const map = new Map();

  for (const community of communities) {
    const communityId = normalizeCommunityId(community?.id);
    if (!communityId) continue;
    map.set(communityId, community);
  }

  return map;
}

function buildMemberMap(members = []) {
  const map = new Map();

  for (const entry of members) {
    const communityId = normalizeCommunityId(entry?.communityId);
    const github = normalizeGitHubHandle(entry?.github);
    if (!communityId || !github) continue;

    if (!map.has(communityId)) {
      map.set(communityId, []);
    }

    const handles = map.get(communityId);
    const normalizedHandle = github.toLowerCase();

    if (!handles.some((handle) => handle.toLowerCase() === normalizedHandle)) {
      handles.push(github);
    }
  }

  return map;
}

function detectChangedCommunities(baseCommunities = [], headCommunities = []) {
  const baseMap = buildCommunityMap(baseCommunities);
  const headMap = buildCommunityMap(headCommunities);
  const allIds = new Set([...baseMap.keys(), ...headMap.keys()]);
  const changedCommunities = [];

  for (const communityId of allIds) {
    const baseCommunity = baseMap.get(communityId) ?? null;
    const headCommunity = headMap.get(communityId) ?? null;

    if (stableStringify(baseCommunity) === stableStringify(headCommunity)) {
      continue;
    }

    changedCommunities.push({
      id: communityId,
      name: headCommunity?.name ?? baseCommunity?.name ?? `Community ${communityId}`,
      changeType: !baseCommunity
        ? "created"
        : !headCommunity
          ? "deleted"
          : "updated",
    });
  }

  return changedCommunities.sort((left, right) => Number(left.id) - Number(right.id));
}

function collectCommunityReviewers(changedCommunities, baseMemberMap, headMemberMap) {
  const reviewers = [];
  const seenHandles = new Set();

  for (const community of changedCommunities) {
    const handles = [
      ...(baseMemberMap.get(community.id) ?? []),
      ...(headMemberMap.get(community.id) ?? []),
    ];

    for (const handle of handles) {
      const normalizedHandle = handle.toLowerCase();
      if (seenHandles.has(normalizedHandle)) continue;
      seenHandles.add(normalizedHandle);
      reviewers.push(handle);
    }
  }

  return reviewers;
}

function buildEmptyResult(errors = []) {
  return {
    changedCommunities: [],
    communityReviewers: [],
    errors,
  };
}

function main() {
  const [
    baseCommunitiesPath,
    headCommunitiesPath,
    baseMembersPath,
    headMembersPath,
  ] = process.argv.slice(2);

  if (!baseCommunitiesPath || !headCommunitiesPath || !baseMembersPath || !headMembersPath) {
    throw new Error(
      "Uso: node scripts/resolve-pr-community-reviewers.js <base-communities> <head-communities> <base-members> <head-members>"
    );
  }

  const errors = [];
  const baseCommunities = readJsonFile(baseCommunitiesPath, "base communities", errors);
  const headCommunities = readJsonFile(headCommunitiesPath, "head communities", errors);
  const baseMembers = readJsonFile(baseMembersPath, "base members", errors);
  const headMembers = readJsonFile(headMembersPath, "head members", errors);

  if (!Array.isArray(baseCommunities) || !Array.isArray(headCommunities) || !Array.isArray(baseMembers) || !Array.isArray(headMembers)) {
    process.stdout.write(JSON.stringify(buildEmptyResult(errors)));
    return;
  }

  const changedCommunities = detectChangedCommunities(baseCommunities, headCommunities);
  const baseMemberMap = buildMemberMap(baseMembers);
  const headMemberMap = buildMemberMap(headMembers);
  const communityReviewers = collectCommunityReviewers(changedCommunities, baseMemberMap, headMemberMap);

  process.stdout.write(JSON.stringify({
    changedCommunities,
    communityReviewers,
    errors,
  }));
}

main();
