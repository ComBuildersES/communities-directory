/**
 * Fuzzy matching utilities for tag/community search.
 * Supports:
 * - Diacritic normalization ("estandares" → matches "Estándares web")
 * - Multi-token matching ("web stand" matches "Estándares web" — all tokens must appear)
 * - One edit or adjacent transposition, also in word prefixes, for tokens of length ≥ 4
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
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

/** Distancia de edición con inversión de dos letras adyacentes (Damerau–Levenshtein). */
function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 1) return 2;
  const distances = Array.from({ length: m + 1 }, (_, row) =>
    Array.from({ length: n + 1 }, (_, column) => row === 0 ? column : column === 0 ? row : 0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      distances[i][j] = Math.min(distances[i - 1][j] + 1, distances[i][j - 1] + 1, distances[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        distances[i][j] = Math.min(distances[i][j], distances[i - 2][j - 2] + 1);
      }
    }
  }
  return distances[m][n];
}

/**
 * Check if a (normalized) query token matches a (normalized) target word.
 * Coincidencia literal o una errata en la palabra o su prefijo (mínimo cuatro letras).
 */
function tokenMatches(token, word) {
  if (word.includes(token)) return true;
  if (token.length >= 4) {
    for (const length of [token.length - 1, token.length, token.length + 1]) {
      if (editDistance(token, word.slice(0, length)) <= 1) return true;
    }
  }
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
    return null;
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

  // «C» y «R» son temáticas completas, no prefijos de todo el catálogo.
  if (nq.length === 1) {
    if (normalize(item.label) === nq) return 7;
    return (item.synonyms ?? []).some((value) => normalize(value) === nq) ? 2 : null;
  }

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
  if (normalize(query).length === 1 && normalize(query) !== normalize(name)) return null;
  return scoreNormalized(normalize(query), normalize(name));
}

/** Coincidencia de todas las palabras, sin sustituirlas por aproximaciones. */
export function matchesCommunityName(query, name) {
  const nq = normalize(query);
  const nt = normalize(name);
  if (!nq || !nt) return false;
  if (nq.length === 1) return nq === nt;
  return nq.split(" ").every((token) => nt.includes(token));
}

/** Sugerencias alternativas: erratas o solo parte de una consulta de varias palabras. */
export function scoreRelatedCommunity(query, name) {
  if (matchesCommunityName(query, name)) return null;
  const score = scoreCommunity(query, name);
  if (score !== null) return score;
  const tokens = normalize(query).split(" ").filter((token) => token.length >= 2);
  if (tokens.length < 2) return null;
  const matched = tokens.filter((token) => scoreCommunity(token, name) !== null).length;
  return matched > 0 ? matched / tokens.length : null;
}
