import { normalizeCommunityLangs } from "./communityLanguages.js";

const GITHUB_NEW_ISSUE_URL = "https://github.com/ComBuildersES/communities-directory/issues/new";

export const COMMUNITY_STATUS_OPTIONS = ["active", "inactive", "unknown"];
export const COMMUNITY_TYPE_OPTIONS = [
  "tech-meetup",
  "conference",
  "umbrella-org",
  "hacklab",
  "collaborative-group",
  "meta-community",
  "mutual-aid",
];
export const EVENT_FORMAT_OPTIONS = ["in-person", "online", "hybrid", "unknown"];
export const EVENT_FORMATS_WITH_LOCATION = ["in-person", "hybrid"];
export const SHORT_DESCRIPTION_MAX_LENGTH = 280;

export const URL_PLATFORM_OPTIONS = [
  { key: "web" },
  { key: "eventsUrl" },
  { key: "linkAggregator" },
  { key: "mailingList" },
  { key: "github" },
  { key: "discord" },
  { key: "telegram" },
  { key: "whatsapp" },
  { key: "slack" },
  { key: "youtube" },
  { key: "linkedin" },
  { key: "twitter" },
  { key: "tiktok" },
  { key: "instagram" },
  { key: "facebook" },
  { key: "mastodon" },
  { key: "bluesky" },
  { key: "twitch" },
  { key: "flickr" },
];

export const COMMUNITY_ISSUE_MODES = {
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
};

const CONTRIBUTION_MODE_PARAM = "contribute";
const EDIT_PARAM = "edit";
const COMMUNITY_PARAM = "community";
const PROPOSAL_PARAM = "proposal";
const CONTRIBUTION_DRAFT_STORAGE_PREFIX = "community-directory-contribution-draft";
const DIRECTORY_FILTER_KEYS = [
  "status",
  "communityType",
  "eventFormat",
  "langs",
  "tags",
  "targetAudience",
  "name",
];
const FILTER_KEY_SHORT = {
  status: "s",
  communityType: "ct",
  eventFormat: "ef",
  langs: "langs",
  tags: "t",
  targetAudience: "ta",
  name: "n",
};

function getTodayDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasQueryParamValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeComparableText(value = "") {
  return cleanString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function compactComparableText(value = "") {
  return normalizeComparableText(value).replace(/[^a-z0-9]+/g, "");
}

function getLevenshteinDistance(source = "", target = "") {
  if (source === target) return 0;
  if (!source.length) return target.length;
  if (!target.length) return source.length;

  const previousRow = Array.from({ length: target.length + 1 }, (_, index) => index);

  for (let i = 0; i < source.length; i += 1) {
    let previousDiagonal = previousRow[0];
    previousRow[0] = i + 1;

    for (let j = 0; j < target.length; j += 1) {
      const temp = previousRow[j + 1];
      const substitutionCost = source[i] === target[j] ? 0 : 1;

      previousRow[j + 1] = Math.min(
        previousRow[j + 1] + 1,
        previousRow[j] + 1,
        previousDiagonal + substitutionCost
      );

      previousDiagonal = temp;
    }
  }

  return previousRow[target.length];
}

export function areCommunityNamesSimilar(source = "", target = "") {
  const normalizedSource = normalizeComparableText(source);
  const normalizedTarget = normalizeComparableText(target);
  const compactSource = compactComparableText(source);
  const compactTarget = compactComparableText(target);

  if (!compactSource || !compactTarget) return false;
  if (normalizedSource === normalizedTarget) return true;
  if (compactSource === compactTarget) return true;

  const shortestLength = Math.min(compactSource.length, compactTarget.length);
  const longestLength = Math.max(compactSource.length, compactTarget.length);

  if (shortestLength < 6) return false;
  if (compactSource.includes(compactTarget) || compactTarget.includes(compactSource)) {
    return longestLength - shortestLength <= 3;
  }

  const distance = getLevenshteinDistance(compactSource, compactTarget);

  if (longestLength <= 10) {
    return distance <= 1;
  }

  if (longestLength <= 18) {
    return distance <= 2;
  }

  return distance <= 3;
}

export function normalizeUrlForComparison(value = "") {
  const cleanedValue = cleanString(value);
  if (!cleanedValue) return "";

  try {
    const parsedUrl = new URL(cleanedValue);
    parsedUrl.hash = "";

    const pathname = parsedUrl.pathname.replace(/\/+$/, "");
    const search = parsedUrl.search === "?" ? "" : parsedUrl.search;
    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

    return `${parsedUrl.protocol.toLowerCase()}//${host}${pathname}${search}`.toLowerCase();
  } catch {
    return cleanedValue
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\/+$/, "");
  }
}

