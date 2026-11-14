import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import es from '../src/i18n/locales/es.json';
import { ANALYTICS_CONSENT } from '../src/lib/analyticsConsent.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key.split('.').reduce((data, part) => data?.[part], es) ?? key }),
}));

let consent = ANALYTICS_CONSENT.UNKNOWN;
vi.mock('../src/stores/analyticsConsent.store.js', () => ({
  useAnalyticsConsent: () => consent,
  useAnalyticsConsentStore: selector => selector({ consent, decide: vi.fn(), reopen: vi.fn() }),
}));

const { CookieConsentBanner } = await import('../src/components/CookieConsent/CookieConsentBanner.jsx');
const { Footer } = await import('../src/components/Footer.jsx');

beforeEach(() => { consent = ANALYTICS_CONSENT.UNKNOWN; });

describe('aviso de analítica', () => {
  it('pregunta mientras no haya respuesta, y da las dos opciones al mismo nivel', () => {
    const html = renderToStaticMarkup(<CookieConsentBanner />);
    expect(html).toContain(es.cookieConsent.message);
    expect(html).toContain(es.cookieConsent.accept);
    expect(html).toContain(es.cookieConsent.deny);
    // "No, gracias" no puede ser un enlace de letra pequeña: los dos son botones.
    expect([...html.matchAll(/<button/g)]).toHaveLength(2);
  });

  it('no dice nada una vez respondido, acepte o rechace', () => {
    consent = ANALYTICS_CONSENT.GRANTED;
    expect(renderToStaticMarkup(<CookieConsentBanner />)).toBe('');
    consent = ANALYTICS_CONSENT.DENIED;
    expect(renderToStaticMarkup(<CookieConsentBanner />)).toBe('');
  });
});

describe('pie', () => {
  it('cuenta con LibreCounter sin diferir la imagen: en móvil el pie está oculto', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('https://librecounter.org/counter.svg');
    // React 19 serializa el atributo en camelCase; HTML no distingue mayúsculas.
    expect(html.toLowerCase()).toContain('referrerpolicy="unsafe-url"');
    expect(html).not.toContain('loading="lazy"');
  });

  it('deja volver a decidir sobre la analítica', () => {
    expect(renderToStaticMarkup(<Footer />)).toContain(es.footer.analyticsPreferences);
  });
});
