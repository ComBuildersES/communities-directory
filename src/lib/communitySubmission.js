const GITHUB_NEW_ISSUE_URL = "https://github.com/ComBuildersES/communities-directory/issues/new";

export const COMMUNITY_STATUS_OPTIONS = ["Activa", "Inactiva", "Desconocido"];
export const COMMUNITY_TYPE_OPTIONS = [
  "Tech Meetup",
  "Conferencia",
  "Organización paraguas",
  "Hacklab",
  "Grupo colaborativo",
  "Meta comunidad",
  "Grupo de ayuda mutua",
];
export const EVENT_FORMAT_OPTIONS = ["Presencial", "Online", "Híbridos", "Desconocido"];
export const EVENT_FORMATS_WITH_LOCATION = ["Presencial", "Híbridos"];

export const URL_PLATFORM_OPTIONS = [
  { key: "web", label: "Web" },
  { key: "meetup", label: "Meetup" },
  { key: "github", label: "GitHub" },
  { key: "discord", label: "Discord" },
  { key: "telegram", label: "Telegram" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "Twitter/X" },
  { key: "instagram", label: "Instagram" },
  { key: "mastodon", label: "Mastodon" },
  { key: "bluesky", label: "Bluesky" },
];

const CONTRIBUTION_MODE_PARAM = "contribute";
const EDIT_PARAM = "edit";

function getTodayDate() {
  return new Date().toLocaleDateString("es-ES");
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
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

  if (editIdentifier) {
    return { mode: "edit", identifier: editIdentifier };
  }

  if (contributeMode === "new") {
    return { mode: "new", identifier: null };
  }

  return { mode: "directory", identifier: null };
}

export function buildContributionPath({ mode = "new", identifier = null, pathname = window.location.pathname } = {}) {
  const params = new URLSearchParams();

  if (mode === "edit" && identifier) {
    params.set(EDIT_PARAM, String(identifier));
  }

  if (mode === "new") {
    params.set(CONTRIBUTION_MODE_PARAM, "new");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function resolveCommunityFromIdentifier(communities, identifier) {
  if (!identifier) return null;

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
    status: "Activa",
    lastReviewed: getTodayDate(),
    communityType: "Tech Meetup",
    eventFormat: "Presencial",
    location: "",
    topics: "",
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

  return {
    ...getEmptyCommunityDraft(nextId),
    ...community,
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
  };
}

export function getNextCommunityId(communities) {
  if (!Array.isArray(communities) || communities.length === 0) return 1;
  return Math.max(...communities.map((community) => Number(community.id) || 0)) + 1;
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
  const normalizedEventFormat = cleanString(draft.eventFormat) || "Desconocido";
  const supportsLocation = EVENT_FORMATS_WITH_LOCATION.includes(normalizedEventFormat);
  const isUmbrellaOrganization = cleanString(draft.communityType) === "Organización paraguas";
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
    status: cleanString(draft.status) || "Desconocido",
    lastReviewed: currentReviewDate,
    communityType: cleanString(draft.communityType) || "Tech Meetup",
    eventFormat: normalizedEventFormat,
    location: normalizedLocation,
    topics: cleanString(draft.topics),
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
  const issueTypeLabel = mode === "edit" ? "Edición" : "Nueva comunidad";
  const issueTitlePrefix = mode === "edit" ? "Editar comunidad" : "Añadir comunidad";
  const title = `[${issueTitlePrefix}] ${payload.name || "Sin nombre"}`;
  const body = [
    "<!-- community-directory-submission:v2 -->",
    `## Tipo de propuesta`,
    issueTypeLabel,
    "",
    "## Enlace de edición",
    shareUrl,
    "",
    "## JSON propuesto",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  ].join("\n");

  return { title, body };
}

export function buildGitHubIssueUrl({ payload, mode, shareUrl }) {
  const { title, body } = buildIssueContent({ payload, mode, shareUrl });
  const url = new URL(GITHUB_NEW_ISSUE_URL);
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}
