# Plan de desarrollo — Feature: Etiquetas y enriquecimiento de datos

## Estado actual (2026-03-23)

### Completado ✅

#### Datos
- `public/data/tags.json` — 148 etiquetas temáticas con `id`, `label`, `description`, `category`, `synonyms`
- `public/data/audience.json` — 35 perfiles de público objetivo con la misma estructura
- `communities.json` migrado: todos los registros tienen los nuevos campos `tags: []`, `targetAudience: []`, `urls: {}`
- `communityUrl` actualizado en 37 comunidades (sesión anterior) + ~35 adicionales en esta sesión

#### URLs alternativas aplicadas (sesión 2026-03-23)

- **28 comunidades Twitter/X** resueltas en `url-mapping.json` y aplicadas (`apply-url-mapping`)
- **5 de 6 LinkedIn** (IDs 31, 133, 554, 560, 590) editadas directamente en `communities.json`; ID 593 DisiTech sin URL alternativa conocida
- **1 Instagram** (ID 140 DevWomen) editada directamente
- **1 Facebook** (ID 233 Joomla Logroño) ya estaba Inactiva, sin URL alternativa
- **XopsConference (ID 533)** resuelto con linktr.ee + instagram + youtube + linkedin + telegram
- `url-mapping.json` tiene ahora **65 entradas** (37 anteriores + 28 nuevas)

#### Scripts de enriquecimiento de datos

- `scripts/migrate-add-new-fields.js` — migración idempotente (ya ejecutada)
- `scripts/scrape-community-data.js` — scraping mejorado (ver mejoras abajo)
- `scripts/apply-suggestions.js` — aplica `suggestions.json` a `communities.json` (sin revisión manual; `approved: null` se aplica por defecto)
- `scripts/apply-url-mapping.js` — aplica mapeo manual de URLs (`url-mapping.json`)
- `scripts/url-mapping.json` — 65 entradas aplicadas

#### Campo `humanValidated`

- Añadido a los 600 registros de `communities.json` con valor `false`
- `false` = datos enriquecidos por IA (scraper); `true` = revisados y confirmados por un humano
- El scraper nunca lo modifica; se actualiza manualmente cuando alguien valida una comunidad

#### Mejoras al scraper (sesión 2026-03-23)

- **`SKIP_SCRAPING_RE`**: salta automáticamente Twitter/X, LinkedIn, Instagram, Facebook, Discord, Telegram — evita timeouts inútiles
- **Fallback `urls.web`**: si `communityUrl` es una red social o falla, intenta `community.urls.web`
- **Enriquecimiento meetup**: tras scrapar la URL principal, si hay URL de meetup conocida (en `community.urls.meetup` o descubierta en los links), la visita para enriquecer tags y detectar estado
- **Topics estructurados de meetup**: extrae los topics de meetup desde links `/find/?keywords=` y los mapea al catálogo `tags.json` con coincidencia por label + synonyms (más preciso que texto libre)
- **Filtro de inactivas**: omite comunidades con `status: "Inactiva"` salvo con `--id`
- **`PAGE_TIMEOUT` reducido** a 12s (antes 20s) para evitar bloqueos en servidores lentos o meetup.com

#### Documentación
- `CONTRIBUTING.md` actualizado con el nuevo schema (campos `tags`, `targetAudience`, `urls`)
- `CLAUDE.md` actualizado con toda la arquitectura actual

---

## Próximos pasos

### FASE 1 — Completar enriquecimiento de datos

#### 1.1 URLs pendientes (sin resolver)

- **ID 593 DisiTech** — LinkedIn sin URL web alternativa conocida
- **ID 102 Comunidad Alexa** — handle activo es `@comunidadalexa` pero `communityUrl` sigue apuntando a `@alexadevsmadrid`; actualizar manualmente

#### 1.2 Scraping ✅ (completado 2026-03-23)

Scraping completo ejecutado y resultados aplicados con `apply-suggestions`.

**Cobertura resultante:**

- Tags: 362 / 600 comunidades (336 / 397 activas)
- Target audience: 277 / 600
- URLs adicionales: 422 / 600

