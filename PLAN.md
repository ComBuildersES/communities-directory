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

#### Frontend de búsqueda y datos
- `community.store.js` ya carga `tags.json` y `audience.json` junto a `communities.json`
- La búsqueda facetada por etiquetas y público objetivo ya está integrada en el frontend actual
- `TagSearch` está conectado a la experiencia principal de exploración
- El modal de comunidad ya muestra etiquetas y público objetivo con mejor contexto visual

#### Nuevo flujo de contribución en la web
- Nueva interfaz de contribución integrada dentro de la app, sin depender del issue template como entrada principal
- Soporte para alta nueva y edición de comunidades existentes desde la propia web
- Deep links por query string para abrir el formulario en modo alta o con una comunidad precargada para editar
- CTA del listado simplificada para solicitar nuevas comunidades desde la web
- CTA contextual en comunidades no validadas para animar a validar datos y abrir el formulario precargado
- Formulario guiado con:
  - ayudas contextuales para `status`, `communityType`, `eventFormat` y `location`
  - modal explicativo para `communityType` con ejemplos reales del dataset
  - taxonomías de `tags` y `targetAudience` plegables, con búsqueda y chips visibles desde el resumen
  - JSON generado colapsado por defecto
  - validación visual de campos obligatorios con `*` rojo
- Reglas del formulario alineadas con el modelo actual:
  - `lastReviewed` se genera automáticamente con la fecha actual
  - `humanValidated` se envía como `true` por defecto
  - `displayOnMap` se calcula automáticamente a partir de `location`
  - `location` sólo aparece para comunidades `Presencial` o `Híbridos`
  - `location` usa `n/a` automáticamente en `Organización paraguas`
  - el formulario ya no expone `topics` heredado
  - `thumbnailUrl` sólo cambia si la persona activa explícitamente “Reemplazar imagen”

#### Automatización de issues y PRs
- El workflow ya acepta el nuevo formato de issue generado desde la web (`community-directory-submission:v2`)
- `scripts/process-community-issue.js` ya soporta:
  - creación de nuevas comunidades desde JSON
  - edición de comunidades existentes por ID
  - compatibilidad hacia atrás con el template antiguo
  - geocodificación automática de `location`
  - descarga y conversión de imágenes remotas a `webp` cuando se reemplaza `thumbnailUrl`

---

## Iniciativa i18n — Internacionalización (iniciada 2026-03-26)

### Documentos de referencia
- `I18N_SPEC.md` — estrategia completa (decisiones de arquitectura, modelo de datos, fases)
- `IMPLEMENTATION_PLAN.md` — plan de implementación con checkpoints por fase

### Estado

#### FASE 0 — Infraestructura i18n ✅ (2026-03-26)

- `i18next` + `react-i18next` + `i18next-browser-languagedetector` instalados
- `src/i18n/index.js` — config con detección por orden: URL path → localStorage → `navigator.languages`
- `src/i18n/locales/es.json` + `en.json` — vacíos, listos para recibir claves
- `src/main.jsx` — redirect al locale detectado si la URL no tiene prefijo de locale
- `public/404.html` — fallback SPA para GitHub Pages (codifica path en `?_spa=`)
- `index.html` — snippet de restauración de path (antes de que arranque React)

**Bugs encontrados y corregidos durante Phase 0:**
- Todas las URLs de fetch de datos (`communities.json`, `tags.json`, `audience.json`, `community-builders-members.json`) eran relativas y se resolvían contra `/es/` → `404`. Corregidas con `import.meta.env.BASE_URL` como prefijo
- `thumbnailUrl` en los registros también era relativo — normalizado a ruta absoluta en el store al cargar datos (componentes reciben URL lista para usar)
- `Map.jsx` ya tenía un bug de doble barra: `"${BASE_URL}/${thumbnailUrl}"` → corregido a `"${community.thumbnailUrl}"` (ya absoluta tras normalización)
- La detección de locale en el redirect de `main.jsx` no puede depender de `i18n.resolvedLanguage` (puede no estar disponible de forma síncrona) — implementada detección directa con `localStorage` + `navigator.languages`

