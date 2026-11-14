import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ANALYTICS_CONSENT } from "../../lib/analyticsConsent.js";
import { enableAnalytics } from "../../lib/analytics.js";
import { useAnalyticsConsent, useAnalyticsConsentStore } from "../../stores/analyticsConsent.store.js";
import "./CookieConsent.css";

/**
 * Aviso de analítica. Dice lo único que hay que decir —cuánta gente entra, nada más— y
 * deja las dos respuestas al mismo tamaño: un "aceptar" destacado junto a un "rechazar"
 * de letra pequeña convierte la pregunta en un trámite.
 *
 * El contenedor de GTM se carga aquí, al conceder y al volver (`enableAnalytics` es
 * idempotente). Mientras la respuesta sea `unknown` o `denied`, no se pide nada a Google.
 */
export function CookieConsentBanner() {
  const { t } = useTranslation();
  const consent = useAnalyticsConsent();
  const decide = useAnalyticsConsentStore((state) => state.decide);

  useEffect(() => {
    if (consent === ANALYTICS_CONSENT.GRANTED) enableAnalytics();
  }, [consent]);

  if (consent !== ANALYTICS_CONSENT.UNKNOWN) return null;

  return (
    <section className="cookie-consent" role="region" aria-label={t("cookieConsent.ariaLabel")}>
      <div className="cookie-consent__content">
        <p className="cookie-consent__text">
          <i className="fas fa-chart-simple cookie-consent__icon" aria-hidden="true"></i>
          <span>
            {t("cookieConsent.message")}{" "}
            <strong>{t("cookieConsent.emphasis")}</strong>
          </span>
        </p>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="button is-small cookie-consent__button"
            onClick={() => decide(ANALYTICS_CONSENT.DENIED)}
          >
            {t("cookieConsent.deny")}
          </button>
          <button
            type="button"
            className="button is-small is-primary cookie-consent__button"
            onClick={() => decide(ANALYTICS_CONSENT.GRANTED)}
          >
            {t("cookieConsent.accept")}
          </button>
        </div>
      </div>
    </section>
  );
}
