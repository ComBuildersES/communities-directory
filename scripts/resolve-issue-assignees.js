/* eslint-env node */
import fs from "node:fs";
import process from "node:process";
import YAML from "yaml";
import { inferProvinceIdFromText, normalizeProvinceCandidate } from "../src/lib/provinceNormalization.js";

const ownersFilePath = ".github/community-owners.yml";

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
  return Array.isArray(value) ? [...new Set(value.filter(Boolean))] : [];
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

function main() {
  const issueBodyFilePath = process.argv[2];
  if (!issueBodyFilePath) {
    throw new Error("Falta la ruta al archivo con el cuerpo del issue");
  }

  const ownersConfig = YAML.parse(fs.readFileSync(ownersFilePath, "utf8"));
  const body = fs.readFileSync(issueBodyFilePath, "utf8");
  const payload = extractJsonPayload(body);
  const aliasLookup = buildAliasLookup(ownersConfig?.provinces ?? {});
  const provinceId = resolveProvinceId({ payload, aliasLookup });
  const provinceConfig = provinceId ? ownersConfig?.provinces?.[provinceId] : null;
  const defaultAssignees = normalizeAssignees(ownersConfig?.defaults?.assignees);
  const matchedAssignees = normalizeAssignees(provinceConfig?.assignees);
  const assignees = matchedAssignees.length > 0 ? matchedAssignees : defaultAssignees;
  const shouldFallback = matchedAssignees.length === 0;
  const fallbackReason = !shouldFallback
    ? null
    : provinceId
      ? "province-without-owner"
      : "province-unresolved";
  const labels = shouldFallback ? ["needs-area-owner"] : [];

  process.stdout.write(JSON.stringify({
    provinceId,
    assignees,
    labels,
    usedFallback: shouldFallback,
    fallbackReason,
  }));
}

main();
