# Localization & Internationalization — Implementation Spec

## 1. Goals

Transform the project from a Spanish-only application into a scalable multilingual directory that:
- Serves UI and taxonomy content in any supported locale
- Lets communities be contributed in any language, tagged with a `lang` field
- Allows users to filter communities by language
- Uses shareable, SEO-friendly locale URLs
- Keeps contributor workflows in Spanish initially, with an English path planned for later

---

## 2. Languages

| Code | Language   | Role              | Phase |
|------|------------|-------------------|-------|
| `es` | Spanish    | Canonical / Base  | 0     |
| `en` | English    | First translation | 1     |

`es` is the default locale and the canonical source for all reference data. Future languages follow the same pattern as `en`.

---

## 3. Decision Summary

| Dimension                 | Decision                                                  |
|---------------------------|-----------------------------------------------------------|
| i18n library              | `i18next` + `react-i18next`                               |
| Translation files         | Per-locale JSON in `src/i18n/locales/`                    |
| Locale in URL             | Path prefix: `/es/`, `/en/`                               |
| Community user content    | Displayed as-is in original language (no auto-translation)|
| Community lang tracking   | `lang` field added to each record                         |
| Enum values in data       | Migrated to language-neutral keys                         |
| Taxonomy files            | Separate per-locale files (`tags.en.json`, etc.)          |
| Contributor workflows     | Spanish for now, English templates added in a later phase |

---

## 4. UI Localization

### 4.1 Library Setup

```
npm install i18next react-i18next i18next-browser-languagedetector
```

The `i18next-browser-languagedetector` plugin handles locale detection and persistence automatically (see §5.3 for the detection strategy).

Entry point: `src/i18n/index.js`

```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';

// Number of path segments occupied by the base path.
// e.g. '/communities-directory/es/' → base has 1 segment → index 1
// e.g. '/es/' (local dev)           → base has 0 segments → index 0
const BASE_SEGMENTS = import.meta.env.BASE_URL
  .split('/').filter(Boolean).length;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en } },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true,   // 'es-ES' matches 'es'
    interpolation: { escapeValue: false },
    detection: {
      // Priority order — see §5.3 for rationale
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: BASE_SEGMENTS,  // skip base path segments
      lookupLocalStorage: 'preferred-locale',
      caches: ['localStorage'],            // auto-persist after detection or switch
      excludeCacheFor: ['cimode'],
    },
  });

export default i18n;
```

Import `src/i18n/index.js` in `main.jsx` before rendering `<App />`.

### 4.2 Translation File Structure

```
src/i18n/
  index.js
  locales/
    es.json    ← canonical; extracted from current hardcoded strings
    en.json    ← English translations
```

### 4.3 Namespace / Key Organization

Use a single `translation` namespace (default) with logical sections:

