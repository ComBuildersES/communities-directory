import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../i18n/index.js';
import { useReloadTaxonomy } from '../stores/community.store.js';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.resolvedLanguage;
  const reloadTaxonomy = useReloadTaxonomy();

  const switchLanguage = (locale) => {
    if (locale === currentLocale) return;

    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const { pathname, search, hash } = window.location;
    const afterBase = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    const segments = afterBase.split('/').filter(Boolean);

    if (segments.length > 0) {
      segments[0] = locale;
    } else {
      segments.push(locale);
    }

    window.history.pushState(null, '', `${base}/${segments.join('/')}${search}${hash}`);
    i18n.changeLanguage(locale);
    reloadTaxonomy(locale);
  };

  return (
    <div className="language-switcher">
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          className={`language-switcher-btn${locale === currentLocale ? ' language-switcher-btn--active' : ''}`}
          onClick={() => switchLanguage(locale)}
          aria-current={locale === currentLocale ? 'true' : undefined}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
