import fs from "node:fs";
import { execFileSync } from "node:child_process";

const COMMUNITIES_PATH = "public/data/communities.json";
const COMMUNITIES_META_PATH = "public/data/communities.meta.json";
const DELETED_COMMUNITIES_PATH = "public/data/deleted-communities.json";
const TAGS_PATH = "public/data/tags.json";
const AUDIENCE_PATH = "public/data/audience.json";

const CANONICAL_STATUS = new Set(["Activa", "Inactiva", "Desconocido"]);
const CANONICAL_COMMUNITY_TYPES = new Set([
  "Conferencia",
  "Grupo colaborativo",
  "Grupo de ayuda mutua",
  "Hacklab",
  "Meta comunidad",
  "Organización paraguas",
  "Tech Meetup",
]);
const CANONICAL_EVENT_FORMATS = new Set([
  "Desconocido",
  "Híbridos",
  "Online",
  "Presencial",
]);
const ALLOWED_URL_KEYS = new Set([
  "bluesky",
  "discord",
  "eventsUrl",
  "facebook",
  "github",
  "instagram",
  "linkAggregator",
  "linkedin",
  "mailingList",
  "mastodon",
  "telegram",
  "tiktok",
  "twitch",
  "twitter",
  "web",
  "youtube",
]);

function parseArgs(argv) {
  const options = {
    strictChanged: false,
    baselineRef: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--strict-changed") {
      options.strictChanged = true;
      continue;
    }

    if (arg.startsWith("--baseline-ref=")) {
      options.baselineRef = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--baseline-ref") {
      options.baselineRef = argv[index + 1] ?? null;
      index += 1;
    }
  }

  return options;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    throw new Error(`No se pudo leer o parsear ${filePath}: ${error.message}`);
  }
}

