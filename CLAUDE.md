# Community Builders Directory — CLAUDE.md

## Propósito del proyecto

Directorio interactivo de comunidades tecnológicas españolas. Permite a usuarios descubrir comunidades por temática, formato y ubicación. Sirve también como punto de encuentro para organizadores de comunidades y da visibilidad a cuáles forman parte de Community Builders.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 |
| Build tool | Vite 5 |
| Estado | Zustand 5 |
| Mapas | ArcGIS (`@arcgis/core`, `@arcgis/map-components`) |
| Estilos | Bulma CSS (CDN) + CSS por componente |
| Iconos | Font Awesome 6 |
| Linting | ESLint 9 con plugins React |
| Despliegue | GitHub Pages (estático) |

## Estructura de directorios

```
src/
  App.jsx              # Componente raíz, orquesta vista lista/mapa
  main.jsx             # Entry point, monta en #search_app
  constants.js         # Constantes de configuración
  components/
    CommunitiesList    # Grid de tarjetas en vista lista
    CommunityCard      # Tarjeta individual de comunidad
    SideBar            # Panel de filtros lateral
    Heading            # Barra superior con controles
    Footer             # Pie con licencia y links
    Switch             # Checkbox personalizado para filtros
    ViewToggleButton   # Alternancia lista/mapa
    Map/               # Vista de mapa ArcGIS con clustering
    AddCommunityCTA/   # CTA para añadir comunidad vía GitHub issue
  stores/
    community.store.js # Estado central: datos, filtros, búsqueda
    sidebar.store.js   # Visibilidad del sidebar (responsive)
  data/
    API.js             # fetch wrapper para communities.json
    invertedindex.js   # Construcción del índice invertido
    searchFaceted.js   # Búsqueda facetada por intersección de sets
    mockdata.js        # Datos de prueba

public/data/
  communities.json     # Fuente de datos principal (600 comunidades)
  communities.geojson  # Formato GeoJSON para el mapa
  tags.json            # Taxonomía de etiquetas temáticas (148 tags)
  audience.json        # Perfiles de público objetivo (35 perfiles)

scripts/               # Utilidades de mantenimiento de datos
  check-urls.js
  find-duplicates.js
  ensure-id-autoincrement.js
  process-to-communities-to-geojson.js
  process-community-issue.js
  migrate-add-new-fields.js        # Migración: añade urls/tags/targetAudience
  scrape-community-data.js         # Scraping con Playwright → suggestions.json
  apply-suggestions.js             # Aplica suggestions.json a communities.json
  apply-url-mapping.js             # Aplica url-mapping.json a communities.json
  url-mapping.json                 # Mapeo manual de URLs alternativas por comunidad
  suggestions.json                 # Output del scraping (no commitear si es parcial)
```

## Modelo de datos (Community)

```js
{
  id: number,
  name: string,
  status: "Activa" | "Inactiva" | "Desconocido",
  lastReviewed: "DD/MM/YYYY",
  communityType: string,        // tipo de comunidad
  eventFormat: "Presencial" | "Online" | "Híbridos" | "Desconocido",
  location: string,
  topics: string,               // texto libre heredado, separado por comas
  tags: string[],               // IDs referenciando public/data/tags.json
  targetAudience: string[],     // IDs referenciando public/data/audience.json
  contactInfo: string,          // email
  communityUrl: string,         // URL principal (web propia si existe, si no la más relevante)
  urls: {                       // URLs adicionales por plataforma (solo claves con valor)
    web?: string,
    meetup?: string,
    linkedin?: string,
    twitter?: string,
    instagram?: string,
    youtube?: string,
    discord?: string,
    telegram?: string,
    github?: string,
    mastodon?: string,
    bluesky?: string,
  },
  thumbnailUrl: string,
  latLon: { lat: number | null, lon: number | null },
  displayOnMap: boolean,
  humanValidated: boolean   // false = datos enriquecidos por IA (scraper), true = revisados por humano
}
```

## Taxonomía de etiquetas (`tags.json` / `audience.json`)

Cada tag tiene: `{ id, label, description, category, synonyms[] }`.
Cada perfil de audiencia tiene: `{ id, label, description, synonyms[] }`.

La búsqueda sobre tags debe realizarse contra `label + description + synonyms` (no solo el ID) para capturar sinónimos y términos alternativos.

Categorías de tags: Lenguajes de programación · Frameworks, Librerías y Stacks · Arquitectura y Paradigmas · DevOps, Cloud e Infraestructura · DevTools · Bases de Datos y Almacenamiento · Datos, IA y Analítica · Ciberseguridad · Hardware, IoT y Maker · Mobile y Sistemas Operativos · Realidad Extendida y 3D · Videojuegos · CMS · Tech for Social Good · Startups, Negocio y Producto · Tecnologías Descentralizadas.

## Estado (Zustand)

### community.store.js
- `allCommunities` — dataset completo
- `communitiesFiltered` — resultado tras aplicar filtros
- `invertedIndex` — estructura para búsqueda O(1)
- `filters` — filtros activos por dimensión
- `isLoading`, `error`
- `fetchCommunities()` — carga y construye índice
- `filterComunities(key, value)` — actualiza filtros y recalcula

Hooks exportados: `useAllCommunities`, `useCommunitiesFiltered`, `useIsLoading`, `useFilters`, `useNumberOfCommunities`, `useCommunityActions`, etc.

### sidebar.store.js
- Visibilidad del sidebar
- Auto-colapso en móvil (< 768px)