```json
{
  "heading": {
    "title": "Comunidades Tech",
    "subtitle": "Directorio de comunidades tecnológicas de España",
    "about": "Sobre el proyecto",
    "addCommunity": "Añadir comunidad",
    "back": "Volver",
    "openMenu": "Abrir menú",
    "closeMenu": "Cerrar menú"
  },
  "about": {
    "goal": "Nuestro objetivo es mantener el mayor directorio...",
    "bookmark": "Y no te olvides de guardar en favoritos",
    "collaborate": "Colabora",
    "collaborateText": "Nuevas ideas, bugs...",
    "share": "¿Nos ayudas a difundirlo?",
    "contributors": "La comunidad que lo hace posible",
    "seeAll": "Ver a todas las personas que contribuyen"
  },
  "filters": {
    "title": "Filtros",
    "status": "Estado",
    "communityType": "Tipo",
    "eventFormat": "Formato",
    "tags": "Temáticas",
    "targetAudience": "Audiencia",
    "name": "Nombre",
    "language": "Idioma de la comunidad"
  },
  "status": {
    "active": "Activa",
    "inactive": "Inactiva",
    "unknown": "Desconocido"
  },
  "eventFormat": {
    "in-person": "Presencial",
    "online": "Online",
    "hybrid": "Híbridos",
    "unknown": "Desconocido"
  },
  "communityType": {
    "tech-meetup": "Tech Meetup",
    "conference": "Conferencia",
    "umbrella-org": "Organización paraguas",
    "hacklab": "Hacklab",
    "collaborative-group": "Grupo colaborativo",
    "meta-community": "Meta comunidad",
    "mutual-aid-group": "Grupo de ayuda mutua"
  },
  "results": {
    "count_one": "{{count}} comunidad",
    "count_other": "{{count}} comunidades",
    "noResults": "No hay comunidades que coincidan con los filtros aplicados."
  },
  "community": {
    "visitSite": "Visitar web",
    "editProposal": "Proponer cambios",
    "showOnMap": "Ver en el mapa",
    "humanValidated": "Revisado por humanos",
    "aiEnriched": "Datos enriquecidos con IA"
  },
  "contribution": {
    "loadingForm": "Cargando formulario...",
    "unsavedChanges": "Hay cambios sin guardar",
    "unsavedBody": "Si sales ahora perderás lo que has escrito...",
    "keepEditing": "Seguir editando",
    "saveDraftAndExit": "Guardar borrador y salir",
    "exitWithoutSaving": "Salir sin guardar"
  },
  "pwa": {
    "newVersion": "Hay una nueva versión disponible",
    "reload": "Recargar"
  },
  "footer": {
    "license": "Datos bajo licencia",
    "openData": "Datos abiertos"
  }
}
```

### 4.4 Components to Update

Every component with hardcoded Spanish strings. Priority order:

1. `Heading.jsx` — title, subtitle, menu labels, about popover
2. `App.jsx` — navigation guard modal, inline status messages
3. `ResultsBar.jsx` — count string, view toggle labels
4. `FilterPanel.jsx` / `SideBar.jsx` — filter labels, placeholders
5. `CommunityCard.jsx` / `CommunityModal` — field labels, status badges
6. `TagSearch/TagSearch.jsx` — placeholder, no-results message
7. `InstallPromptBar.jsx` — PWA prompt text
8. `Footer.jsx` — license text, links
9. `CommunityContribution/` — all form labels and validation messages (largest surface)
10. `Map/` — popup content, empty state messages

Usage pattern:
```jsx
import { useTranslation } from 'react-i18next';

function Heading() {
  const { t } = useTranslation();
  return <h1>{t('heading.title')}</h1>;
}
```

### 4.5 Enum Translation

Enum values in `communityType`, `eventFormat`, and `status` are currently stored as Spanish strings in data files (see §6.2 for the migration). After migration they become language-neutral keys. UI components translate them via `t()`:

```jsx
// Rendering a community's event format
t(`eventFormat.${community.eventFormat}`)   // e.g., t('eventFormat.in-person') → "In-person"
```

`COMMUNITY_STATUS_OPTIONS`, `COMMUNITY_TYPE_OPTIONS`, and `EVENT_FORMAT_OPTIONS` in `communitySubmission.js` become arrays of neutral keys; labels for dropdowns come from `t()`.

### 4.6 Language Switcher

Add a `LanguageSwitcher` component to `Heading` (desktop) and the mobile menu. On change:

1. Call `i18n.changeLanguage(locale)` — the detector plugin automatically writes to `localStorage` as a side-effect (no manual `setItem` needed)
2. Update the URL path prefix without a full page reload (see §5.4)

```jsx
const SUPPORTED_LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];
```

---

## 5. Locale Routing

### 5.1 URL Structure

The active locale is embedded as the first path segment after the app base path:

```
Production:   https://combuilderses.github.io/communities-directory/es/
              https://combuilderses.github.io/communities-directory/en/

Local dev:    http://localhost:5173/es/
              http://localhost:5173/en/
```

Visiting the bare base path (`/communities-directory/`) runs locale detection (see §5.3) and immediately redirects to the detected locale — e.g., `/communities-directory/es/`.

### 5.2 GitHub Pages Compatibility

