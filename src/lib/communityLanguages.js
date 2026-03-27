export const COMMUNITY_LANGUAGE_OPTIONS = ["es", "en", "ca", "eu", "gl", "oc"];
export const DEFAULT_COMMUNITY_LANGS = ["es"];
export const COMMUNITY_LANGUAGE_SET = new Set(COMMUNITY_LANGUAGE_OPTIONS);

export function normalizeCommunityLangs(value, { fallback = DEFAULT_COMMUNITY_LANGS } = {}) {
  const rawValues = Array.isArray(value) ? value : [];
  const normalized = [...new Set(
    rawValues
      .map((item) => typeof item === "string" ? item.trim().toLowerCase() : "")
      .filter((item) => COMMUNITY_LANGUAGE_SET.has(item))
  )];

  return normalized.length > 0 ? normalized : [...fallback];
}
