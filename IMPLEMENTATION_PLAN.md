# i18n Implementation Plan

Companion to `I18N_SPEC.md`. Each phase ends with a **user checkpoint** before the next one starts.

---

## Phase 0 — i18n Infrastructure _(no visible change)_

**What:** Wire up i18next + locale routing. App looks/works identically. URL prefix `/es/` active.

**Steps:**
1. `npm install i18next react-i18next i18next-browser-languagedetector`
2. Create `src/i18n/index.js` — LanguageDetector config (path → localStorage → navigator)
3. Create `src/i18n/locales/es.json` + `en.json` — empty `{}`
4. Wire `src/i18n/index.js` into `main.jsx` + bare-path redirect logic
5. Add `public/404.html` — SPA fallback for GitHub Pages
6. Add path-restore snippet to `index.html`

**✅ You test:**
- App loads at `/es/`, bare `/` redirects there
- Browser set to English → `/` redirects to `/en/`
- `preferred-locale` in localStorage → respected on next visit
- `npm test` passes

---

## Phase 1 — Extract UI Strings _(done 2026-03-27)_ ✅

**What:** Move every hardcoded Spanish string into `es.json` via `t()`. English not enabled yet.

All components migrated: `Footer`, `InstallPromptBar`, `AddCommunityCTA`, `ViewToggleButton`, `Heading`, `ResultsBar`, `TagSearch`, `CommunityCard`, `CommunityModal`, `App`, `SideBar`, `FilterPanel`, `CommunityContribution` (including sub-components `FieldHelpModal`, `TaxonomyPicker`, `UrlFields`).

Enum value strings (`"Activa"`, `"Presencial"`, `"Tech Meetup"`, etc.) intentionally left in place — Phase 2 scope.

`npm test` — 15/15 pass.

---

## Phase 2 — Enum Key Migration _(done 2026-03-27)_ ✅

**What:** Replace Spanish enum strings everywhere with language-neutral keys (`"Activa"` → `"active"`, `"Presencial"` → `"in-person"`, etc.). Data migration + code changes done together.

**All steps run before user tests anything:**
1. Add `status.*`, `eventFormat.*`, `communityType.*` translations to `es.json`
2. Update `src/lib/communitySubmission.js` constants + `getCommunityDraft()` default
3. Update `src/stores/community.store.js` default filter
4. Update `src/constants.js` `TAG_EVENTS` map keys (also fixes `Hibridos` typo)
5. Update `CommunityModal/CommunityModal.jsx` `STATUS_CLASS` keys
6. Update `TagSearch/TagSearch.jsx` `STATUS_BADGE_CLASS` + `COMMUNITY_SUGGESTION_STATUS_ORDER`
7. Update `SideBar.jsx` + `FilterPanel.jsx` — filter value strings now use `t('communityType.tech-meetup')` etc.
8. Update `scripts/process-community-issue.js`, `apply-suggestions.js`, `scrape-community-data.js`
9. Update `tests/normalizePayload.test.js`, `tests/getCommunityDraft.test.js`, `src/data/mockdata.js`
10. Write `scripts/migrate-enum-keys.js`
11. `npm run migrate-enum-keys -- --dry-run` → review output with user
12. `npm run migrate-enum-keys` → apply to `communities.json` + `communities.geojson`

**✅ You test:**
- Status, eventFormat, communityType filters all work correctly
- Status badge colors correct in modal and TagSearch suggestions
- TagSearch sort order still: Activa → Desconocido → Inactiva
- Sample records in `communities.json` show neutral keys
- `npm test` passes

---

## Phase 3 — English Translation + Language Switcher

**What:** Full EN translation. User can switch locales.

**Steps:**
1. Populate `src/i18n/locales/en.json` with all keys translated
2. Create `src/components/LanguageSwitcher.jsx` — ES/EN buttons, calls `i18n.changeLanguage()` + URL path update
3. Add `LanguageSwitcher` to `Heading.jsx` (desktop + mobile menu)

**✅ You test:**
- Switcher visible in header
- Switch to EN → UI in English, URL → `/en/`
- Switch back to ES → ES strings, URL → `/es/`
- Refresh on `/en/` → stays English
- Close + reopen browser → language remembered
- `npm test` passes

---

## Phase 4 — Taxonomy i18n + Store Locale Awareness

**What:** Tags and audience labels show in the active locale. Inverted index rebuilt on locale change.

**Steps:**
1. Create `public/data/tags.en.json` — translated labels, descriptions, categories, synonyms
2. Create `public/data/audience.en.json` — same
3. Update `community.store.js` — load locale-specific taxonomy files, fallback to ES, rebuild index on change
4. Wire locale change → `fetchCommunities({ locale })` on language switch

**✅ You test:**
- Switch to EN → tag labels in FilterPanel / TagSearch / modal in English
- Search for English synonym (e.g. "machine learning") in EN → results appear
- Switch back to ES → Spanish labels, synonyms work
- Missing EN translation → falls back to Spanish (not blank)
- `npm test` passes

---

## Phase 5 — Community Language Field & Filter

**What:** Add `langs: string[]` to records. Filter communities by operating language.

**Steps:**
1. Write `scripts/migrate-add-lang.js` → adds `"langs": ["es"]` to records missing it
2. Run dry-run → review → apply to `communities.json` + regenerate `communities.geojson`
3. Update GitHub issue template — add `langs` field
4. Update `scripts/process-community-issue.js` — parse `langs` array
5. Add `langs` filter section to `SideBar.jsx` + `FilterPanel.jsx`
6. Update `community.store.js` — `langs` filter = inclusive OR match
7. Add language badge(s) to `CommunityCard.jsx` + `CommunityModal`

**✅ You test:**
- Language badge(s) on cards and modal
- Filter "Español" → only shows communities with `langs` containing `"es"`
- Community with `["es","en"]` appears under both ES and EN filters
- Filter state in URL: `?langs=es`
- `npm test` passes

---

## Quick Reference — Files by Phase

| Phase | New files | Major changes |
|---|---|---|
| 0 | `src/i18n/index.js`, `src/i18n/locales/es.json`, `src/i18n/locales/en.json`, `public/404.html` | `main.jsx`, `index.html` |
| 1 | — | All components (strings → `t()`) |
| 2 | `scripts/migrate-enum-keys.js` | `communitySubmission.js`, `community.store.js`, `constants.js`, 4 components, 3 scripts, 2 tests, mockdata, `communities.json`, `communities.geojson` |
| 3 | `src/components/LanguageSwitcher.jsx` | `en.json` (populated), `Heading.jsx` |
| 4 | `public/data/tags.en.json`, `public/data/audience.en.json` | `community.store.js` |
| 5 | `scripts/migrate-add-lang.js` | `communities.json`, `communities.geojson`, `SideBar.jsx`, `FilterPanel.jsx`, `CommunityCard.jsx`, `CommunityModal`, `community.store.js`, issue template |