GitHub Pages does not support server-side routing, so `/en/` serves a 404 on direct load or refresh. Fix with the standard SPA redirect trick:

**`public/404.html`** — intercepts unknown paths and redirects to `index.html`, encoding the original path into a query param:

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // SPA fallback for GitHub Pages
    // Encodes the path so index.html can restore it
    var base = '/communities-directory'; // must match VITE_BASE without trailing slash
    var path = window.location.pathname.slice(base.length) || '/';
    var search = window.location.search;
    var hash = window.location.hash;
    window.location.replace(
      window.location.origin + base +
      '/?_spa=' + encodeURIComponent(path + search + hash)
    );
  </script>
</head>
</html>
```

**`index.html`** — before the React bundle runs, restore the path:

```html
<script>
  (function() {
    var spa = new URLSearchParams(window.location.search).get('_spa');
    if (spa) {
      var base = '/communities-directory';
      window.history.replaceState(null, '', base + decodeURIComponent(spa));
    }
  })();
</script>
```

> **Note:** For local dev (`VITE_BASE=/dist/` or `/`), adjust `base` accordingly or skip this script in dev mode. A Vite plugin or conditional can handle this.

### 5.3 Locale Detection Strategy

Detection is handled by `i18next-browser-languagedetector` with this priority order:

#### 1. URL path segment (highest priority)

The first path segment after the base path is read as the locale (`/communities-directory/en/` → `en`). This is authoritative: if someone shares a link to `/en/`, the recipient sees English regardless of their stored preference. The URL is the most explicit and shareable signal.

#### 2. `localStorage` (`preferred-locale` key)

If the URL carries no locale segment (bare base path visit), the plugin checks `localStorage`. This restores the language a returning user explicitly chose on a previous visit. The plugin writes to this key automatically whenever a locale is detected or switched — no manual `localStorage.setItem` needed.

#### 3. `navigator.languages` (browser preference list)

If localStorage is empty (first visit, private browsing), the plugin reads `navigator.languages` — an **ordered array** of the user's configured browser languages, e.g. `["ca-ES", "es-ES", "en-US", "en"]`. It iterates the array and returns the first entry whose language subtag matches a supported locale. This is more reliable than `navigator.language` alone because it respects the user's full preference ranking, including regional variants.

With `nonExplicitSupportedLngs: true`, regional tags like `"es-ES"` automatically match the supported locale `"es"` without manual mapping.

#### 4. Fallback

`fallbackLng: 'es'` — if nothing matches, default to Spanish.

#### Bare-path redirect

When the URL has no locale segment (e.g., user types the base URL directly), `main.jsx` performs a `replaceState` redirect to inject the detected locale before mounting React. This keeps the URL consistent and makes the locale bookmarkable:

```js
// main.jsx — runs before ReactDOM.render
import i18n from './i18n';
import { SUPPORTED_LOCALES } from './i18n/locales';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const afterBase = window.location.pathname.slice(base.length);
const firstSegment = afterBase.split('/').find(Boolean);

