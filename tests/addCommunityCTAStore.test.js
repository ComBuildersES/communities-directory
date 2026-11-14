import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it('recuerda cerrar y reabrir la tarjeta al volver a cargar la página', async () => {
  const saved = new Map();
  vi.stubGlobal('window', { localStorage: {
    getItem: key => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
    removeItem: key => saved.delete(key),
  } });
  vi.resetModules();
  let { useAddCommunityCTAStore: store } = await import('../src/stores/addCommunityCTA.store.js');
  expect(store.getState().isDismissed).toBe(false);
  store.getState().setDismissed(true);
  vi.resetModules();
  ({ useAddCommunityCTAStore: store } = await import('../src/stores/addCommunityCTA.store.js'));
  expect(store.getState().isDismissed).toBe(true);
  store.getState().setDismissed(false);
  vi.resetModules();
  ({ useAddCommunityCTAStore: store } = await import('../src/stores/addCommunityCTA.store.js'));
  expect(store.getState().isDismissed).toBe(false);
});

it('el cierre caduca: al mes la invitación vuelve a aparecer', async () => {
  const saved = new Map();
  vi.stubGlobal('window', { localStorage: {
    getItem: key => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
    removeItem: key => saved.delete(key),
  } });
  vi.resetModules();
  let { useAddCommunityCTAStore: store } = await import('../src/stores/addCommunityCTA.store.js');
  store.getState().setDismissed(true);
  const { ADD_COMMUNITY_CTA_STORAGE_KEY } = await import('../src/stores/addCommunityCTA.store.js');
  const { ADD_COMMUNITY_CTA_DISMISS_DAYS } = await import('../src/lib/addCommunityCTA.js');
  const stale = Date.now() - (ADD_COMMUNITY_CTA_DISMISS_DAYS + 1) * 24 * 60 * 60 * 1000;
  saved.set(ADD_COMMUNITY_CTA_STORAGE_KEY, String(stale));
  vi.resetModules();
  ({ useAddCommunityCTAStore: store } = await import('../src/stores/addCommunityCTA.store.js'));
  expect(store.getState().isDismissed).toBe(false);
});

it('permite cerrar y reabrir aunque el navegador bloquee el almacenamiento', async () => {
  const blocked = () => { throw new Error('storage blocked'); };
  vi.stubGlobal('window', { localStorage: { getItem: blocked, setItem: blocked, removeItem: blocked } });
  vi.resetModules();
  const { useAddCommunityCTAStore: store } = await import('../src/stores/addCommunityCTA.store.js');
  expect(store.getState().isDismissed).toBe(false);
  expect(() => store.getState().setDismissed(true)).not.toThrow();
  expect(store.getState().isDismissed).toBe(true);
  store.getState().setDismissed(false);
  expect(store.getState().isDismissed).toBe(false);
});