export function getComparableCommunityUrls(community = {}) {
  return [
    community.communityUrl,
    ...Object.values(normalizeUrls(community.urls ?? {})),
  ]
    .map((url) => normalizeUrlForComparison(url))
    .filter(Boolean);
}

export function slugifyCommunityName(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseContributionRoute(search = window.location.search) {
  const params = new URLSearchParams(search);
  const contributeMode = params.get(CONTRIBUTION_MODE_PARAM);
  const editIdentifier = params.get(EDIT_PARAM);
  const proposalDraft = parseProposalDraft(params);

  if (editIdentifier) {
    return { mode: "edit", identifier: editIdentifier, proposalDraft };
  }

  if (contributeMode === "new") {
    return { mode: "new", identifier: null, proposalDraft };
  }

  return { mode: "directory", identifier: null, proposalDraft: null };
}

export function buildContributionPath({
  mode = "new",
  identifier = null,
  proposalDraft = null,
  pathname = window.location.pathname,
} = {}) {
  const params = new URLSearchParams();

  if (mode === "edit" && hasQueryParamValue(identifier)) {
    params.set(EDIT_PARAM, String(identifier));
  }

  if (mode === "new") {
    params.set(CONTRIBUTION_MODE_PARAM, "new");
  }

  const serializedProposalDraft = serializeProposalDraft(proposalDraft);
  if (serializedProposalDraft) {
    params.set(PROPOSAL_PARAM, serializedProposalDraft);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function parseSelectedCommunityIdentifier(search = window.location.search) {
  const params = new URLSearchParams(search);
  return params.get(COMMUNITY_PARAM);
}

export function parseMapState(search = window.location.search) {
  const params = new URLSearchParams(search);
  const raw = params.get("m");
  if (!raw) return null;

  const parts = raw.split(",").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;

  const [lat, lon, zoom] = parts;
  return { lat, lon, zoom };
}

export function parseDirectoryFilters(search = window.location.search) {
  const params = new URLSearchParams(search);

  return DIRECTORY_FILTER_KEYS.reduce((filters, key) => {
    // Accept short key (current format) or long key (backwards compat)
    const raw = params.get(FILTER_KEY_SHORT[key]) ?? params.get(key);
    const values = raw ? raw.split(",").map((v) => v.trim()).filter(Boolean) : [];

    if (values.length > 0) {
      filters[key] = values;
    }

    return filters;
  }, {});
}

export function buildDirectoryFilterPath({ filters = {}, pathname = window.location.pathname } = {}) {
  return buildDirectoryStatePath({ filters, pathname });
}

export function buildDirectoryStatePath({
  filters = {},
  pathname = window.location.pathname,
  communityIdentifier = null,
} = {}) {
  const params = new URLSearchParams();

  DIRECTORY_FILTER_KEYS.forEach((key) => {
    const rawValues = filters[key];
    const values = Array.isArray(rawValues)
      ? rawValues
      : rawValues
        ? [rawValues]
        : [];

    const filtered = values.filter(Boolean);
    if (filtered.length === 0) return;
    // Omit status=active (default) to keep URLs short
    if (key === "status" && filtered.length === 1 && filtered[0] === "active") return;
    params.set(FILTER_KEY_SHORT[key], filtered.join(","));
  });

  if (hasQueryParamValue(communityIdentifier)) {
    params.set(COMMUNITY_PARAM, String(communityIdentifier));
  }

  const query = params.toString().replace(/%2C/gi, ",");
  return query ? `${pathname}?${query}` : pathname;
}

export function getContributionDraftStorageKey({ mode = "new", identifier = null } = {}) {
  const normalizedMode = mode === "edit" && hasQueryParamValue(identifier) ? "edit" : "new";
  const normalizedIdentifier = normalizedMode === "edit" ? String(identifier) : "new";
  return `${CONTRIBUTION_DRAFT_STORAGE_PREFIX}:${normalizedMode}:${normalizedIdentifier}`;
}

export function loadContributionDraft(storageKey) {
  if (!storageKey || typeof window === "undefined") return null;

  try {
    const rawDraft = window.localStorage.getItem(storageKey);
    if (!rawDraft) return null;
    return JSON.parse(rawDraft);
  } catch {
    return null;
  }
}

export function saveContributionDraft(storageKey, draft) {
  if (!storageKey || typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearContributionDraft(storageKey) {
  if (!storageKey || typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}

export function resolveCommunityFromIdentifier(communities, identifier) {
  if (!hasQueryParamValue(identifier)) return null;

  const rawIdentifier = String(identifier).trim();
  return communities.find((community) => {
    const idMatches = String(community.id) === rawIdentifier;
    const slugMatches = slugifyCommunityName(community.name) === rawIdentifier;
    return idMatches || slugMatches;
  }) ?? null;
}

export function getEmptyCommunityDraft(nextId = null) {
  return {
    id: nextId,
    name: "",
    status: "active",
    lastReviewed: getTodayDate(),
    communityType: "tech-meetup",
    eventFormat: "in-person",
    location: "",
    provinceId: "",
    shortDescription: "",
    topics: "",
    langs: ["es"],
    tags: [],
    targetAudience: [],
    contactInfo: "",
    communityUrl: "",
    urls: {},
    thumbnailUrl: "",
    replaceThumbnail: false,
    latLon: {
      lat: "",
      lon: "",
    },
    displayOnMap: true,
    humanValidated: true,
  };
}

export function getCommunityDraft(community, nextId = null) {
  if (!community) {
    return getEmptyCommunityDraft(nextId);
  }

  const isUmbrella = community.communityType === "umbrella-org";

  return {
    ...getEmptyCommunityDraft(nextId),
    ...community,
    langs: normalizeCommunityLangs(community.langs),
    tags: Array.isArray(community.tags) ? community.tags : [],
    targetAudience: Array.isArray(community.targetAudience) ? community.targetAudience : [],
    urls: community.urls ?? {},
    replaceThumbnail: false,
    latLon: {
      lat: community.latLon?.lat ?? "",
      lon: community.latLon?.lon ?? "",
    },
    displayOnMap: Boolean(community.displayOnMap),
    humanValidated: Boolean(community.humanValidated),
    ...(isUmbrella && { location: "n/a" }),
  };
}

export function getNextCommunityId(communities) {
  if (!Array.isArray(communities) || communities.length === 0) return 1;
  return Math.max(...communities.map((community) => Number(community.id) || 0)) + 1;
}

export function getCommunityDeletionPayload(community, reason = "") {
  return {
    id: community?.id ?? null,
    name: cleanString(community?.name),
    communityUrl: cleanString(community?.communityUrl),
    removalReason: cleanString(reason),
  };
}

export function toggleSelection(list, value) {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }
  return [...list, value];
}

export function normalizeUrls(urls = {}) {
  return Object.fromEntries(
    Object.entries(urls)
      .map(([key, value]) => [cleanString(key), cleanString(value)])
      .filter(([key, value]) => key && value)
  );
}

export function serializeProposalDraft(proposalDraft) {
  if (!isPlainObject(proposalDraft)) return "";

  try {
    return JSON.stringify(proposalDraft);
  } catch {
    return "";
  }
}

export function parseProposalDraft(paramsOrSearch = window.location.search) {
  const params = typeof paramsOrSearch === "string"
    ? new URLSearchParams(paramsOrSearch)
    : paramsOrSearch;
  const rawProposal = params.get(PROPOSAL_PARAM);

  if (!hasQueryParamValue(rawProposal)) return null;

  try {
    const parsedProposal = JSON.parse(rawProposal);
    return isPlainObject(parsedProposal) ? parsedProposal : null;
  } catch {
    return null;
  }
}

function normalizeLatLon(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildCommunityPayload(draft, existingCommunity = null) {
  const normalizedUrls = normalizeUrls(draft.urls);
  const lat = normalizeLatLon(draft.latLon?.lat);
  const lon = normalizeLatLon(draft.latLon?.lon);
  const resolvedId = existingCommunity?.id ?? draft.id ?? null;
  const currentReviewDate = getTodayDate();
  const normalizedEventFormat = cleanString(draft.eventFormat) || "unknown";
  const supportsLocation = EVENT_FORMATS_WITH_LOCATION.includes(normalizedEventFormat);
  const isUmbrellaOrganization = cleanString(draft.communityType) === "umbrella-org";
  const normalizedLocation = isUmbrellaOrganization
    ? "n/a"
    : supportsLocation
      ? cleanString(draft.location)
      : "";
  const normalizedThumbnailUrl = draft.replaceThumbnail
    ? cleanString(draft.thumbnailUrl)
    : cleanString(existingCommunity?.thumbnailUrl ?? draft.thumbnailUrl);

  return {
    id: resolvedId,
    name: cleanString(draft.name),
    status: cleanString(draft.status) || "unknown",
    lastReviewed: currentReviewDate,
    communityType: cleanString(draft.communityType) || "tech-meetup",
    eventFormat: normalizedEventFormat,
    location: normalizedLocation,
    provinceId: cleanString(draft.provinceId),
    shortDescription: cleanString(draft.shortDescription),
    topics: cleanString(draft.topics),
    langs: normalizeCommunityLangs(draft.langs),
    tags: Array.isArray(draft.tags) ? draft.tags : [],
    targetAudience: Array.isArray(draft.targetAudience) ? draft.targetAudience : [],
    contactInfo: cleanString(draft.contactInfo),
    communityUrl: cleanString(draft.communityUrl),
    urls: normalizedUrls,
    thumbnailUrl: normalizedThumbnailUrl,
    latLon: {
      lat,
      lon,
    },
    displayOnMap: Boolean(normalizedLocation),
    humanValidated: true,
  };
}

export function buildIssueContent({ payload, mode, shareUrl }) {
  const issueTypeLabel = mode === COMMUNITY_ISSUE_MODES.EDIT
    ? "Edición"
    : mode === COMMUNITY_ISSUE_MODES.DELETE
      ? "Baja"
      : "Nueva comunidad";
  const issueTitlePrefix = mode === COMMUNITY_ISSUE_MODES.EDIT
    ? "Editar comunidad"
    : mode === COMMUNITY_ISSUE_MODES.DELETE
      ? "Eliminar comunidad"
      : "Añadir comunidad";
  const title = `[${issueTitlePrefix}] ${payload.name || "Sin nombre"}`;
  const bodyLines = [
    "<!-- community-directory-submission:v2 -->",
    "## Tipo de propuesta",
    issueTypeLabel,
  ];

  if (mode === COMMUNITY_ISSUE_MODES.DELETE) {
    bodyLines.push(
      "",
      "## Motivo de la baja",
      payload.removalReason || "Explica brevemente por qué conviene eliminar esta comunidad del directorio.",
    );
  } else {
    bodyLines.push(
      "",
      "## Enlace de edición",
      shareUrl,
    );
  }

  bodyLines.push(
    "",
    "## JSON propuesto",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  );

  const body = bodyLines.join("\n");

  return { title, body };
}

export function buildGitHubIssueUrl({ payload, mode, shareUrl }) {
  const { title, body } = buildIssueContent({ payload, mode, shareUrl });
  const url = new URL(GITHUB_NEW_ISSUE_URL);
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}

export function buildCommunityDeletionIssueUrl({ community, reason = "" }) {
  const payload = getCommunityDeletionPayload(community, reason);
  const shareUrl = `${window.location.origin}${window.location.pathname}?community=${community?.id ?? ""}`;
  return buildGitHubIssueUrl({
    payload,
    mode: COMMUNITY_ISSUE_MODES.DELETE,
    shareUrl,
  });
}