if (!SUPPORTED_LOCALES.includes(firstSegment)) {
  // i18next has already detected the locale via the plugin
  const locale = i18n.resolvedLanguage ?? 'es';
  window.history.replaceState(
    null,
    '',
    `${base}/${locale}${afterBase}${window.location.search}${window.location.hash}`
  );
}
```

#### What the detector does NOT do

- It does not make a network request or read the `Accept-Language` HTTP header (unavailable in JS). `navigator.languages` is the browser-side equivalent and covers the same information.
- It does not override an explicit URL locale with a stored preference. The URL always wins when present.
- It does not use cookies (simpler and no GDPR cookie notice needed for language preference).

### 5.4 Locale-aware Path Building

`buildContributionPath` and `buildDirectoryStatePath` in `communitySubmission.js` accept the current `pathname` (default `window.location.pathname`). Since the locale prefix is part of the pathname, **no changes to these functions are needed** — they preserve the current pathname and append query params. The locale stays in the path automatically.

On language switch:
```js
function switchLocale(newLocale) {
  i18n.changeLanguage(newLocale);
  localStorage.setItem('preferred-locale', newLocale);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const afterBase = window.location.pathname.slice(base.length);
  const segments = afterBase.split('/').filter(Boolean);
  // Replace first segment (locale) with new locale
  if (SUPPORTED_LOCALES.map(l => l.code).includes(segments[0])) {
    segments[0] = newLocale;
  } else {
    segments.unshift(newLocale);
  }
  window.history.pushState(null, '', `${base}/${segments.join('/')}${window.location.search}`);
}
```

---

## 6. Data Localization

### 6.1 `communities.json` — Adding `langs`

Add a `langs` field (array) to every community record. It lists the languages in which the community actually operates — some communities run events, chats, or content in more than one language.

```json
{
  "id": 1,
  "name": "MadridJS",
  "langs": ["es"],
  "description": "Comunidad de JavaScript en Madrid...",
  ...
}
```

```json
{
  "id": 42,
  "name": "Python España",
  "langs": ["es", "en"],
  "description": "Charlas tanto en español como en inglés.",
  ...
}
```

**Rules:**
- Values are BCP 47 language subtags: `"es"`, `"en"`, `"ca"`, `"eu"`, `"gl"`, etc.
- All existing records default to `"langs": ["es"]`
- A community in `langs` does **not** have to match the language of its description — a community can write its record description in Spanish while running events in English
- Multiple values are valid and common: `["es", "en"]`, `["ca", "es"]`
- New community issue template adds a `langs` field (multi-select or comma-separated; defaults to `"es"`)
- `process-community-issue.js` reads and normalizes `langs` to a lowercase array of BCP 47 subtags
- The sidebar gains a **"Idioma"** filter dimension; selecting `"en"` matches any record whose `langs` array includes `"en"` (inclusive OR across array values)

**Migration script:** extend `migrate-add-new-fields.js` (or create `scripts/migrate-add-lang.js`) to add `"langs": ["es"]` to all records that lack the field. Idempotent.

**User-generated content (name, description, topics):** always displayed as-is in whatever language the contributor wrote it. No auto-translation. The UI shows language badges derived from `langs` (e.g., `ES`, `EN`) on the card and in the modal.

### 6.2 Enum Normalization — Language-Neutral Keys

The `status`, `eventFormat`, and `communityType` fields currently store Spanish display strings. These must become language-neutral keys so the UI can translate them independently.

#### Mapping table

| Field           | Current (ES string)          | Neutral key            |
|-----------------|------------------------------|------------------------|
| `status`        | `"Activa"`                   | `"active"`             |
| `status`        | `"Inactiva"`                 | `"inactive"`           |
| `status`        | `"Desconocido"`              | `"unknown"`            |
| `eventFormat`   | `"Presencial"`               | `"in-person"`          |
| `eventFormat`   | `"Online"`                   | `"online"`             |
| `eventFormat`   | `"Híbridos"`                 | `"hybrid"`             |
| `eventFormat`   | `"Desconocido"`              | `"unknown"`            |
| `communityType` | `"Tech Meetup"`              | `"tech-meetup"`        |
| `communityType` | `"Conferencia"`              | `"conference"`         |
| `communityType` | `"Organización paraguas"`    | `"umbrella-org"`       |
| `communityType` | `"Hacklab"`                  | `"hacklab"`            |
| `communityType` | `"Grupo colaborativo"`       | `"collaborative-group"`|
| `communityType` | `"Meta comunidad"`           | `"meta-community"`     |
| `communityType` | `"Grupo de ayuda mutua"`     | `"mutual-aid-group"`   |

**Migration script:** `scripts/migrate-enum-keys.js` — walks all records in `communities.json`, replaces current values with neutral keys. Also updates `communities.geojson`.

**Code impact:**
- `communitySubmission.js` — update `COMMUNITY_STATUS_OPTIONS`, `COMMUNITY_TYPE_OPTIONS`, `EVENT_FORMAT_OPTIONS` to use neutral keys
- `community.store.js` — filter logic compares against neutral keys
- `FilterPanel.jsx` / `SideBar.jsx` — render translated labels via `t()`
- All scripts that read or write these fields (migration scripts, `process-community-issue.js`, `apply-suggestions.js`)

> **Note:** Filter query params in the URL (`?status=active`, `?eventFormat=in-person`) will also use neutral keys. Existing bookmarked URLs with Spanish strings will stop matching — accept this breakage since this is a planned breaking migration.

### 6.3 `tags.json` / `audience.json` — Per-locale Files

The canonical files (`tags.json`, `audience.json`) remain the Spanish source of truth. English translations live in sibling files:

```
public/data/
  tags.json           ← canonical ES (existing)
  tags.en.json        ← EN translations
  audience.json       ← canonical ES (existing)
  audience.en.json    ← EN translations
