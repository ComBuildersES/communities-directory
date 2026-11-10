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
| i18n | `i18next` + `react-i18next` + `i18next-browser-languagedetector` |
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
    CommunityModal/    # Ficha de comunidad; OteEvents.jsx + oteEvents.js leen el feed OTE
    CommunityContribution/ # Formulario de alta/edición/baja
  stores/
    community.store.js # Estado central: datos, filtros, búsqueda
    sidebar.store.js   # Visibilidad del sidebar (responsive)
  data/
    API.js             # fetch wrapper para communities.json
    invertedindex.js   # Construcción del índice invertido
    searchFaceted.js   # Búsqueda facetada por intersección de sets

data/communities/          # FUENTE DE VERDAD: un fichero JSON por comunidad (<slug>.json)
data/deleted-communities/  # FUENTE DE VERDAD: un fichero JSON por baja (<slug>.json)

public/data/
  communities.json          # GENERADO — gitignorado, no editar
  communities.csv           # GENERADO — gitignorado, no editar
  schema.json               # GENERADO — gitignorado, no editar
  communities.geojson       # GENERADO — gitignorado, no editar
  deleted-communities.json  # GENERADO — gitignorado, no editar
  communities.meta.json     # nextCommunityId (lo mantiene solo el job de asignación)
  tags.json            # Taxonomía de etiquetas temáticas (148 tags)
  audience.json        # Perfiles de público objetivo (35 perfiles)

scripts/               # Utilidades de mantenimiento de datos
  check-urls.js
  find-duplicates.js
  ensure-id-autoincrement.js
  compile-communities.js           # Compila el bundle + geojson desde data/communities/
  generate-llm-artifacts.js        # Genera llms.txt, llms-full.txt, CSV, schema.json y sitemap
  explode-communities.js           # Migración one-shot: bundle → fichero por comunidad
  assign-community-ids.js          # Asigna ids pendientes (solo en master)
  lib/communities-store.js         # API de lectura/escritura de la fuente de verdad
  lib/communities-git.js           # Reconstruye el listado en un ref de git (baselines)
  process-community-issue.js
  scrape-community-data.js         # Scraping con Playwright → suggestions.json
  apply-suggestions.js             # Aplica suggestions.json a communities.json
  apply-url-mapping.js             # Aplica url-mapping.json a communities.json
  match-eventos-wiki.js            # Empareja organizadores de eventos.wiki con comunidades
  url-mapping.json                 # Mapeo manual de URLs alternativas por comunidad
  suggestions.json                 # Output del scraping (no commitear si es parcial)