**Cobertura incompleta esperada** en comunidades cuya URL es una red social sin web alternativa, o cuya web no tiene contenido textual suficiente para el matching.

---

### FASE 2 — Frontend: filtro de etiquetas

#### 2.1 Store (`community.store.js`)
- Cargar `tags.json` y `audience.json` junto a `communities.json`
- Añadir `filterByTags(tagIds[])` al store usando el índice invertido existente
- Exponer hooks: `useTags`, `useAudience`, `useTagsFilter`

#### 2.2 Componente `TagSearch`
- Input de texto con autocompletado
- Búsqueda sobre `label + description + synonyms` de `tags.json` (substring, case-insensitive)
- Las sugerencias se agrupan por `category` en el dropdown
- Al seleccionar un tag, se añade como chip activo y se filtra el listado
- Soporte multi-tag (intersección de sets, consistente con el resto de filtros)

#### 2.3 Integración en `SideBar`
- Añadir `TagSearch` como nueva sección del panel lateral
- Separar visualmente de los filtros actuales (status, eventFormat, communityType)
- Mostrar contador de comunidades con cada tag (opcional, mejora UX)

#### 2.4 `CommunityCard`
- Mostrar chips de tags en la tarjeta (máximo 3-4 visibles, resto colapsado)
- Los chips son clicables: al pulsar uno activa el filtro por ese tag

#### 2.5 `AudienceFilter` (opcional, post-MVP)
- Filtro separado para `targetAudience`, similar a `TagSearch`
- Puede ir en el mismo sidebar o como filtro secundario

---

### FASE 3 — Visibilidad de URLs adicionales en UI

#### 3.1 `CommunityCard` — iconos de redes sociales
- Mostrar iconos (Font Awesome) para cada plataforma presente en `urls`
- Orden sugerido: web · meetup · github · discord · telegram · youtube · linkedin · twitter · instagram · mastodon · bluesky
- Solo mostrar los que tienen valor (el objeto `urls` solo incluye claves con valor)

#### 3.2 Vista detalle (si existe o se crea)
- Mostrar todas las URLs en formato lista con etiqueta de plataforma

---

### FASE 4 — Flujo de contribución

#### 4.1 GitHub Issue template
- Actualizar el formulario de nueva comunidad para incluir campo de URLs adicionales y tags sugeridos

#### 4.2 `process-community-issue.js`
- Ya actualizado para incluir `tags: []`, `targetAudience: []`, `urls: {}` en nuevas comunidades
- Pendiente: parsear el campo de URLs adicionales del formulario si se añade

#### 4.3 Sugerencia de nuevas etiquetas
- Crear template de issue para sugerir nuevas etiquetas o mejoras a etiquetas existentes
- Documentar en CONTRIBUTING.md cómo proponer cambios a `tags.json`

---

## Decisiones de diseño tomadas

| Decisión | Elección | Motivo |
|----------|----------|--------|
| "Público objetivo" | Campo separado `targetAudience` | Semánticamente distinto de las temáticas |
| Categorías en tags | Sí (`category` field) | Agrupa sugerencias en autocomplete |
| Tags TBD | Incluidos con descripción completada | No dejar huecos vacíos en el catálogo |
| IDs de tags | Slugs en inglés con guiones | Consistencia, independiente del idioma del label |
| URLs múltiples | Schema tipado con claves fijas | Más fácil de mostrar iconos y filtrar |
| `communityUrl` | Mantener como fallback + campo `urls` | Retrocompatible, no rompe nada existente |
| Scraping → suggestions | Output intermedio para revisión humana | Evita aplicar datos erróneos directamente |
| Redes sociales en scraper | `SKIP_SCRAPING_RE` para saltar sin timeout | Twitter/LinkedIn/Instagram bloquean bots |
| Topics meetup | Extracción de `/find/?keywords=` + match a tags.json | Más preciso que texto libre; meetup tiene taxonomía estructurada |
| Inactivas en scraping | Omitidas por defecto (segunda fase) | Priorizar comunidades activas para completar tags antes |