```

#### Schema for translated files

Same structure as the canonical files, with the same `id` values. Only `label`, `description`, and `synonyms` are translated. The `category` field is translated too.

```json
[
  {
    "id": "javascript",
    "label": "JavaScript",
    "category": "Programming Languages",
    "description": "General-purpose scripting language...",
    "synonyms": ["js", "vanilla js", "node"]
  }
]
```

The `id` is the stable cross-language identifier. IDs must never change.

#### Loading strategy

`community.store.js` loads the taxonomy file for the active locale. If a translation file is missing or a specific entry has no translation, fall back to the canonical ES entry:

```js
async function loadTaxonomy(locale) {
  const base = import.meta.env.BASE_URL;
  const canonical = await fetch(`${base}data/tags.json`).then(r => r.json());
  if (locale === 'es') return canonical;

  try {
    const translated = await fetch(`${base}data/tags.${locale}.json`).then(r => r.json());
    const translatedMap = Object.fromEntries(translated.map(t => [t.id, t]));
    return canonical.map(tag => translatedMap[tag.id] ?? tag);
  } catch {
    return canonical;  // graceful fallback
  }
}
```

#### Search behavior

The search index (inverted index) is built from the **active locale's** taxonomy labels, descriptions, and synonyms. When the locale changes, the index is rebuilt with the new taxonomy. Communities remain searchable because tag/audience IDs are locale-independent; the index maps translated terms to IDs, which in turn match community records.

#### Translation workflow

Translations for `tags.en.json` and `audience.en.json` can be created:
- Manually (recommended for accuracy)
- With AI assistance via a script, then human-reviewed
- Many tags (`label` = `"JavaScript"`, `"React"`, `"Docker"`) are already in English and require no translation in the `label` field — only `description` and `synonyms` need adaptation.

### 6.4 `communities.geojson`

GeoJSON is a derived file regenerated by `scripts/process-to-communities-to-geojson.js`. It should include the `lang` field and the normalized enum keys in its `properties`. No other localization needed — the GeoJSON is used for map rendering only.

---

## 7. Data Layer Integration

### 7.1 Store Changes (`community.store.js`)

- `fetchCommunities()` accepts a `locale` parameter (or reads it from a locale store/context)
- Taxonomy files (`tags`, `audience`) are re-fetched when the locale changes
- The inverted index is rebuilt after locale change
- `filters` may include a `lang` dimension for community language filtering

### 7.2 Locale Store

Add a lightweight `locale.store.js` (Zustand) or a React context:

```js
// src/stores/locale.store.js
import { create } from 'zustand';