## Comandos disponibles

```bash
npm run dev                           # Servidor de desarrollo
npm run build                         # Build de producción
npm run build-preview                 # Build + preview local
npm run lint                          # ESLint
npm run check-urls                    # Valida URLs de comunidades
npm run find-duplicates               # Detecta duplicados por ID
npm run ensure-id-autoincrement       # Verifica secuencia de IDs
npm run process-to-communities-to-geojson  # Genera GeoJSON

# Enriquecimiento de datos (nuevos)
npm run migrate-add-new-fields        # Añade urls/tags/targetAudience a communities.json (idempotente)
npm run scrape-community-data         # Scraping con Playwright (ver opciones en el script)
npm run apply-suggestions             # Aplica suggestions.json revisado a communities.json
npm run apply-url-mapping             # Aplica url-mapping.json a communities.json
```

### Opciones del scraping

```bash
npm run scrape-community-data -- --start 0 --end 100   # rango de IDs
npm run scrape-community-data -- --id 42               # comunidad concreta
npm run scrape-community-data -- --resume              # saltar ya procesadas
npm run apply-suggestions -- --dry-run                 # previsualizar cambios
npm run apply-suggestions -- --only-approved           # solo approved: true
npm run apply-url-mapping -- --dry-run
npm run apply-url-mapping -- --force-status            # actualiza status aunque sea "Activa"
```

### Comportamiento del scraper

- **Plataformas bloqueadas** (`SKIP_SCRAPING_RE`): Twitter/X, LinkedIn, Instagram, Facebook, Discord, Telegram se saltan sin intentar visitar — evita timeouts. Si la comunidad tiene `urls.web`, se usa como fallback automático.
- **Fallback `urls.web`**: si `communityUrl` falla o es una red social, el scraper intenta `community.urls.web`.
- **Enriquecimiento meetup**: si tras scrapar la URL principal se conoce una URL de meetup (en `community.urls.meetup` o descubierta en los links), se visita para extraer topics estructurados (`/find/?keywords=`) y detectar estado activo/inactivo.
- **Topics estructurados**: los topics de meetup se mapean al catálogo `tags.json` por coincidencia en `label` y `synonyms` — más preciso que el matching de texto libre.
- **Inactivas omitidas**: comunidades con `status: "Inactiva"` se saltan por defecto; usar `--id` para forzar una concreta.

## Variables de entorno

```
VITE_BASE=/dist/                  # .env.localdev
VITE_BASE=/communities-directory/ # .env.production
```

## Patrones y convenciones

- **Naming**: lógica de negocio en español (`comunidades`, `filtros`), componentes técnicos en inglés
- **Búsqueda facetada**: índice invertido + intersección de sets (evitar bucles O(n²))
- **Rendimiento**: `useMemo` en Map, `requestAnimationFrame` para cambios de extent del mapa
- **Estilos**: clases Bulma (`.is-*`, `.has-*`) + clases propias con prefijo de contexto (`.custom-switch`, `.popover-*`, `.mycard`)
- **Grid responsive**: 1 col móvil → 2 tablet → 4 desktop → 5 large
- Tests con **Vitest** (`npm test`). Los ficheros viven en `tests/`
- Ejecutar `npm test` tras corregir bugs o implementar funcionalidad nueva
- Añadir tests para cada bug fix (test que reproduce el bug + verifica la corrección)
- Para testear scripts Node, exportar las funciones puras y guardar `main()` bajo `if (import.meta.url === \`file://\${process.argv[1]}\`)`

## Despliegue

- Estático en GitHub Pages
- Build genera `dist/` con HTML/CSS/JS
- Base path dinámico según variable `VITE_BASE`
- Entry: `index.html` → monta en `<div id="search_app">`

## PWA — Detección de actualizaciones

La app es una PWA con service worker en `public/sw.js`. Para que los usuarios reciban la notificación "Hay una nueva versión" al refrescar, **el fichero `sw.js` debe cambiar en cada build**.

### Mecanismo implementado

`public/sw.js` contiene el placeholder literal `__BUILD_VERSION__` en el `CACHE_NAME`:

```js
const CACHE_NAME = "community-builders-shell-__BUILD_VERSION__";
```

El plugin `injectSwBuildVersion` en `vite.config.js` lo reemplaza por `Date.now()` al hacer `npm run build`, generando p.ej.:

```js
const CACHE_NAME = "community-builders-shell-1748123456789";
```

Como el `CACHE_NAME` cambia en cada build:

1. El navegador detecta un SW diferente → instala el nuevo en segundo plano
2. `InstallPromptBar` muestra "Hay una nueva versión lista"
3. El usuario pulsa "Recargar" → el nuevo SW se activa, borra la caché antigua y recarga

### Regla crítica

> **Nunca cambies `__BUILD_VERSION__` por un valor fijo en `public/sw.js`.** Ese placeholder debe mantenerse intacto para que el plugin lo sustituya en cada build. Si lo reemplazas manualmente, todos los builds futuros generarán el mismo `CACHE_NAME` y la detección de actualizaciones dejará de funcionar.

### Por qué `{ cache: "no-cache" }` en navegación

GitHub Pages sirve `index.html` con `Cache-Control: max-age=600`. Sin `{ cache: "no-cache" }` en el fetch de navegación del SW, el navegador devuelve el HTML cacheado durante esos 10 minutos aunque el SW sea "network-first". La opción `no-cache` fuerza revalidación con el servidor en cada navegación.
