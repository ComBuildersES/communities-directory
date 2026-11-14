import { create } from "zustand";
import { isCtaDismissed, serializeCtaDismissal } from "../lib/addCommunityCTA.js";

export const ADD_COMMUNITY_CTA_STORAGE_KEY = "directory-add-community-cta-dismissed";

export function createDismissStore(storageKey) {
  let isDismissed = false;
  try { isDismissed = isCtaDismissed(window.localStorage.getItem(storageKey)); }
  catch { /* El cierre sigue funcionando aunque el almacenamiento esté bloqueado. */ }
  return create(set => ({
    isDismissed,
    setDismissed: dismissed => {
      try {
        if (dismissed) window.localStorage.setItem(storageKey, serializeCtaDismissal());
        else window.localStorage.removeItem(storageKey);
      } catch { /* Mantener la interacción durante la sesión. */ }
      set({ isDismissed: dismissed });
    },
  }));
}

export const useAddCommunityCTAStore = createDismissStore(ADD_COMMUNITY_CTA_STORAGE_KEY);
