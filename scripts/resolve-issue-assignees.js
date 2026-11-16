/* eslint-env node */
import fs from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";
import YAML from "yaml";
import { inferProvinceIdFromText, normalizeProvinceCandidate } from "../src/lib/provinceNormalization.js";

const ownersFilePath = ".github/community-owners.yml";
const communityBuildersFilePath = "public/data/community-builders-members.json";

function extractJsonPayload(body) {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function normalizeAssignees(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  return value.filter((assignee) => {
    if (!assignee) return false;
    const key = String(assignee).trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function buildAliasLookup(provinces = {}) {
  const aliasLookup = new Map();

  for (const [provinceId, config] of Object.entries(provinces)) {
    aliasLookup.set(normalizeText(provinceId), provinceId);

    for (const alias of config?.aliases ?? []) {
      aliasLookup.set(normalizeText(alias), provinceId);
    }
  }

  return aliasLookup;
}

function resolveProvinceId({ payload, aliasLookup }) {
  const directCandidates = [
    payload?.provinceId,
    payload?.location,
  ].filter(Boolean);

  for (const candidate of directCandidates) {
    const normalizedCandidate = normalizeText(candidate);
    if (aliasLookup.has(normalizedCandidate)) {
      return aliasLookup.get(normalizedCandidate);
    }

    const normalizedProvinceId = normalizeProvinceCandidate(candidate);
    if (normalizedProvinceId) {
      return normalizedProvinceId;
    }
  }

  if (payload?.location) {
    const inferredProvinceId = inferProvinceIdFromText(payload.location);
    if (inferredProvinceId) {
      return inferredProvinceId;
    }
  }

  return null;
}

export function resolveIssueAssignees({ body, ownersConfig, communityBuilders = [] }) {
  const payload = extractJsonPayload(body);
  const aliasLookup = buildAliasLookup(ownersConfig?.provinces ?? {});
  const provinceId = resolveProvinceId({ payload, aliasLookup });
  const provinceConfig = provinceId ? ownersConfig?.provinces?.[provinceId] : null;
  const defaultAssignees = normalizeAssignees(ownersConfig?.defaults?.assignees);
  const matchedAssignees = normalizeAssignees(provinceConfig?.assignees);
  const communityAssignees = normalizeAssignees(
    communityBuilders
      .filter(({ communityId }) => payload?.id != null && String(communityId) === String(payload.id))
      .map(({ github }) => github),
  );
  const assignees = [
    ...communityAssignees,
    ...(matchedAssignees.length > 0 ? matchedAssignees : defaultAssignees),
  ];
  const shouldFallback = matchedAssignees.length === 0;
  const fallbackReason = !shouldFallback
    ? null
    : provinceId
      ? "province-without-owner"
      : "province-unresolved";
  const labels = shouldFallback ? ["needs-area-owner"] : [];

  return {
    communityId: payload?.id ?? null,
    communityAssignees,
    provinceId,
    assignees: normalizeAssignees(assignees),
    labels,
    usedFallback: shouldFallback,
    fallbackReason,
  };
}

function main() {
  const issueBodyFilePath = process.argv[2];
  if (!issueBodyFilePath) {
    throw new Error("Falta la ruta al archivo con el cuerpo del issue");
  }

  const ownersConfig = YAML.parse(fs.readFileSync(ownersFilePath, "utf8"));
  const body = fs.readFileSync(issueBodyFilePath, "utf8");
  const communityBuilders = JSON.parse(fs.readFileSync(communityBuildersFilePath, "utf8"));
  process.stdout.write(JSON.stringify(resolveIssueAssignees({ body, ownersConfig, communityBuilders })));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
