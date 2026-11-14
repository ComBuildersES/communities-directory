import { create } from "zustand";
import {
  ANALYTICS_CONSENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  resolveAnalyticsConsentState,
  serializeAnalyticsConsent,
} from "../lib/analyticsConsent.js";

function readStoredState() {
  try { return resolveAnalyticsConsentState(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)); }
  catch { return ANALYTICS_CONSENT.UNKNOWN; }
}

export const useAnalyticsConsentStore = create((set) => ({
  consent: readStoredState(),
  /** `decision` es "granted" o "denied"; se persiste con fecha para que caduque. */
  decide: (decision) => {
    try { window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, serializeAnalyticsConsent(decision)); }
    catch { /* La decisión vale para esta sesión aunque el almacenamiento esté bloqueado. */ }
    set({ consent: decision });
  },
  /** Volver a preguntar: lo que necesita quien cambia de opinión desde el pie. */
  reopen: () => {
    try { window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY); }
    catch { /* Igual que arriba. */ }
    set({ consent: ANALYTICS_CONSENT.UNKNOWN });
  },
}));

export const useAnalyticsConsent = () => useAnalyticsConsentStore((state) => state.consent);
export const useAnalyticsConsentActions = () =>
  useAnalyticsConsentStore((state) => ({ decide: state.decide, reopen: state.reopen }));