export const useLocaleStore = create(set => ({
  locale: detectLocaleFromPath(),
  setLocale: (locale) => set({ locale }),
}));
```

`community.store.js` subscribes to locale changes and reloads taxonomies accordingly.

### 7.3 Filter Behavior Across Languages

- Tag and audience filters use **IDs** internally — they are locale-independent
- Filter labels in the UI come from the locale-specific taxonomy file
- The `lang` filter is a new first-class dimension matching `community.lang`
- URL filter params use neutral keys: `?tags=javascript&lang=es`

---

## 8. Migration Plan

### Phase 0 — Preparation (no user-visible changes)

- [ ] Add `"lang": "es"` to all `communities.json` records (migration script)
- [ ] Normalize enum values to neutral keys in `communities.json` (migration script)
- [ ] Regenerate `communities.geojson`
- [ ] Update all scripts that read/write enum fields
- [ ] Add neutral-key constants to `communitySubmission.js`
- [ ] Write `tags.en.json` and `audience.en.json` (can be partial; fallback to ES)

### Phase 1 — UI Strings (ES only, no visible change for ES users)

- [ ] Install `i18next`, `react-i18next`
- [ ] Create `src/i18n/index.js`, `src/i18n/locales/es.json`
- [ ] Extract all hardcoded Spanish strings in all components → `t()` calls
- [ ] Wire `i18n` into `main.jsx`
- [ ] Implement locale detection and URL prefix redirect (without switcher yet)
- [ ] Add `public/404.html` + `index.html` SPA redirect script
- [ ] Deploy and verify `/es/` works identically to current `/`

### Phase 2 — English Translation

- [ ] Create `src/i18n/locales/en.json` with all UI strings translated
- [ ] Add `LanguageSwitcher` to `Heading` (desktop + mobile menu)
- [ ] Wire locale switch → `i18n.changeLanguage` + URL update + localStorage persist
- [ ] Load `tags.en.json` / `audience.en.json` in `community.store.js` based on locale
- [ ] Rebuild inverted index on locale change
- [ ] Deploy and QA `/en/` end-to-end

### Phase 3 — Community Language Filter

- [ ] Add `lang` filter dimension to `FilterPanel` / `SideBar`
- [ ] Surface `lang` badge on `CommunityCard` and `CommunityModal`
- [ ] Update GitHub issue template to include a `lang` field
- [ ] Update `process-community-issue.js` to parse `lang`

### Phase 4 — Contributor Workflows (future)

- [ ] English version of GitHub issue template for adding communities
- [ ] English `CONTRIBUTING.md`
- [ ] Bilingual `README.md`
- [ ] English version of key scripts' `--help` output

---

## 9. Scripts & Workflows Impact

| Script / Workflow                   | Impact                                                                  |
|-------------------------------------|-------------------------------------------------------------------------|
| `migrate-add-new-fields.js`         | Extend to add `lang: "es"` if not present (idempotent)                  |
| `migrate-enum-keys.js` *(new)*      | One-time migration of status/eventFormat/communityType to neutral keys  |
| `process-community-issue.js`        | Parse `lang` field from issue; write neutral-key enums                  |
| `process-to-communities-to-geojson` | Propagate `lang` field; use neutral enum keys in properties             |
| `apply-suggestions.js`              | Must use neutral enum keys when writing back suggestions                |
| `scrape-community-data.js`          | Scraped status values must map to neutral keys                          |
| GitHub issue template               | Add optional `lang` field (default `es`); update enum value options     |

---

## 10. Open Questions / Future Phases

1. **SEO per locale**: Should there be `<link rel="alternate" hreflang>` meta tags for each locale? Useful once EN is live. Can be added to `index.html` or generated per build.

2. **Community description translation**: Long-term, should there be an optional `translations.en.description` per community record for AI-assisted or community-contributed translations? This spec defers the decision — the `lang` field establishes the groundwork.

3. **Right-to-left (RTL) languages**: If Arabic or Hebrew are added in the future, Bulma's RTL support will need to be evaluated.

4. **Locale in the GeoJSON filter**: The map clustering currently shows all communities. Should the map respect the `lang` filter? Likely yes — design the map `lang` filter in Phase 3 together with the list view.

5. **VITE_BASE in 404.html**: The `base` path is hardcoded in `404.html`. Consider reading it from a build-injected variable or using a Vite plugin to keep it in sync.

6. **Partial translations**: When `en.json` is incomplete, i18next falls back to `es.json`. This is acceptable for launch but should be tracked — consider a CI check for missing translation keys.