function readJsonFromGit(ref, filePath) {
  try {
    const raw = execFileSync("git", ["show", `${ref}:${filePath}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidCalendarDate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return false;
  }

  const [dayRaw, monthRaw, yearRaw] = value.split("/");
  const day = Number.parseInt(dayRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const year = Number.parseInt(yearRaw, 10);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function pushIssue(collection, type, message) {
  collection.push({ type, message });
}

function validateTaxonomyEntry(entry, index, label, issues) {
  const prefix = `${label}[${index}]`;

  if (!isPlainObject(entry)) {
    pushIssue(issues.errors, "error", `${prefix} debe ser un objeto.`);
    return;
  }

  for (const field of ["id", "label", "category", "description"]) {
    if (!isNonEmptyString(entry[field])) {
      pushIssue(
        issues.errors,
        "error",
        `${prefix}.${field} debe ser un string no vacío.`,
      );
    }
  }

  if (!Array.isArray(entry.synonyms)) {
    pushIssue(issues.errors, "error", `${prefix}.synonyms debe ser un array.`);
    return;
  }

  const duplicatedSynonyms = new Set();
  const seenSynonyms = new Set();

  for (const synonym of entry.synonyms) {
    if (!isNonEmptyString(synonym)) {
      pushIssue(
        issues.errors,
        "error",
        `${prefix}.synonyms solo puede contener strings no vacíos.`,
      );
      continue;
    }

    if (seenSynonyms.has(synonym)) {
      duplicatedSynonyms.add(synonym);
    }

    seenSynonyms.add(synonym);
  }

  if (duplicatedSynonyms.size > 0) {
    pushIssue(
      issues.warnings,
      "warning",
      `${prefix}.synonyms contiene duplicados: ${[...duplicatedSynonyms].join(", ")}.`,
    );
  }
}

function validateTaxonomy(entries, label) {
  const issues = { errors: [], warnings: [] };

  if (!Array.isArray(entries)) {
    pushIssue(issues.errors, "error", `${label} debe ser un array JSON.`);
    return issues;
  }

  const repeatedIds = new Map();

  entries.forEach((entry, index) => {
    validateTaxonomyEntry(entry, index, label, issues);

    if (isPlainObject(entry) && typeof entry.id === "string") {
      repeatedIds.set(entry.id, (repeatedIds.get(entry.id) ?? 0) + 1);
    }
  });

  for (const [id, count] of repeatedIds.entries()) {
    if (count > 1) {
      pushIssue(
        issues.errors,
        "error",
        `${label} contiene el ID duplicado "${id}" (${count} veces).`,
      );
    }
  }

  return issues;
}

function validateCommunityGlobal(community, index, knownTagIds, knownAudienceIds, issues) {
  const prefix = `communities[${index}]`;

  if (!isPlainObject(community)) {
    pushIssue(issues.errors, "error", `${prefix} debe ser un objeto.`);
    return;
  }

  const name = isNonEmptyString(community.name) ? community.name : `#${community.id ?? index}`;
  const label = `${name} (${prefix})`;

  if (!Number.isInteger(community.id)) {
    pushIssue(issues.errors, "error", `${label}: id debe ser un entero.`);
  }

  if (!Array.isArray(community.tags)) {
    pushIssue(issues.errors, "error", `${label}: tags debe ser un array.`);
  } else {
    const seenTags = new Set();

    for (const tagId of community.tags) {
      if (!isNonEmptyString(tagId)) {
        pushIssue(issues.errors, "error", `${label}: tags solo puede contener strings no vacíos.`);
        continue;
      }

      if (!knownTagIds.has(tagId)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: referencia una etiqueta inexistente en tags.json: "${tagId}".`,
        );
      }

      if (seenTags.has(tagId)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: tags contiene el ID duplicado "${tagId}".`,
        );
      }

      seenTags.add(tagId);
    }
  }

  if (!Array.isArray(community.targetAudience)) {
    pushIssue(issues.errors, "error", `${label}: targetAudience debe ser un array.`);
  } else {
    const seenAudience = new Set();

    for (const audienceId of community.targetAudience) {
      if (!isNonEmptyString(audienceId)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: targetAudience solo puede contener strings no vacíos.`,
        );
        continue;
      }

      if (!knownAudienceIds.has(audienceId)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: referencia una audiencia inexistente en audience.json: "${audienceId}".`,
        );
      }

      if (seenAudience.has(audienceId)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: targetAudience contiene el ID duplicado "${audienceId}".`,
        );
      }

      seenAudience.add(audienceId);
    }
  }

  if (!isPlainObject(community.latLon) || !("lat" in community.latLon) || !("lon" in community.latLon)) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: latLon debe ser un objeto con las claves lat y lon.`,
    );
  } else {
    for (const coordinate of ["lat", "lon"]) {
      const value = community.latLon[coordinate];

      if (value !== null && typeof value !== "number") {
        pushIssue(
          issues.errors,
          "error",
          `${label}: latLon.${coordinate} debe ser number o null.`,
        );
      }
    }
  }

  if ("displayOnMap" in community && typeof community.displayOnMap !== "boolean") {
    pushIssue(issues.errors, "error", `${label}: displayOnMap debe ser boolean.`);
  }

  if ("humanValidated" in community && typeof community.humanValidated !== "boolean") {
    pushIssue(issues.errors, "error", `${label}: humanValidated debe ser boolean.`);
  }

  if ("urls" in community && !isPlainObject(community.urls)) {
    pushIssue(issues.errors, "error", `${label}: urls debe ser un objeto.`);
  }

  if (isNonEmptyString(community.status) && !CANONICAL_STATUS.has(community.status)) {
    pushIssue(
      issues.warnings,
      "warning",
      `${label}: status no canónico "${community.status}". Valores recomendados: ${[...CANONICAL_STATUS].join(", ")}.`,
    );
  }

  if (
    isNonEmptyString(community.communityType) &&
    !CANONICAL_COMMUNITY_TYPES.has(community.communityType)
  ) {
    pushIssue(
      issues.warnings,
      "warning",
      `${label}: communityType no canónico "${community.communityType}".`,
    );
  }

  if (
    isNonEmptyString(community.eventFormat) &&
    !CANONICAL_EVENT_FORMATS.has(community.eventFormat)
  ) {
    pushIssue(
      issues.warnings,
      "warning",
      `${label}: eventFormat no canónico "${community.eventFormat}". Valores recomendados: ${[...CANONICAL_EVENT_FORMATS].join(", ")}.`,
    );
  }

  if (!isValidCalendarDate(community.lastReviewed ?? "")) {
    pushIssue(
      issues.warnings,
      "warning",
      `${label}: lastReviewed no sigue el formato dd/mm/yyyy o no es una fecha válida.`,
    );
  }

  if (!isNonEmptyString(community.communityUrl)) {
    pushIssue(
      issues.warnings,
      "warning",
      `${label}: falta communityUrl. Es un campo obligatorio para nuevas contribuciones.`,
    );
  }

  if (!isNonEmptyString(community.thumbnailUrl)) {
    pushIssue(
      issues.warnings,
      "warning",
      `${label}: falta thumbnailUrl. Es un campo obligatorio para nuevas contribuciones.`,
    );
  }
}

function validateCommunityStrict(community, index, issues, isNew = true) {
  const prefix = `communities[${index}]`;
  const name = isNonEmptyString(community.name) ? community.name : `#${community.id ?? index}`;
  const label = `${name} (${prefix})`;

  if (!Number.isInteger(community.id) || community.id < 0) {
    pushIssue(issues.errors, "error", `${label}: id debe ser un entero mayor o igual que 0.`);
  }

  const requiredFields = ["name", "status", "lastReviewed", "communityType", "eventFormat", "communityUrl"];

  if (isNew) {
    requiredFields.push("thumbnailUrl");
  }

  for (const field of requiredFields) {
    if (!isNonEmptyString(community[field])) {
      pushIssue(
        issues.errors,
        "error",
        `${label}: ${field} es obligatorio y debe ser un string no vacío.`,
      );
    }
  }

  if (!CANONICAL_STATUS.has(community.status)) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: status debe ser uno de ${[...CANONICAL_STATUS].join(", ")}.`,
    );
  }

  if (!CANONICAL_COMMUNITY_TYPES.has(community.communityType)) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: communityType debe ser uno de ${[...CANONICAL_COMMUNITY_TYPES].join(", ")}.`,
    );
  }

  if (!CANONICAL_EVENT_FORMATS.has(community.eventFormat)) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: eventFormat debe ser uno de ${[...CANONICAL_EVENT_FORMATS].join(", ")}.`,
    );
  }

  if (!isValidCalendarDate(community.lastReviewed ?? "")) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: lastReviewed debe usar el formato dd/mm/yyyy y ser una fecha real.`,
    );
  }

  if (!isValidUrl(community.communityUrl)) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: communityUrl debe ser una URL absoluta válida.`,
    );
  }

  if (!Array.isArray(community.tags)) {
    pushIssue(issues.errors, "error", `${label}: tags es obligatorio y debe ser un array.`);
  }

  if (!Array.isArray(community.targetAudience)) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: targetAudience es obligatorio y debe ser un array.`,
    );
  }

  if (!("displayOnMap" in community) || typeof community.displayOnMap !== "boolean") {
    pushIssue(
      issues.errors,
      "error",
      `${label}: displayOnMap es obligatorio y debe ser boolean.`,
    );
  }

  if (!isPlainObject(community.urls)) {
    pushIssue(issues.errors, "error", `${label}: urls debe ser un objeto.`);
  } else {
    for (const [key, value] of Object.entries(community.urls)) {
      if (!ALLOWED_URL_KEYS.has(key)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: urls contiene una clave no soportada: "${key}".`,
        );
      }

      if (!isValidUrl(value)) {
        pushIssue(
          issues.errors,
          "error",
          `${label}: urls.${key} debe ser una URL absoluta válida.`,
        );
      }
    }
  }

  if (
    community.displayOnMap === true &&
    (!isPlainObject(community.latLon) ||
      typeof community.latLon.lat !== "number" ||
      typeof community.latLon.lon !== "number")
  ) {
    pushIssue(
      issues.errors,
      "error",
      `${label}: si displayOnMap es true, latLon.lat y latLon.lon deben ser numéricos.`,
    );
  }
}

function getChangedCommunities(currentCommunities, baselineCommunities) {
  if (!Array.isArray(baselineCommunities)) {
    return [];
  }

  const baselineById = new Map();

  for (const community of baselineCommunities) {
    if (isPlainObject(community) && Number.isInteger(community.id)) {
      baselineById.set(community.id, JSON.stringify(community));
    }
  }

  return currentCommunities
    .filter((community) => {
      if (!isPlainObject(community) || !Number.isInteger(community.id)) {
        return true;
      }

      const baselineSerialized = baselineById.get(community.id);
      return baselineSerialized !== JSON.stringify(community);
    })
    .map((community) => ({
      community,
      isNew: !isPlainObject(community) || !Number.isInteger(community.id) || !baselineById.has(community.id),
    }));
}

function printIssues(title, entries) {
  if (entries.length === 0) {
    return;
  }

  console.error(`\n${title}`);

  for (const entry of entries) {
    console.error(`- ${entry.message}`);
  }
}

function validateCommunitiesMeta(meta, issues, communities, deletedCommunities) {
  if (!isPlainObject(meta)) {
    pushIssue(issues.errors, "error", "communities.meta.json debe ser un objeto.");
    return;
  }

  if (!Number.isInteger(meta.nextCommunityId) || meta.nextCommunityId < 1) {
    pushIssue(issues.errors, "error", "communities.meta.json.nextCommunityId debe ser un entero mayor que 0.");
    return;
  }

  const allIds = [];
  if (Array.isArray(communities)) {
    for (const community of communities) {
      if (isPlainObject(community) && Number.isInteger(community.id)) {
        allIds.push(community.id);
      }
    }
  }

  if (Array.isArray(deletedCommunities)) {
    for (const entry of deletedCommunities) {
      if (isPlainObject(entry) && Number.isInteger(entry.id)) {
        allIds.push(entry.id);
      }
    }
  }

  const maxKnownId = allIds.length > 0 ? Math.max(...allIds) : 0;
  if (meta.nextCommunityId <= maxKnownId) {
    pushIssue(
      issues.errors,
      "error",
      `communities.meta.json.nextCommunityId debe ser mayor que cualquier ID conocido. Valor actual: ${meta.nextCommunityId}, máximo detectado: ${maxKnownId}.`,
    );
  }
}

function validateDeletedCommunities(entries, issues, activeCommunities) {
  if (!Array.isArray(entries)) {
    pushIssue(issues.errors, "error", "deleted-communities.json debe ser un array JSON.");
    return;
  }

  const activeIds = new Set(
    Array.isArray(activeCommunities)
      ? activeCommunities
        .filter((community) => isPlainObject(community) && Number.isInteger(community.id))
        .map((community) => community.id)
      : [],
  );
  const repeatedDeletedIds = new Map();

  entries.forEach((entry, index) => {
    const prefix = `deletedCommunities[${index}]`;

    if (!isPlainObject(entry)) {
      pushIssue(issues.errors, "error", `${prefix} debe ser un objeto.`);
      return;
    }

    if (!Number.isInteger(entry.id) || entry.id < 0) {
      pushIssue(issues.errors, "error", `${prefix}.id debe ser un entero mayor o igual que 0.`);
    }

    if (!isNonEmptyString(entry.name)) {
      pushIssue(issues.errors, "error", `${prefix}.name debe ser un string no vacío.`);
    }

    if (!isValidCalendarDate(entry.deletedAt ?? "")) {
      pushIssue(issues.errors, "error", `${prefix}.deletedAt debe usar el formato dd/mm/yyyy y ser una fecha real.`);
    }

    if (!isNonEmptyString(entry.removalReason)) {
      pushIssue(issues.warnings, "warning", `${prefix}.removalReason conviene rellenarlo para mantener trazabilidad.`);
    }

    if ("communityUrl" in entry && entry.communityUrl !== "" && !isValidUrl(entry.communityUrl)) {
      pushIssue(issues.errors, "error", `${prefix}.communityUrl debe ser una URL absoluta válida cuando exista.`);
    }

    if ("deletedFromIssue" in entry && entry.deletedFromIssue !== null) {
      if (!Number.isInteger(entry.deletedFromIssue) || entry.deletedFromIssue < 1) {
        pushIssue(issues.errors, "error", `${prefix}.deletedFromIssue debe ser null o un entero mayor que 0.`);
      }
    }

    if (Number.isInteger(entry.id)) {
      repeatedDeletedIds.set(entry.id, (repeatedDeletedIds.get(entry.id) ?? 0) + 1);

      if (activeIds.has(entry.id)) {
        pushIssue(issues.errors, "error", `${prefix}.id entra en conflicto con una comunidad activa.`);
      }
    }
  });

  for (const [id, count] of repeatedDeletedIds.entries()) {
    if (count > 1) {
      pushIssue(issues.errors, "error", `deleted-communities.json contiene el ID duplicado ${id} (${count} veces).`);
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const issues = { errors: [], warnings: [] };

  let communities;
  let communitiesMeta;
  let deletedCommunities;
  let tags;
  let audience;

  try {
    communities = readJson(COMMUNITIES_PATH);
    communitiesMeta = readJson(COMMUNITIES_META_PATH);
    deletedCommunities = readJson(DELETED_COMMUNITIES_PATH);
    tags = readJson(TAGS_PATH);
    audience = readJson(AUDIENCE_PATH);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const tagIssues = validateTaxonomy(tags, "tags");
  const audienceIssues = validateTaxonomy(audience, "audience");
  issues.errors.push(...tagIssues.errors, ...audienceIssues.errors);
  issues.warnings.push(...tagIssues.warnings, ...audienceIssues.warnings);
  validateDeletedCommunities(deletedCommunities, issues, communities);
  validateCommunitiesMeta(communitiesMeta, issues, communities, deletedCommunities);

  if (!Array.isArray(communities)) {
    issues.errors.push({
      type: "error",
      message: "communities.json debe ser un array JSON.",
    });
  } else {
    const knownTagIds = new Set(tags.map((entry) => entry.id));
    const knownAudienceIds = new Set(audience.map((entry) => entry.id));
    const repeatedIds = new Map();

    communities.forEach((community, index) => {
      validateCommunityGlobal(community, index, knownTagIds, knownAudienceIds, issues);

      if (isPlainObject(community) && Number.isInteger(community.id)) {
        repeatedIds.set(community.id, (repeatedIds.get(community.id) ?? 0) + 1);
      }
    });

    for (const [id, count] of repeatedIds.entries()) {
      if (count > 1) {
        issues.errors.push({
          type: "error",
          message: `communities.json contiene el ID duplicado ${id} (${count} veces).`,
        });
      }
    }

    if (options.strictChanged) {
      const baselineCommunities = options.baselineRef
        ? readJsonFromGit(options.baselineRef, COMMUNITIES_PATH)
        : null;

      if (!baselineCommunities) {
        issues.warnings.push({
          type: "warning",
          message:
            "No se pudo cargar el baseline para validar solo comunidades modificadas. Se omite la validación estricta diferencial.",
        });
      } else {
        const changedCommunities = getChangedCommunities(communities, baselineCommunities);

        changedCommunities.forEach(({ community, isNew }) => {
          const index = communities.findIndex((entry) => entry?.id === community?.id);
          validateCommunityStrict(community, index, issues, isNew);
        });
      }
    }
  }

  printIssues("Errores de validación", issues.errors);

  if (issues.warnings.length > 0) {
    console.warn("\nAdvertencias");
    for (const entry of issues.warnings) {
      console.warn(`- ${entry.message}`);
    }
  }

  if (issues.errors.length > 0) {
    console.error(
      `\nValidación fallida con ${issues.errors.length} error(es) y ${issues.warnings.length} advertencia(s).`,
    );
    process.exit(1);
  }

  console.log(
    `Validación correcta. ${Array.isArray(communities) ? communities.length : 0} comunidades revisadas.`,
  );

  if (issues.warnings.length > 0) {
    console.log(
      `La validación ha detectado ${issues.warnings.length} advertencia(s) que conviene revisar.`,
    );
  }
}

main();