#### FASE 1 — Extracción de strings UI ✅ (2026-03-27)

Todos los strings hardcodeados del UI extraídos a `src/i18n/locales/es.json` usando `t()`. Componentes migrados: `Footer`, `InstallPromptBar`, `AddCommunityCTA`, `ViewToggleButton`, `Heading`, `ResultsBar`, `TagSearch`, `CommunityCard`, `CommunityModal`, `App`, `SideBar`, `FilterPanel`, `CommunityContribution` (incluyendo sub-componentes `FieldHelpModal`, `TaxonomyPicker`, `UrlFields`). Las claves de enum (`"Activa"`, `"Presencial"`, etc.) se han dejado intactas para la Fase 2.

#### FASE 2 — Migración de claves de enum ✅ (2026-03-27)

Todas las claves de enum españolas reemplazadas por claves neutrales al idioma en todo el código, scripts, tests y datos. Mappings: `Activa→active`, `Inactiva→inactive`, `Desconocido→unknown`, `Presencial→in-person`, `Híbridos→hybrid`, `Online→online`, `Tech Meetup→tech-meetup`, etc. Migration script aplicado a `communities.json` (604 registros) y `communities.geojson` (500 features).

#### FASE 3 — Traducción inglés + selector de idioma → Pendiente

#### FASE 4 — Taxonomías i18n + store locale-aware → Pendiente

#### FASE 5 — Campo `langs` en comunidades + filtro → Pendiente

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

### FASE 2 — Frontend: exploración y UX

#### 2.1 Búsqueda y filtros
- Revisar si compensa añadir un filtro explícito de `targetAudience` separado del flujo actual
- Evaluar si merece la pena exponer más señales de búsqueda en tarjetas o modal sin sobrecargar la UI

#### 2.2 Tarjetas y modal de comunidad
- Valorar mostrar señales resumidas de `tags` directamente en la tarjeta si mejora el descubrimiento sin saturarla
- Revisar si los enlaces del modal necesitan todavía más jerarquía visual o agrupación por prioridad
- Evaluar si conviene diferenciar mejor entre enlace principal y enlaces sociales en el modal

#### 2.3 Accesibilidad y micro-UX del formulario
- Validar navegación por teclado y focus management en tooltips, modal de ayuda y taxonomías
- Revisar mensajes de error nativos del formulario y si conviene personalizarlos
- Probar la experiencia completa en móvil con especial atención a densidad, scroll y tamaño de targets

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

#### 4.1 Hardening del nuevo formulario web
- Revisar si el formulario debería bloquear envío cuando falten `tags` en comunidades donde serían especialmente útiles
- Evaluar si conviene añadir guardarraíles extra de duplicados por nombre + URL + localización antes de abrir GitHub
- Mejorar el copy final y mensajes de ayuda tras pruebas reales con personas colaboradoras

#### 4.2 Issues auxiliares para mantenimiento de taxonomía
- Crear template de issue para sugerir nuevas etiquetas o mejoras a etiquetas existentes
- Documentar en `CONTRIBUTING.md` cómo proponer cambios a `tags.json` y `audience.json`

#### 4.3 Consolidación de `topics` heredado
- Revisar dónde sigue usándose el campo legado `topics` en frontend, búsqueda y scripts
- Definir estrategia para consolidarlo con `tags` sin perder información histórica útil
- Preparar una migración progresiva para transformar o vaciar `topics` en los registros existentes

#### 4.4 Evolución del issue template antiguo
- Decidir si se elimina el template anterior, se deja como fallback o se redirige explícitamente al nuevo flujo web
- Alinear `CONTRIBUTING.md` y cualquier documentación restante con el nuevo punto de entrada principal desde la web

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
