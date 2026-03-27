/**
 * Fuzzy matching utilities for tag/community search.
 * Supports:
 * - Diacritic normalization ("estandares" → matches "Estándares web")
 * - Multi-token matching ("web stand" matches "Estándares web" — all tokens must appear)
 * - Levenshtein distance ≤ 1 for tokens of length ≥ 4 (typo tolerance)
 *
 * Scoring (higher = better match):
 *   7 = exact label match
 *   6 = label starts with query
 *   5 = label contains query
 *   4 = all query tokens match in label (multi-token or fuzzy)
 *   3 = fuzzy token match in label (single token, Levenshtein ≤ 1)
 *   2 = exact/contains match in description or synonyms
 *   1 = fuzzy match in description or synonyms
 */

/** Remove diacritics and lowercase. */
export function normalize(str) {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Levenshtein distance between two strings. */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/**
 * Check if a (normalized) query token matches a (normalized) target word.
 * Matches if the word contains the token, or if Levenshtein distance ≤ 1
 * for tokens of length ≥ 4.
 */
function tokenMatches(token, word) {
  if (word.includes(token)) return true;
  if (token.length >= 4 && levenshtein(token, word) <= 1) return true;
  return false;
}

/**
 * Score a pre-normalized query against a pre-normalized target string.
 * Returns null if no match, or a positive number (higher = better).
 */
function scoreNormalized(nq, nt) {
  if (!nq || !nt) return null;

  if (nt === nq) return 5;
  if (nt.startsWith(nq)) return 4;
  if (nt.includes(nq)) return 3;

  const tokens = nq.split(/\s+/).filter(Boolean);
  const targetWords = nt.split(/[\s\-_/]+/).filter(Boolean);

  if (tokens.length > 1) {
    const allMatch = tokens.every(
      (token) => nt.includes(token) || targetWords.some((word) => tokenMatches(token, word))
    );
    if (allMatch) return 2;
  }

  // Fuzzy single-token match against any word in the target
  const firstToken = tokens[0];
  if (firstToken && targetWords.some((word) => tokenMatches(firstToken, word))) return 1;

  return null;
}

/**
 * Score a query against a tag/audience item.
 * Label matches score higher than description/synonym matches.
 * Returns null if no match.
 */
export function scoreItem(query, item) {
  const nq = normalize(query);

  const labelScore = scoreNormalized(nq, normalize(item.label));
  if (labelScore !== null) return labelScore + 2; // boost label matches

  const extraFields = [item.description, item.category, ...(item.synonyms ?? [])].filter(Boolean);

  let best = null;
  for (const field of extraFields) {
    const s = scoreNormalized(nq, normalize(field));
    if (s !== null && (best === null || s > best)) best = s;
  }

  return best;
}

/**
 * Score a query against a community name.
 * Returns null if no match.
 */
export function scoreCommunity(query, name) {
  return scoreNormalized(normalize(query), normalize(name));
}
