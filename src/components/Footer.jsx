import { useTranslation } from "react-i18next";
import { useAnalyticsConsentStore } from "../stores/analyticsConsent.store.js";

/**
 * El contador de LibreCounter va sin `loading="lazy"` a propósito: el pie está oculto en
 * móvil (`is-hidden-mobile`), y una imagen diferida dentro de un contenedor en
 * `display:none` no se pide nunca. Sin diferir, el navegador sí la pide, así que la visita
 * se cuenta igual. `referrerPolicy="unsafe-url"` es lo que hace que LibreCounter sepa de
 * qué dominio viene: sin el referer completo, la visita no se atribuye a nadie.
 */
const LIBRECOUNTER_PIXEL_URL = "https://librecounter.org/counter.svg";
const LIBRECOUNTER_STATS_URL = "https://librecounter.org/directory.communitybuilders.dev/show";

export function Footer() {
  const { t } = useTranslation();
  const reopenConsent = useAnalyticsConsentStore((state) => state.reopen);

  return (
    <footer className="mi-footer is-hidden-mobile">
      <div className="content has-text-centered">
        <p>
         {t("footer.maintainedWith")}&nbsp;<a href="https://github.com/ComBuildersES/communities-directory?tab=readme-ov-file#contributors" target="_blank">
         {t("footer.byCommunity")}
          </a>
          &nbsp; | {t("footer.codeUnder")} <a href="https://github.com/ComBuildersES/communities-directory/#licencias">Apache License 2.0</a> {t("footer.dataUnder")} <a href="https://github.com/ComBuildersES/communities-directory/#licencias">CC BY 4.0</a>
          &nbsp; |{" "}
          <button type="button" className="mi-footer__link" onClick={reopenConsent}>
            {t("footer.analyticsPreferences")}
          </button>
          &nbsp;
          <a
            className="mi-footer__counter"
            href={LIBRECOUNTER_STATS_URL}
            target="_blank"
            rel="noopener"
            title={t("footer.libreCounterTitle")}
          >
            <img
              src={LIBRECOUNTER_PIXEL_URL}
              referrerPolicy="unsafe-url"
              width="16"
              height="16"
              alt={t("footer.libreCounterAlt")}
            />
          </a>
        </p>
      </div>
    </footer>
  );
}
