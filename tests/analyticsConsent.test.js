import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ANALYTICS_CONSENT,
  ANALYTICS_CONSENT_TTL_DAYS,
  ANALYTICS_CONSENT_VERSION,
  isAnalyticsGranted,
  parseAnalyticsConsent,
  resolveAnalyticsConsentState,
  serializeAnalyticsConsent,
} from '../src/lib/analyticsConsent.js';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

const DAY_MS = 24 * 60 * 60 * 1000;

describe('estado del consentimiento de analítica', () => {
  it('sin nada guardado hay que preguntar', () => {
    expect(resolveAnalyticsConsentState(null)).toBe(ANALYTICS_CONSENT.UNKNOWN);
    expect(resolveAnalyticsConsentState('')).toBe(ANALYTICS_CONSENT.UNKNOWN);
  });

  it('recuerda las dos respuestas', () => {
    const now = Date.now();
    expect(resolveAnalyticsConsentState(serializeAnalyticsConsent('granted', now), now)).toBe('granted');
    expect(resolveAnalyticsConsentState(serializeAnalyticsConsent('denied', now), now)).toBe('denied');
  });

  it('un valor ilegible o inventado no concede nada: se vuelve a preguntar', () => {
    expect(resolveAnalyticsConsentState('{')).toBe(ANALYTICS_CONSENT.UNKNOWN);
    expect(resolveAnalyticsConsentState('true')).toBe(ANALYTICS_CONSENT.UNKNOWN);
    expect(resolveAnalyticsConsentState(JSON.stringify({ decision: 'yes', at: Date.now(), version: 1 })))
      .toBe(ANALYTICS_CONSENT.UNKNOWN);
    expect(isAnalyticsGranted('granted')).toBe(false);
  });

  it('la decisión caduca al año', () => {
    const now = Date.now();
    const stored = serializeAnalyticsConsent('granted', now - (ANALYTICS_CONSENT_TTL_DAYS + 1) * DAY_MS);
    expect(resolveAnalyticsConsentState(stored, now)).toBe(ANALYTICS_CONSENT.UNKNOWN);
  });

  it('una decisión tomada sobre otra versión del aviso se vuelve a preguntar', () => {
    const now = Date.now();
    const stored = JSON.stringify({ decision: 'granted', at: now, version: ANALYTICS_CONSENT_VERSION - 1 });
    expect(resolveAnalyticsConsentState(stored, now)).toBe(ANALYTICS_CONSENT.UNKNOWN);
  });

  it('lo que se guarda lleva fecha y versión', () => {
    const parsed = parseAnalyticsConsent(serializeAnalyticsConsent('denied', 1700000000000));
    expect(parsed).toEqual({ decision: 'denied', at: 1700000000000, version: ANALYTICS_CONSENT_VERSION });
  });
});

describe('store de consentimiento', () => {
  function stubStorage(initial = new Map()) {
    vi.stubGlobal('window', { localStorage: {
      getItem: key => initial.get(key) ?? null,
      setItem: (key, value) => initial.set(key, value),
      removeItem: key => initial.delete(key),
    } });
    return initial;
  }

  it('recuerda la respuesta al volver a cargar la página', async () => {
    stubStorage();
    vi.resetModules();
    let { useAnalyticsConsentStore: store } = await import('../src/stores/analyticsConsent.store.js');
    expect(store.getState().consent).toBe(ANALYTICS_CONSENT.UNKNOWN);
    store.getState().decide(ANALYTICS_CONSENT.GRANTED);
    vi.resetModules();
    ({ useAnalyticsConsentStore: store } = await import('../src/stores/analyticsConsent.store.js'));
    expect(store.getState().consent).toBe(ANALYTICS_CONSENT.GRANTED);
  });

  it('reabrir vuelve a preguntar, también tras recargar', async () => {
    stubStorage();
    vi.resetModules();
    let { useAnalyticsConsentStore: store } = await import('../src/stores/analyticsConsent.store.js');
    store.getState().decide(ANALYTICS_CONSENT.DENIED);
    store.getState().reopen();
    expect(store.getState().consent).toBe(ANALYTICS_CONSENT.UNKNOWN);
    vi.resetModules();
    ({ useAnalyticsConsentStore: store } = await import('../src/stores/analyticsConsent.store.js'));
    expect(store.getState().consent).toBe(ANALYTICS_CONSENT.UNKNOWN);
  });

  it('con el almacenamiento bloqueado la decisión vale para la sesión y no rompe', async () => {
    vi.stubGlobal('window', { localStorage: {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    } });
    vi.resetModules();
    const { useAnalyticsConsentStore: store } = await import('../src/stores/analyticsConsent.store.js');
    expect(store.getState().consent).toBe(ANALYTICS_CONSENT.UNKNOWN);
    store.getState().decide(ANALYTICS_CONSENT.GRANTED);
    expect(store.getState().consent).toBe(ANALYTICS_CONSENT.GRANTED);
  });
});

describe('carga de GTM', () => {
  it('no se pide nada a Google hasta que alguien acepta, y sólo una vez', async () => {
    const appended = [];
    const byId = new Map();
    const documentStub = {
      getElementById: id => byId.get(id) ?? null,
      createElement: () => ({ set id(value) { this._id = value; }, get id() { return this._id; } }),
      head: { appendChild: node => { appended.push(node); byId.set(node.id, node); } },
    };
    const dataLayer = [];
    vi.stubGlobal('window', { dataLayer });
    vi.stubGlobal('document', documentStub);
    vi.resetModules();
    const { enableAnalytics, GTM_CONTAINER_ID } = await import('../src/lib/analytics.js');

    expect(appended).toHaveLength(0);
    expect(enableAnalytics()).toBe(true);
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toContain(`gtm.js?id=${GTM_CONTAINER_ID}`);
    expect(appended[0].async).toBe(true);
    expect([...dataLayer[0]]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);

    expect(enableAnalytics()).toBe(false);
    expect(appended).toHaveLength(1);
  });
});
