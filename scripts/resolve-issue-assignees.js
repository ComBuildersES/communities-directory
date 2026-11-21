/* eslint-env node */
import fs from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";
import YAML from "yaml";
import { inferProvinceIdFromText, normalizeProvinceCandidate } from "../src/lib/provinceNormalization.js";
import { looksLikeLocationPlaceholder } from "../src/lib/communityLocations.js";

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

function resolveProvinceIdFromText(value, aliasLookup) {
  if (!value) return null;

  const normalizedCandidate = normalizeText(value);
  if (aliasLookup.has(normalizedCandidate)) {
    return aliasLookup.get(normalizedCandidate);
  }

  return normalizeProvinceCandidate(value) ?? inferProvinceIdFromText(value) ?? null;
}

/**
 * Provincias de la propuesta, la de la sede principal primero. Lo que mande el formulario
 * (`provinceIds`, o el `provinceId` escalar de antes) va delante; después lo que se infiere
 * **sede a sede** (issue #45): sobre el texto unido, la inferencia devolvía el primer alias de
 * su tabla, no la primera ciudad ("Madrid, Barcelona" → barcelona).
 */
export function resolveProvinceIds({ payload, aliasLookup = new Map() }) {
  const declared = [
    ...(Array.isArray(payload?.provinceIds) ? payload.provinceIds : []),
    payload?.provinceId,
  ];
  const fromLocations = (Array.isArray(payload?.locations) ? payload.locations : [])
    .filter((location) => location?.name && !looksLikeLocationPlaceholder(location.name))
    .map((location) => location.name);

  const ids = [];
  for (const candidate of [...declared, ...fromLocations]) {
    const id = resolveProvinceIdFromText(candidate, aliasLookup);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * Responsables de una propuesta. Con varias sedes se asigna a **todas** sus provincias: una
 * segunda sede sin auditar es justo lo que se cuela. Si alguna provincia no tiene
 * responsable (o no se ha podido resolver ninguna), se añaden además los asignados por
 * defecto y la etiqueta `needs-area-owner`.
 */
export function resolveIssueAssignees({ body, ownersConfig, communityBuilders = [] }) {
  const payload = extractJsonPayload(body);
  const aliasLookup = buildAliasLookup(ownersConfig?.provinces ?? {});
  const provinceIds = resolveProvinceIds({ payload, aliasLookup });
  const defaultAssignees = normalizeAssignees(ownersConfig?.defaults?.assignees);

  const provincesWithoutOwner = [];
  const matchedAssignees = [];
  for (const provinceId of provinceIds) {
    const owners = normalizeAssignees(ownersConfig?.provinces?.[provinceId]?.assignees);
    if (owners.length === 0) provincesWithoutOwner.push(provinceId);
    matchedAssignees.push(...owners);
  }

  const communityAssignees = normalizeAssignees(
    communityBuilders
      .filter(({ communityId }) => payload?.id != null && String(communityId) === String(payload.id))
      .map(({ github }) => github),
  );
  const shouldFallback = provinceIds.length === 0 || provincesWithoutOwner.length > 0;
  const assignees = [
    ...communityAssignees,
    ...matchedAssignees,
    ...(shouldFallback ? defaultAssignees : []),
  ];
  const fallbackReason = !shouldFallback
    ? null
    : provinceIds.length > 0
      ? "province-without-owner"
      : "province-unresolved";
  const labels = shouldFallback ? ["needs-area-owner"] : [];

  return {
    communityId: payload?.id ?? null,
    communityAssignees,
    // `provinceId` es la provincia de la sede principal: los logs de los workflows lo
    // imprimen como escalar.
    provinceId: provinceIds[0] ?? null,
    provinceIds,
    provincesWithoutOwner,
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