```

## Modelo de datos (Community)

```js
{
  id: number,
  name: string,
  status: "active" | "inactive" | "unknown",
  lastReviewed: "DD/MM/YYYY",
  communityType: "tech-meetup" | "conference" | "umbrella-org" | "hacklab" | "collaborative-group" | "meta-community" | "mutual-aid",
  eventFormat: "in-person" | "online" | "hybrid" | "unknown",
  location: string,
  geographicScope: "unknown" | "local" | "provincial" | "regional" | "national" | "international",
  topics: string,               // texto libre heredado, separado por comas
  tags: string[],               // IDs referenciando public/data/tags.json
  targetAudience: string[],     // IDs referenciando public/data/audience.json
  matchesAllTags?: boolean,     // true = aplica a cualquier filtro de tags
  matchesAllAudience?: boolean, // true = aplica a cualquier filtro de público
  contactInfo: string,          // email
  communityUrl: string,         // URL principal (web propia si existe, si no la más relevante)
  urls: {                       // URLs adicionales por plataforma (solo claves con valor)
    // La lista canónica es URL_PLATFORM_OPTIONS en src/lib/communitySubmission.js
    web?: string,
    eventsUrl?: string,     // plataforma de eventos (Meetup, Eventbrite, Luma…)
    eventosWiki?: string,   // página de la comunidad en eventos.wiki
    ote?: string,           // feed de eventos en formato Open Tech Events
    blog?: string,
    rss?: string,
    forum?: string,
    linkAggregator?: string,
    mailingList?: string,
    github?: string,
    discord?: string, telegram?: string, whatsapp?: string, slack?: string,
    youtube?: string, linkedin?: string, twitter?: string, tiktok?: string,
    instagram?: string, facebook?: string, mastodon?: string, bluesky?: string,
    twitch?: string, flickr?: string,
  },
  archivedUrls?: string[],      // canales históricos que ya nadie atiende: se conservan pero NO se muestran
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
npm run dev:clean                     # Limpia caché local de Vite y arranca en 5173
npm run dev:local                     # Arranca en 4173 para evitar conflictos con tunnels/forwarding
npm run dev:local:clean               # Limpia caché local de Vite y arranca en 4173
npm run build                         # Build de producción
npm run build-preview                 # Build + preview local
npm run lint                          # ESLint
npm run check-urls                    # Valida URLs de comunidades
npm run find-duplicates               # Detecta duplicados por ID
npm run ensure-id-autoincrement       # Verifica secuencia de IDs
npm run compile-communities           # Compila communities.json + .geojson desde la fuente
npm run generate-llm-artifacts        # Genera llms.txt, llms-full.txt, CSV, schema.json y sitemap
npm run explode-communities           # Migración one-shot al layout por fichero
npm run assign-community-ids          # Asigna ids pendientes (uso en master / CI)

# Enriquecimiento de datos (nuevos)
npm run scrape-community-data         # Scraping con Playwright (ver opciones en el script)
npm run apply-suggestions             # Aplica suggestions.json revisado a communities.json
npm run apply-url-mapping             # Aplica url-mapping.json a communities.json
npm run match-eventos-wiki            # Informe de matches con eventos.wiki (--apply para escribir)
npm run migrate-enum-keys             # Migra claves de enum españolas a claves neutrales (idempotente)
```

### Opciones del scraping

```bash
npm run scrape-community-data -- --start 0 --end 100   # rango de IDs
npm run scrape-community-data -- --id 42               # comunidad concreta
npm run scrape-community-data -- --resume              # saltar ya procesadas
npm run apply-suggestions -- --dry-run                 # previsualizar cambios
npm run apply-suggestions -- --only-approved           # solo approved: true
npm run apply-url-mapping -- --dry-run
npm run apply-url-mapping -- --force-status            # actualiza status aunque sea "active"
npm run migrate-enum-keys -- --dry-run                 # previsualizar migración de claves de enum
```

### Comportamiento del scraper

- **Plataformas bloqueadas** (`SKIP_SCRAPING_RE`): Twitter/X, LinkedIn, Instagram, Facebook, Discord, Telegram se saltan sin intentar visitar — evita timeouts. Si la comunidad tiene `urls.web`, se usa como fallback automático.
- **Fallback `urls.web`**: si `communityUrl` falla o es una red social, el scraper intenta `community.urls.web`.
- **Enriquecimiento meetup**: si tras scrapar la URL principal se conoce una URL de meetup (en `community.urls.meetup` o descubierta en los links), se visita para extraer topics estructurados (`/find/?keywords=`) y detectar estado activo/inactivo.
- **Topics estructurados**: los topics de meetup se mapean al catálogo `tags.json` por coincidencia en `label` y `synonyms` — más preciso que el matching de texto libre.
- **Inactivas omitidas**: comunidades con `status: "inactive"` se saltan por defecto; usar `--id` para forzar una concreta.

## Variables de entorno

```
VITE_BASE=/dist/                  # .env.localdev
VITE_BASE=/communities-directory/ # .env.production
```

## Rutas de assets y ficheros de datos

**Regla crítica: todas las rutas de ficheros locales deben ser absolutas.**

El app se despliega bajo un base path configurable (`/communities-directory/` en producción) y usa prefijos de locale en la URL (`/es/`, `/en/`). Las rutas relativas como `"data/foo.json"` se resuelven contra la URL actual y se rompen cuando el pathname no es `/`.

### Patrón correcto

```js
// ✅ Absoluta usando BASE_URL (ya incluye la barra final)
const URL = `${import.meta.env.BASE_URL}data/communities.json`;

// ❌ Relativa — se rompe en /es/, /en/, etc.
const URL = "data/communities.json";
```

`import.meta.env.BASE_URL` ya termina en `/` — no añadir barra extra.

### Normalización de thumbnailUrl

Los registros de `communities.json` tienen `thumbnailUrl` como ruta relativa (`"images/foo.webp"`). Se normalizan a ruta absoluta **en el store al cargar los datos**, no en los componentes:

```js
// community.store.js — al procesar rawData
const data = rawData.map((c) => {
  const { thumbnailUrl } = c;
  if (!thumbnailUrl || thumbnailUrl.startsWith("http") || thumbnailUrl.startsWith("/")) return c;
  return { ...c, thumbnailUrl: `${import.meta.env.BASE_URL}${thumbnailUrl}` };
});
```

Los componentes (`CommunityCard`, `CommunityModal`, `Map`) reciben URLs ya resueltas y no necesitan saber nada de `BASE_URL`.

## Edición de taxonomías

`matchesAllTags` y `matchesAllAudience` representan comunidades generalistas o abiertas a cualquier perfil.

- En el formulario, marcar esos checkboxes no debe borrar la selección visual actual de `tags` o `targetAudience`; así se evita perder trabajo por un clic accidental.
- En el payload final y en el JSON que viaja al issue, si uno de esos flags está activo, el array correspondiente debe compactarse a `[]`.
- Esa compactación ocurre al construir el payload y al procesar el issue, no en el estado visible del formulario.

## Troubleshooting local

Si `http://localhost:5173` muestra código que no coincide con lo que hay en disco, sospecha primero de un conflicto de puerto o de un port forwarding local.

- En macOS con VS Code Remote puede aparecer `Code Helper` escuchando en `127.0.0.1:5173`; en ese caso el navegador puede estar entrando por el túnel, no por tu Vite local.
- Confirmación rápida:

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
curl -s http://127.0.0.1:5173/src/lib/communitySubmission.js | rg "normalizeTaxonomySelection|buildCommunityPayload"
```

- Si la respuesta no contiene la firma esperada del código actual, usa `npm run dev:local:clean` y abre `http://127.0.0.1:4173`.

---

## Flujo de trabajo con fases i18n

**Antes de empezar una nueva fase del plan i18n, pedir permiso al usuario.** Las fases se ejecutan una a una, con checkpoint de revisión y prueba entre ellas. No avanzar a la siguiente fase sin confirmación explícita.

---

## i18n y locale routing

La app usa prefijos de locale en la URL (`/es/`, `/en/`). Ver `docs/i18n-spec.md` y `docs/archive/2026-03-i18n-plan.md` para la estrategia completa.

### Detección de locale

`src/i18n/index.js` — orden: URL path → `localStorage` (`preferred-locale`) → `navigator.languages` → fallback `es`.

```js
// lookupFromPathIndex = número de segmentos del base path
// /communities-directory/es/ → BASE_SEGMENTS=1 → lookupFromPathIndex=1
// /es/                       → BASE_SEGMENTS=0 → lookupFromPathIndex=0
const BASE_SEGMENTS = import.meta.env.BASE_URL.split('/').filter(Boolean).length;
```

### Redirect al locale en main.jsx

El redirect que añade el prefijo de locale a la URL **no puede depender de `i18n.resolvedLanguage`** (puede no estar disponible de forma síncrona). Implementar detección directa con `localStorage` + `navigator.languages`.

### Constante de locales soportados

```js
// src/i18n/index.js
export const SUPPORTED_LOCALES = ['es', 'en'];
```

Importar desde aquí en cualquier código que necesite validar o iterar los locales; no duplicar la lista.

---

## Fuente de verdad de los datos (una comunidad, un fichero)

**`data/communities/<slug>.json` y `data/deleted-communities/<slug>.json` son la fuente de
verdad. `public/data/communities.json`, `.geojson` y `deleted-communities.json` son
artefactos generados y están gitignorados: no los edites ni los commitees.**

Motivo (issue #437): con todas las comunidades en un único JSON, dos propuestas simultáneas
editaban las mismas líneas de cola y el merge conflictaba siempre. Con un fichero por
comunidad el conflicto es imposible por construcción, igual que ya ocurría con las imágenes.

### Cómo acceder a los datos desde un script

Nunca leas ni escribas el bundle directamente. Usa el store:

```js
import { readCommunities, writeCommunities } from './lib/communities-store.js';

const communities = readCommunities();   // lista equivalente al antiguo communities.json
// ...modificar...
writeCommunities(communities);           // sincroniza ficheros fuente + recompila el bundle
```

Para las bajas, el mismo patrón: `readDeletedCommunities()`, `writeDeletedCommunity(entry)`
y `writeDeletedCommunities(list)`.

Para comparar contra una baseline de git (`--baseline-ref`, commit padre, `origin/master`):

```js
import { readCommunitiesAtRef } from './lib/communities-git.js';
const baseline = readCommunitiesAtRef('origin/master');  // cae al bundle en refs antiguos
```

### Asignación de `id`

El `id` **no** se asigna al crear la propuesta: el fichero nace con `id: null` y se asigna ya
en `master`, dentro del job `build` de `deploy.yml`, **antes** del build. Asignarlo en la
rama era lo que hacía que dos propuestas simultáneas reclamasen el mismo id.

- La serialización la da `concurrency: group: pages` con `cancel-in-progress: false`: dos
  merges seguidos no pueden reclamar el mismo id.
- Asignar antes del build es lo que permite que la comunidad nueva se publique en **ese
  mismo deploy**. El commit de los ids lleva `[skip ci]` porque ese run ya publica.
- `id: null` es un estado válido en `data/communities/` y en la validación.
- `compileBundle()` no publica comunidades sin id. Con el flujo actual eso no ocurre (los
  ids se asignan antes); queda como red de seguridad.
- Mientras no tiene id, la comunidad ya es enlazable por slug
  (`resolveCommunityFromIdentifier`).

**No añadas otro workflow que asigne ids.** Dos jobs asignando en grupos de concurrencia
distintos pueden reclamar el mismo id, que es exactamente el bug que esto resuelve.

### Identidad de una comunidad entre dos refs

Al comparar el estado en dos commits hacen falta **las dos claves**: el `id` (porque una
edición puede renombrar la comunidad, y entonces el slug cambia) y el slug (porque en el
commit del alta el id todavía es `null`). Ver `getChangedCommunities` en
`scripts/generate-changelog.js` y su test.

### Comparar dos registros

Usa `stableStringify` del store, nunca `JSON.stringify` directo: el store normaliza el orden
de claves al escribir, y un comparador sensible al orden marcaría las 600+ comunidades como
modificadas en cada PR.

### Canales archivados (`archivedUrls`)

Canales que una comunidad tuvo abiertos pero que su equipo dinamizador actual no atiende
(issue #353). Reglas:

- **No se renderizan nunca** en la ficha ni en las tarjetas: un canal zombie que parece
  activo manda a la gente a un sitio donde nadie responde.
- La clave se **omite** cuando no hay nada archivado, para no añadir un `[]` a las 600+
  fichas. En una edición, el payload sí incluye `archivedUrls: []` si la comunidad tenía
  canales archivados y se han quitado todos: es lo que distingue "no se tocó" de
  "se desarchivó todo" (`dropEmptyArchivedUrls` limpia el `[]` antes de escribir el fichero).
- Una URL no puede estar a la vez archivada y activa: `buildCommunityPayload` y
  `normalizePayload` la desarchivan si vuelve a aparecer como canal activo, y
  `validate-community-data` lo rechaza como error.
- El formulario avisa (`ArchivedUrlWarning`) cuando alguien intenta dar de alta una URL que
  el directorio ya tiene archivada, incluida la de la propia comunidad que se está editando.
- `apply-suggestions` no reintroduce un canal archivado por scraping.

### Coordenadas (`latLon`) en una edición

El formulario **no** geocodifica: siembra el borrador con el `latLon` de la ficha actual y
solo usa Nominatim para inferir `provinceId`. Tampoco hay input de lat/lon. Por eso una
edición que mueve `location` llega con las coordenadas viejas en el payload (PR #457: la
ubicación pasó a Mallorca y el pin se quedó en Barcelona).

Quien lo arregla es `resolveCoordinates` en `scripts/process-community-issue.js`: si la
propuesta cambia `location` **y** trae exactamente las coordenadas heredadas, regeocodifica.
Si las trae distintas, alguien las puso a mano y manda su valor. Si Nominatim falla o no
devuelve nada, conserva las heredadas: sacar la comunidad del mapa es peor que un pin
desactualizado.

### Ámbito geográfico (`geographicScope`)

Territorio al que la comunidad da servicio (issue #402). **No** es lo mismo que `location`:
una comunidad puede celebrar sus eventos en Madrid y dar apoyo a nivel nacional (Women4TT).

- El campo es **opcional** en los ficheros fuente: las 600+ fichas anteriores no lo traen y
  la validación solo lo rechaza si viene con un valor no canónico.
- El store rellena `geographicScope: "unknown"` al cargar los datos; sin ese default el
  filtro del sidebar no podría ofrecer "Desconocido".
- Filtro en URL: clave corta `gs` (`?gs=national,regional`).

### Eventos vía OTE y eventos.wiki

El directorio no almacena eventos (issues #57, #349): si la comunidad tiene `urls.ote`,
`CommunityModal` pide ese feed [Open Tech Events](https://opentechevents.org/) al abrir la
ficha y muestra los próximos eventos (o el último celebrado).

- La atribución se deriva del **dominio que sirve el feed** (`feed.url` y, si falta, la URL
  del propio feed): un feed OTE puede estar alojado en eventos.wiki, en GitHub Pages o en la
  web de la comunidad.
- La sección enlaza al [lector de OTE](https://reader.opentechevents.org/) (`?subscribe=<feed>`):
  muestra todo lo que publique el evento (C4P, precios, ponentes), no solo lo que cabe en la ficha.
- No todos los dominios sirven CORS, y **un redirect sin cabeceras CORS también rompe el
  fetch** aunque el destino sí las traiga: guarda siempre la URL canónica del feed
  (`communitybuilders.dev/events/feed.json`, no el `github.io` que redirige). Si aun así
  falla, la sección se queda en el enlace al feed; nunca rompe la ficha.
- `scripts/match-eventos-wiki.js` empareja los organizadores de
  `https://eventos.wiki/events.json` con las comunidades por nombre y rellena
  `urls.eventosWiki` + `urls.ote`. Por defecto solo aplica matches exactos; los parciales
  ("Codemotion" vs "Codemotion Madrid") se listan para revisión humana y requieren
  `--include-fuzzy`. Nunca reintroduce un canal archivado.

### Superficie para LLMs y agentes

`scripts/generate-llm-artifacts.js` genera en cada build cinco artefactos gitignorados:
`public/llms.txt`, `public/llms-full.txt`, `public/data/communities.csv`,
`public/data/schema.json` y `public/sitemap.xml`. `public/robots.txt` sí está versionado
(es estático) y permite el rastreo a todos los crawlers, los de IA incluidos, pidiendo
atribución y remitiendo a los ficheros canónicos en vez de a la SPA.

Están en inglés a propósito: es la convención de `llms.txt` y lo que mejor interpretan los
modelos. Los datos de cada comunidad se emiten en su idioma.

**Al añadir un campo al modelo de datos, documentarlo en `buildSchema()`.** Un campo que no
está en `schema.json` es un campo que un agente va a interpretar adivinando. Si el campo
cambia cómo se lee un registro (como `matchesAllTags`, que significa "encaja con todo" pese a
traer un array vacío), explicarlo además en la sección "How to read a community record" de
`buildLlmsIndex()`.

El JSON-LD (`Dataset` + `WebSite`) vive **estático en `index.html`**, no inyectado por React:
la app renderiza en cliente y un crawler que no ejecuta JS no vería un bloque inyectado.

La pestaña "Organizo una comunidad" presenta sus cuatro pasos en un **stepper**, de uno en
uno: son cuatro párrafos densos y apilados se leían como un muro, así que nadie llegaba al
cuarto (el feed de eventos), que es justo el que más cuesta explicar.

El equivalente para personas es `src/components/OpenDataModal/`, abierto desde el botón
"Datos abiertos + IA" de la cabecera. Si cambian las reglas de interpretación del dataset,
cambian en tres sitios: `buildLlmsIndex()`, el bloque de instrucciones de `AgentsTab` y
`docs/DATA.md`.

### Alta asistida por IA (`src/lib/aiAssist.js`)

El formulario ofrece abrir Claude o ChatGPT con un prompt preparado (`claude.ai/new?q=` /
`chatgpt.com/?q=`) y aceptar de vuelta el JSON que devuelvan. No hay clave de API ni llamada
desde el servidor: el directorio es estático y la IA la pone quien la usa.

- El prompt **enlaza** `schema.json`, `tags.json` y `audience.json` en vez de incrustarlos:
  166 tags no caben en una query string, y así el modelo trabaja contra la versión vigente.
- `parseAssistedCommunityJson` no se fía de lo que llega del portapapeles: extrae el objeto
  aunque venga en una valla ```json o con texto alrededor, filtra a las claves conocidas,
  descarta valores fuera de los enums y tags o claves de `urls` que no existan, y devuelve
  avisos en vez de romper. Nunca acepta `id` ni `humanValidated` de la IA.
- Acepta **varias URLs**: la web dice de qué va la comunidad, la plataforma de eventos si
  sigue viva, el repositorio qué publican. El prompt las lista todas y pide cruzarlas.
- Al aplicar, solo se pisan las claves que trae la propuesta: lo que la persona ya escribió a
  mano no se pierde.
- Si añades un campo al modelo, añádelo a `STRING_FIELDS`, `ARRAY_FIELDS` o `ENUM_VALUES` o
  la IA no podrá rellenarlo.

### Botón flotante (`src/components/SupportFab/`)

Lo primero que hace el panel es **preguntar**: "¿Necesito ayuda?" o "¿Quiero ayudar?". Son
dos conversaciones distintas, y mezclarlas obligaba a que una fuera el titular y la otra se
leyera como letra pequeña. Las claves van en `support.help.*` y `support.give.*`; Escape
vuelve a la pregunta antes de cerrar el panel.

- **Necesito ayuda**: el soporte de siempre (Telegram, alta/edición de ficha, GitHub, lista
  de correo, Linktree).
- **Quiero ayudar**: apoyo a la iniciativa, y ahí la vía preferente es **hablar** — cada
  persona puede ayudar en algo distinto y eso no se resuelve con una lista de enlaces. Por
  eso la llamada principal es escribir por Telegram, y difundir / revisar tu ficha /
  GitHub van debajo como "si prefieres ir directo".

Todo el "cómo colaborar" vive en la vista **Quiero ayudar**, incluido el llamamiento a
responsables provinciales y la guía CONTRIBUTING: antes estaba repartido entre el popover
"Sobre el proyecto" de la cabecera y el FAB. El popover solo conserva el botón que abre el
FAB en esa vista, vía `openSupportFab("give")` (`src/lib/supportFab.js`). Es un evento de
`window` a propósito: cabecera y FAB son hermanos colgando de `App`, y la alternativa era
bajar el estado por props a través de todo `Heading` para algo que solo necesitan los dos
extremos.

"¿Te parece útil?" abre con dos acciones concretas: **dar una estrella al repo** en GitHub
(que no estaba en ninguna parte) y guardar el directorio en favoritos (que era media frase
dentro de un párrafo). Lo segundo **no se puede disparar desde JS** —ningún navegador deja
añadir un favorito por código—, así que lo único que cabe es enseñar el atajo.

`TELEGRAM_GROUP_URL` en `SupportFab.jsx` es el **único** sitio donde va la URL del grupo.
Con valor, hablar por Telegram es la llamada principal de las dos vistas; vacío, el panel
cae a los canales que quedan sin enlazar a ninguna parte. La pestaña "Organizo una
comunidad" del modal de datos repite la misma URL: si cambia el grupo, son **dos**
constantes.

Los enlaces de compartir salen de `src/lib/shareLinks.js`, compartidos con el popover "Sobre
el proyecto" de la cabecera: dos copias del mismo intent se desincronizan en el primer cambio
de texto.

`useSupportNudge.js` llama la atención sobre el botón: rebote corto, tooltip y un clic
sintetizado con WebAudio (sin fichero). Una sola vez por persona (`localStorage`), nunca con
un modal abierto, y sin rebote si el sistema pide movimiento reducido. El sonido se abandona
en silencio si el navegador tiene el audio bloqueado por falta de gesto previo: es un extra,
no el mensaje: `unlockNudgeAudio` abre el `AudioContext` en el primer gesto (clic, tecla o
toque), que es la única ventana en la que el navegador lo permite. Si el aviso llega antes de
cualquier gesto, no suena.

**El aviso espera a que el directorio haya servido para algo** (`resolveNudgeTrigger`, función
pura con test): abrir una ficha o cualquier diálogo, usar la búsqueda o los filtros, o leer más
de una pantalla. Pedir apoyo a alguien que acaba de llegar es pedir antes de haber dado nada.
Hay un suelo de 7 s y un techo de 60 s: quien lleva un minuto leyendo sin tocar nada también
está usando el directorio, así que se le avisa igual.

**El scroll no descarta el aviso**, y si la persona está desplazándose cuando toca mostrarlo,
espera a que la página se quede quieta (`resolveNudgeDelay`). Aparecer y desaparecer en mitad
de un scroll es el peor momento: nadie mira esa esquina mientras se desplaza, y el aviso se
gasta sin que lo vea.

El botón es un círculo con el icono de conversación, sin etiqueta: el mensaje lo lleva el
tooltip del aviso. Eso hace que el anillo blanco y el fondo azul marino sean lo **único**
que lo separa de la cuadrícula de logos de la vista de lista; si cambia el color, hay que
comprobarlo sobre la lista, no sobre fondo blanco.

Los prompts del modal viven en los locales, no en el componente, y `tests/openDataPrompts.test.js`
los vigila: deben **preguntar** a la persona (perfil, zona, disponibilidad) en vez de dejar un
`[rellena aquí]`, y recordar las trampas del dataset (`archivedUrls`, `matchesAllTags`,
`geographicScope`). Un hueco que alguien tiene que rellenar a mano es un prompt que no se usa.

### Claves de `urls`

Añadir una plataforma nueva exige tocar **cuatro** sitios, o se cae por el camino:

1. `URL_PLATFORM_OPTIONS` en `src/lib/communitySubmission.js` (formulario)
2. `ALLOWED_URL_KEYS` en `scripts/validate-community-data.js` (si falta, el modo estricto
   rechaza la comunidad)
3. `URL_CONFIG_KEYS` **y** `URL_GROUP_DEFS` en `CommunityModal.jsx` (si falta en el grupo,
   el enlace nunca se renderiza)
4. `communityModal.url.<clave>` en `src/i18n/locales/es.json` y `en.json`

Opcional, pero es lo que distingue un campo usable de uno críptico: `platformHelpContent` en
`CommunityContribution.jsx` + `contribution.urlHelp.<clave>` en ambos locales, para que el
campo tenga icono de ayuda con un ejemplo de URL.

**No hay clave por plataforma de eventos.** No existe `meetup` (ni `eventbrite`, ni `luma`):
esas URLs van en `eventsUrl`, o directamente en `communityUrl` si es la home de la comunidad.
Inventarse la clave no falla al escribir el fichero, falla en el hook de pre-commit
(`validate-data:staged` → "urls contiene una clave no soportada").

### Slugs

`slugifyCommunityName` existe en `scripts/lib/communities-store.js` y en
`src/lib/communitySubmission.js`, y **deben** producir el mismo resultado: los deep links por
slug dependen de esa equivalencia. Hay un test que lo verifica
(`tests/communitiesStore.test.js`).

---

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

### El CHANGELOG se regenera solo, en dos sitios

`CHANGELOG.md` **nunca se edita a mano**: lo genera `scripts/generate-changelog.js` a partir
del log de git, entero, en cada ejecución.

1. **En local**: el hook `.githooks/post-commit` lo regenera y lo mete en el commit con
   `--amend`. Depende de `core.hooksPath`, que configura `npm install` (script `prepare`).
2. **En `master`**: el job `build` de `deploy.yml` lo regenera y commitea, después de
   asignar los IDs y antes del build.

El paso de CI es el que de verdad lo garantiza: **el hook solo existe en los clones locales
que hayan hecho `npm install`**, así que nada de lo que se mergea desde la web de GitHub
—incluidas todas las propuestas de comunidad— pasa por él. Sin ese paso, el changelog se
quedaba atrás hasta que alguien commiteaba a mano desde su máquina.

Va **después** de asignar los IDs porque una comunidad recién dada de alta necesita su id
para poder enlazar su ficha del directorio.

### Qué entra y qué no en el changelog

- Los cambios de comunidad salen con su acción y su enlace: `Añadida X`, `Actualizada X`,
  `Eliminada X`, con la PR de la que vinieron. Los deriva `describeCommunityChanges`
  comparando el listado en el commit y en su padre, **una línea por comunidad**: un commit
  que toque varias las lista todas.
- Una baja solo se llama baja si aparece en `data/deleted-communities/`. Sin ese registro,
  la comunidad desapareció del listado por otro motivo y decir "eliminada" sería mentir.
- `isNoiseCommitSubject` descarta el mantenimiento de los propios ficheros generados
  (`update changelog`, `update README.md`, `update .all-contributorsrc`, la asignación de
  IDs). Ahogaban los cambios reales: eran la mitad del fichero.

### `[skip ci]` salta el push entero, no solo su commit

GitHub mira **únicamente el commit de cabeza** del push. El hook de pre-commit regenera
`CHANGELOG.md`, y si ese cambio acaba en un commit propio con `[skip ci]` encima de tu
trabajo, el push no dispara `deploy.yml` y **nada de lo que va debajo se publica**, aunque
esos commits no lleven la marca.

- La marca se busca en **todo el mensaje**, cuerpo incluido: un commit que la cite al
  explicarla (como este apartado) también salta el deploy. Si necesitas nombrarla en un
  mensaje de commit, pártela.
- Al pushear a `master` a mano, deja el commit del changelog en medio, o comprueba que haya
  salido un run: `gh run list --workflow deploy.yml --limit 1`.
- Si no salió, se lanza a mano: `gh workflow run deploy.yml --ref master`.

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
