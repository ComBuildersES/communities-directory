/**
 * Qué se guarda de la decisión sobre la analítica, y cuándo se vuelve a preguntar.
 *
 * La decisión vive aquí y no dentro del banner por el motivo de siempre en este
 * proyecto: lo que falla no da error, da una web que mide sin permiso (si un valor
 * ilegible se lee como "concedido") o que no mide nunca (si se lee como "denegado"
 * y además se deja de preguntar). Ante cualquier duda, el estado es `UNKNOWN`:
 * preguntar otra vez es molesto; medir sin consentimiento, no es legal.
 */

export const ANALYTICS_CONSENT_STORAGE_KEY = "directory-analytics-consent";

/**
 * Sube la versión solo si cambia **para qué** se usan los datos. Volver a preguntar
 * por un cambio de redacción gasta la paciencia de quien ya respondió.
 */
export const ANALYTICS_CONSENT_VERSION = 1;

export const ANALYTICS_CONSENT = {
  UNKNOWN: "unknown",
  GRANTED: "granted",
  DENIED: "denied",
};

/** Un año: la decisión caduca, pero no tan pronto como para que el banner sea rutina. */
export const ANALYTICS_CONSENT_TTL_DAYS = 365;
const TTL_MS = ANALYTICS_CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000;

export function serializeAnalyticsConsent(decision, now = Date.now()) {
  return JSON.stringify({ decision, at: now, version: ANALYTICS_CONSENT_VERSION });
}

export function parseAnalyticsConsent(raw) {
  if (typeof raw !== "string" || !raw) return null;
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { return null; }
  if (!parsed || typeof parsed !== "object") return null;
  const { decision, at, version } = parsed;
  if (decision !== ANALYTICS_CONSENT.GRANTED && decision !== ANALYTICS_CONSENT.DENIED) return null;
  if (!Number.isFinite(at)) return null;
  return { decision, at, version: Number.isFinite(version) ? version : 0 };
}

/**
 * Devuelve siempre uno de los tres estados. `UNKNOWN` es "hay que preguntar": cubre el
 * primer visitante, el valor corrupto, la decisión caducada y la tomada sobre una
 * versión anterior del aviso.
 */
export function resolveAnalyticsConsentState(raw, now = Date.now()) {
  const stored = parseAnalyticsConsent(raw);
  if (!stored) return ANALYTICS_CONSENT.UNKNOWN;
  if (stored.version !== ANALYTICS_CONSENT_VERSION) return ANALYTICS_CONSENT.UNKNOWN;
  if (now - stored.at >= TTL_MS) return ANALYTICS_CONSENT.UNKNOWN;
  return stored.decision;
}

export function isAnalyticsGranted(raw, now = Date.now()) {
  return resolveAnalyticsConsentState(raw, now) === ANALYTICS_CONSENT.GRANTED;
}
