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
  status: "active" | "inactive" | "unknown" | "merged",
  lastReviewed: "DD/MM/YYYY",
  communityType: "tech-meetup" | "conference" | "umbrella-org" | "hacklab" | "collaborative-group" | "meta-community" | "mutual-aid",
  eventFormat: "in-person" | "online" | "hybrid" | "unknown",
  location: string,
  geographicScope: "unknown" | "local" | "provincial" | "regional" | "national" | "international",
  mergedIntoId?: number | null, // solo con status "merged": comunidad en la que continúa
  organizedBy?: number[],       // comunidades del directorio que organizan esta (ver abajo)
  topics: string,               // texto libre heredado, separado por comas
  tags: string[],               // IDs referenciando public/data/tags.json
  targetAudience: string[],     // IDs referenciando public/data/audience.json
  matchesAllTags?: boolean,     // true = aplica a cualquier filtro de tags
  matchesAllAudience?: boolean, // true = aplica a cualquier filtro de público
  contactInfo: string,          // email
  communityUrl: string,         // URL principal (web propia si existe, si no la más relevante)
  urls: Array<UrlEntry>,        // canales; ver src/lib/communityUrls.js
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

- **Plataformas bloqueadas** (`SKIP_SCRAPING_RE`): Twitter/X, LinkedIn, Instagram, Facebook, Discord, Telegram se saltan sin intentar visitar — evita timeouts. Si la comunidad tiene un canal `web`, se usa como fallback automático.
- **Fallback al canal `web`**: si `communityUrl` falla o es una red social, el scraper intenta el canal de kind `web`.
- **Enriquecimiento meetup**: si tras scrapar la URL principal se conoce una URL de meetup (en el canal `eventsUrl` de la comunidad o descubierta en los links), se visita para extraer topics estructurados (`/find/?keywords=`) y detectar estado activo/inactivo.
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

### Fusiones (`status: "merged"` + `mergedIntoId`)

Varias comunidades que pasan a ser una sola (Makers of Murcia, GameDev Murcia y murcia dev →
MurciaTech). No es `inactive` —una comunidad parada sigue siendo ella misma— ni `parentId`,
donde la hija y el paraguas siguen existiendo las dos. Toda la lógica en
`src/lib/mergedCommunities.js`.

- La relación se guarda **solo en la comunidad fusionada**. La inversa ("MurciaTech integra a
  estas tres") la deriva `buildMergedFromMap` en el store: duplicarla en el fichero del
  destino garantiza que las dos caras acaben desincronizadas.
- Al no ser `active`, queda fuera del listado, la búsqueda y el mapa con el filtro por defecto,
  **pero la ficha sigue siendo enlazable**: quien llega desde un enlace viejo tiene que poder
  seguir hasta la comunidad viva. El modal pinta las dos caras y navega entre fichas con
  `openRelatedCommunity` (App.jsx), que **no** vuelve a fijar `modalScrollLockY`: con el modal
  abierto `window.scrollY` es 0 y al cerrar devolvería a la persona al principio del listado.
- **No se admiten cadenas** (A fusionada en B, y B en C): quien llega a A tendría que dar dos
  saltos y nada garantiza que la cadena termine. Lo rechaza `validateMergedReferences`, que
  corre en `validate-data` sobre el listado completo, no solo sobre lo que cambia.
- Las fusionadas salen del `sitemap.xml`: la que se indexa es la viva. Se quedan en
  `communities.json` y en `llms.txt` explica qué significa el estado.
- En el formulario el campo "Comunidad en la que continúa" solo aparece con el estado
  Fusionada, y sus candidatas excluyen la propia ficha y las ya fusionadas.

### Autoría de encuentros recurrentes (`organizedBy`)

Una asociación que hace quedadas pequeñas **y además** una conferencia anual con marca propia
(GDG Málaga y el Biznaga Fest; GeeksCAT y la GeeksCAT Conf) son **dos fichas vivas**, no una.
Antes había que elegir, y la que no entraba desaparecía del directorio. Issue #475; toda la
lógica en `src/lib/organizedCommunities.js`.

- No es `parentId` (pertenencia a un paraguas) ni `mergedIntoId` (sucesión: una de las dos
  caras está muerta). Aquí las dos están vivas y la relación es de **autoría**. `parentId`
  sigue significando "capítulo de" en ~105 fichas: estirarlo cambiaría lo que dice
  `ParentFilterBanner` en todas ellas.
- **Es plural y opcional.** Plural porque hay encuentros co-organizados. Opcional porque es
  lo que resuelve el "¿qué va antes, el huevo o la gallina?": CommitConf existe sin un grupo
  que mantenga un canal activo, así que se queda sin `organizedBy`.
- **Solo enumera comunidades del directorio**, y la ficha lo dice en voz alta
  (`communityModal.organizedByNote`). Un encuentro tiene empresas, patrocinadores y apoyo
  institucional que aquí no se listan; sin esa nota, una lista con una sola comunidad se lee
  como "lo organiza solo esta gente". Lo mismo vale para `llms.txt` y los prompts.
- **La relación se guarda solo en la ficha organizada.** La inversa ("GDG Málaga organiza el
  Biznaga Fest") la deriva `buildOrganizedByMap` en el store, igual que con las fusiones.
- Se admiten **cadenas** (paraguas → comunidad → encuentro): son relaciones distintas y cada
  salto lleva a una ficha viva. Lo que `validateOrganizedByReferences` rechaza es la autoría
  **recíproca**: si A organiza B y B organiza A, ninguna es la autora.
- Los dos lados tienen **ciclo de vida propio** (una asociación dormida que sigue sacando su
  conferencia, o al revés), así que el vínculo se pinta siempre, con el estado del otro lado.
  Mismo criterio que en las fusiones: quien llega por un enlace tiene que poder seguir.
- **Ficha propia solo con marca propia + canales propios.** La edición ("Biznaga Fest 2026")
  nunca: eso es un evento y vive en OTE / eventos.wiki. Un evento anual sin nombre propio se
  queda como canal `eventsUrl` de la comunidad. Es la línea que evita que el directorio se
  convierta en un catálogo de eventos.
- Si el encuentro **no tiene canales propios**, no se copian los de quien lo organiza: una URL
  en dos fichas se valida dos veces y al archivarla hay que acordarse de los dos sitios. La
  ficha muestra el CTA para añadir el canal que falte y el enlace a los canales de la
  organizadora.
- La IA del formulario **no rellena este campo** (ni `parentId`, ni `mergedIntoId`): un id solo
  significa algo dentro de este dataset, así que un modelo que lo rellena está adivinando.
- El relleno de las conferencias ya publicadas es **manual**, caso a caso. Un vínculo de
  autoría equivocado es peor que ninguno, así que no hay script de matching por nombre.

Queda abierto en #475 el tipo para hackathones, jams y datatones: hoy están repartidos entre
`conference` y `tech-meetup`, y ninguno de los dos es verdad.

### A una comunidad inactiva no se le pide logo ni URL

`requiresBranding` en `scripts/validate-community-data.js`: con `status: "inactive"` no se
avisa de que falten `thumbnailUrl` ni `communityUrl`, ni se exigen en una propuesta nueva.

No hay nadie a quien pedírselos, y su ficha existe para que quien busque el grupo sepa que ya
no organiza nada. Eran **95 de las 119 advertencias** de cada validación: un aviso que nadie va
a atender esconde los que sí. `unknown` sigue avisando —ahí la comunidad puede estar viva— y
`merged` también, porque su ficha es el camino hacia la comunidad viva.

### Comunidades sin logo

La tarjeta pinta las iniciales de la comunidad. Antes el hueco se rellenaba con una imagen
traída de `bulma.io`: la cuadrícula dependía de un tercero para pintarse —y de paso le
contaba quién la estaba mirando— a cambio de un rectángulo gris.

El sustituto cubre además el caso que faltaba: una imagen **renombrada o borrada** salía como
icono roto, porque sólo se caía al relleno si el campo venía vacío.

`src/components/Card.jsx` no lo importa nadie y conserva dos hotlinks más a `bulma.io`; si se
borra, se van con él.

### Ámbito geográfico (`geographicScope`)

Territorio al que la comunidad da servicio (issue #402). **No** es lo mismo que `location`:
una comunidad puede celebrar sus eventos en Madrid y dar apoyo a nivel nacional (Women4TT).

- El campo es **opcional** en los ficheros fuente: las 600+ fichas anteriores no lo traen y
  la validación solo lo rechaza si viene con un valor no canónico.
- El store rellena `geographicScope: "unknown"` al cargar los datos; sin ese default el
  filtro del sidebar no podría ofrecer "Desconocido".
- Filtro en URL: clave corta `gs` (`?gs=national,regional`).

### Eventos vía OTE y eventos.wiki

El directorio no almacena eventos (issues #57, #349): si la comunidad tiene un canal de kind `ote`,
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
- **Que el feed traiga eventos o no es cosa de la comunidad, no del directorio.** Aquí solo se
  lee. Por eso `llms.txt`, los prompts y `docs/DATA.md` dicen que el feed es el sitio **donde
  se puede comprobar** la actividad, y no que tenerlo la demuestre: con la redacción anterior
  ("lo único que evidencia actividad real"), un modelo deducía "tiene feed, luego está viva".
  Lo que hay que leer son las fechas de dentro.
- La invitación a publicar el feed vive en el formulario (`OteCallout.jsx`) como **un gancho
  de una línea que abre un modal**, y **solo para quien no tiene ya canal `ote`**. Antes era un
  bloque fijo —argumentario, cuatro vías técnicas y cinco enlaces— en medio de la edición de
  los canales: quien venía a corregir una URL se topaba con un muro, y lo veía también quien ya
  publica su feed, donde eso no es más que ruido. Dentro del modal, la vía fácil (eventos.wiki)
  va suelta y las demás plegadas, porque es lo único que la mayoría necesita leer; para el
  resto está el botón que abre el FAB en "¿Necesito ayuda?" (`openSupportFab("help")`).
- Lo primero del modal es **la analogía** ("el hijo de RSS, iCalendar y schema.org/Event, pero
  para comunidades técnicas"), destacada y sola: es lo que hace entender OTE sin leer la
  especificación, y todo lo que viene detrás (6 campos obligatorios de más de 100, quién lo lee,
  la exportación a ICS y RSS) solo se entiende sabiendo ya de qué hablamos.
- `scripts/match-eventos-wiki.js` empareja los organizadores de
  `https://eventos.wiki/events.json` con las comunidades por nombre y rellena
  los canales `eventosWiki` + `ote`. Por defecto solo aplica matches exactos; los parciales
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
cambian en cuatro sitios: `buildLlmsIndex()`, el bloque de instrucciones de
`AgentInstructions` (pestaña "Construyo con los datos"), `openData.prompts.rules` en los dos
locales y `docs/DATA.md`.

**`llms.txt` es ASCII puro a propósito.** GitHub Pages sirve los `.txt` sin `charset`, y el
navegador los decodifica con la codificación local: un `—` se lee "â€”". Como el índice es
prosa en inglés, el arreglo es no usar tipografía fuera de ASCII (hay test). En
`llms-full.txt` los acentos de los nombres son inevitables, así que abre con BOM.

El índice **declara la cobertura de cada campo flojo** (`tags`, `targetAudience`,
`geographicScope`, el canal `ote`, `humanValidated`), calculada en cada build. Sin ese dato, un
modelo lee un campo vacío como "esta comunidad no trata de eso" y la descarta en silencio,
cuando lo que pasa es que nadie lo ha rellenado.

### Transparencia: cuánto de esto lo ha mirado una persona

Solo 77 de las 446 comunidades activas están revisadas (17%). Ese número, presentado
como nota de fiabilidad, hunde la confianza de quien acaba de llegar; presentado como trabajo en
curso, recluta.

**La métrica que se publica es la de activas, no la del dataset entero** (que sería 89 de 657,
un 13%): repasar una comunidad que ya no organiza nada no mejora lo que alguien consulta hoy, y
medir sobre el total castiga el esfuerzo sin que sirva de nada. `coverage.json` trae los dos
recuentos; la web usa el de `active`. Por eso el CTA fija `status=active` junto al filtro de
revisión: si el listado al que llevas no coincide con el número que la persona acaba de leer,
el número sobra.

**El origen se cuenta en este orden, y no es decorativo**: las comunidades las añadió gente una
a una, y lo que puso el proceso semiautomático fue el **etiquetado mínimo** encima (temáticas,
enlaces, estado). Contado al revés —"las fichas las recopiló un proceso automático"— un dataset
humano con etiquetado asistido se lee como un dataset generado por IA, que es exactamente la
duda que esta superficie viene a resolver. Lo mismo vale para el aviso de la ficha: lo que está
sin revisar es el etiquetado, no la existencia de la comunidad.

De ahí cómo está montado:

- El cálculo vive **una sola vez** en `src/lib/dataCoverage.js`, y lo consumen las dos
  superficies: el store (`useDataCoverage`) para la web y `generate-llm-artifacts.js` para los
  recuentos de `llms.txt` y para `public/data/coverage.json` (generado, gitignorado). Con dos
  cálculos, lo que lee un modelo y lo que ve una persona se contradicen, y entonces la cifra
  de transparencia es justo lo que nadie se cree.
- La explicación del método vive en el popover "Sobre el proyecto"
  (`src/components/DataTransparency/`), con la versión larga en `docs/DATA.md`. El popover
  **no** es enlazable ni indexable: si algún día hace falta que un crawler o una cita apunten
  ahí, el bloque se mueve a una vista propia.
- El bloque **colapsa, pero el número no**: la barra y "89 de 657" se ven siempre; lo que se
  guarda detrás del desplegable es el proceso y los botones. Si el 13% se esconde, nadie abre
  el desplegable y la transparencia deja de existir.
- La llamada principal es **repasar una comunidad** (`?s=active&hv=false`), no "ver solo las
  revisadas": 369 pendientes son una deuda, y "con que cada persona repase una" las vuelve un
  reparto. Lleva el coste real (cinco minutos) porque sin él la petición es indefinida.
- En la interfaz se habla de **comunidades**, no de "fichas": quien llega busca comunidades, y
  "ficha" es vocabulario de quien mantiene el dataset.
- El estado vacío de la lista (`src/components/EmptyResults.jsx`) tiene tres variantes, y la que
  decide es una función pura con test (`src/lib/emptyResults.js`). La que justifica el módulo es
  **"pedí pendientes y no hay ninguna"**: eso es haber terminado la zona, y con el mensaje
  genérico se leería como una búsqueda fallida. Antes de esto la lista no tenía estado vacío
  ninguno: cuadrícula vacía y debajo el CTA de añadir comunidad, que ahí se lee como "está roto".
- Lo que falta está en el **issue #463**, y el progreso por zona de ahí **no necesita faceta de
  provincia**: el mapa ya filtra por extent y el foco ya viaja en la URL (`?view=map&m=...`), así
  que el deep link por zona se construye hoy. El mapa enfoca; los recuentos salen de
  `inferProvinceIdFromText` en build time, porque un extent es un rectángulo y se come las
  provincias vecinas.
- Lo de que el código se programó con ayuda de IA va en **una línea, al final**. Arriba, hace
  que se lea el directorio entero como salida de un modelo.
- El aviso por ficha va **arriba del cuerpo del modal**, no colgando del título "Colaborar"
  (donde se leía como una advertencia sobre colaborar), y **no** se marca en la tarjeta ni en
  el mapa: lo llevarían 570 de 657 y la cuadrícula pasaría a ser un campo de alertas.
- Se dice "pendiente de revisar", nunca "sin verificar" ni "generado por IA" a secas: lo que
  hay detrás es scraping más mapeo de catálogo, y una ficha sin revisar no es una ficha falsa.
- El filtro es `humanValidated` en el sidebar, clave corta `hv` (`?hv=false` = lo que queda por
  revisar, que es la lista de trabajo de un responsable provincial). Funciona sin tocar el
  índice invertido porque el campo ya es un booleano del registro. Los switches **llevan el
  recuento en la etiqueta**: con un 17%, activarlo vacía el directorio y sin el número parece
  que la web se ha roto. Ese recuento se calcula **sobre los filtros activos menos el de
  revisión**, no sobre el dataset entero: con el default `status=active`, un "(568)" medido
  sobre el total no cuadra con los 369 resultados que salen al pulsarlo.

### Las pestañas del modal van por persona

`attend` · `organizers` · `found` · `build`. Antes mezclaban dos ejes —tres pestañas por
herramienta (chatbot, código, agentes) y una por persona— y obligaban a quien llega a
decidir si es una herramienta o una persona. "Construyo con los datos" fusiona código y
agentes porque ahí persona y herramienta son la misma cosa.

- Los chips de ficheros viven **dentro** de esa pestaña, no sobre las pestañas: para quien
  busca una comunidad eran nueve enlaces técnicos ocupando el primer pantallazo.
- En móvil caen los **iconos**, no las etiquetas: "una semilla" no se lee como "quiero
  montar una comunidad". Con el eje de herramienta el icono bastaba; con el de persona, no.
- Los prompts se declaran por pestaña (`ATTEND_PROMPTS`, `ORGANIZER_PROMPTS`,
  `FOUND_PROMPTS`, `BUILD_PROMPTS`) y viven todos en `openData.prompts.*`, plano: mover uno
  de pestaña es mover una cadena de una constante a otra.

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
`[rellena aquí]`. Un hueco que alguien tiene que rellenar a mano es un prompt que no se usa.

Las trampas del dataset (`archivedUrls`, `matchesAllTags`, `geographicScope`, `lastReviewed`,
`humanValidated`) están **una sola vez**, en `openData.prompts.rules`, y cada prompt la
interpola con `{{rules}}`. Repetida en cada prompt se desincronizaba al primer cambio.

**Un prompt no puede prometer lo que el dataset no guarda.** No hay campo que diga quién
busca voluntariado, quién está abierto a colaborar ni quién acoge grupos nuevos: los prompts
que van de eso lo dicen en voz alta y piden el canal para preguntarlo (hay test). Y
`lastReviewed` **no mide actividad**: es la fecha de la última revisión de la ficha, y la
mayoría no se ha vuelto a mirar desde que se añadió.

### `urls` son pares, no una lista fija de plataformas

Forma y valores en `schema.json`; la lógica, en `src/lib/communityUrls.js`. Aquí solo lo que
no se deduce de ninguno de los dos.

**Por qué.** `eventsUrl` era una clave única y en los GDG ya estaba ocupada por el Meetup, así
que no había dónde decir "y además organizan este encuentro anual, aquí". Eso dejó nueve
DevFest sin sitio al cerrar #475.

- **El `kind` se omite cuando el dominio lo delata**, así que una entrada sin `kind` no es una
  entrada sin clasificar. Consecuencia para quien consuma los datos: **un canal se localiza
  por su URL, no sólo por su `kind`**.
- **El mismo `kind` puede repetirse**, y entonces `label` es lo que distingue una entrada de
  otra. Es el caso que motivó el cambio, no una excepción.
- Meetup, Eventbrite y Luma tienen clave propia porque antes competían por `eventsUrl` y
  compartían icono. Para saber dónde publica eventos una comunidad hay que mirar **toda la
  familia**, no una clave.
- `URL_KINDS` es la **única** lista de plataformas. Añadir una son dos sitios: esa constante y
  su clave en los dos locales. `ALLOWED_URL_KEYS` y `URL_PLATFORM_OPTIONS` se derivan de ella
  a propósito: mantenidas a mano se quedaron atrás en cuanto llegó Meetup, y el síntoma fue
  que el alta asistida tiraba en silencio una URL que el propio `schema.json` le había
  ofrecido al modelo.

#### Por qué la migración fue un script

Eran 510 fichas: una migración a ojo pierde información sin que nadie se entere hasta meses
después. El script comprueba ficha a ficha que la conversión es **reversible** antes de
escribir, y aborta entero si una sola no cuadra. El mismo ida y vuelta corre como test sobre
el dataset completo, así que la garantía no caduca con el script.

El formato antiguo (objeto `{ clave: url }`) se sigue **leyendo**: es lo que traen los issues
abiertos antes del cambio y los borradores a medias en `localStorage`.

#### El formulario: una fila por canal

El formulario edita **la misma lista que se guarda**. Lo que no es evidente leyendo el
componente:

- El campo "¿qué es?" hace dos trabajos con un control, y poder elegir plataforma **no es
  cosmético**: hay kinds que no se infieren nunca por dominio. Sin poder elegirlos, alguien
  guardaría su feed OTE como etiqueta libre, sin `kind`, y la sección de próximos eventos de
  su ficha se apagaría en silencio. Por eso esa decisión es una función pura con test
  (`resolveKindOrLabelInput`) y no lógica dentro del componente: el fallo que importa no da
  error, da una ficha que parece correcta.
- El desplegable es propio porque el `<datalist>` nativo no admite ni grupos ni iconos, y la
  lista ya no se lee de un vistazo. Dentro de Eventos, las plataformas concretas van antes que
  el genérico: con "Eventos" encabezando el grupo, quien tenía un Meetup elegía el genérico
  por orden de aparición. `hintKey` existe porque filtrar "even" devuelve cuatro etiquetas
  casi iguales.
- El panel dice en su pie que se puede escribir un nombre propio. Sin eso, algo con aspecto de
  lista cerrada esconde la mitad de lo que el campo hace.
- **Todos** los caminos que siembran el borrador pasan por `toUrlRows`, y por eso vive en
  `communityUrls.js`. Cuando uno no lo hacía, las filas quedaban sin identidad y quitar un
  canal **borraba todos los demás**.
- `urlExtras` fue el andamio de cuando el formulario aún no editaba pares. Ya no existe en el
  borrador; sólo se lee al recuperar uno de entonces.

#### Los grupos de la ficha: un canal, un clic

- Un grupo con **un solo canal se pinta como enlace**, no como desplegable: abrirlo para elegir
  la única opción son dos clics para llegar al mismo sitio (LechazoConf → Chat → Telegram). Y
  entonces lo que se enseña es la etiqueta del canal ("Telegram"), no la del grupo ("Chat"):
  importa a dónde lleva el clic, no en qué cajón lo hemos guardado. La decisión es una función
  pura con test (`resolveUrlGroupDisplay`).
- La URL principal entra en ese reparto como un canal más del grupo "Comunidad" cuando no está
  ya entre las entradas, así que **cuenta para decidir si el grupo es uno o varios**. Y para
  que pueda entrar hace falta `withEmptyUrlGroups`: `groupUrlEntries` descarta los grupos
  vacíos, y con el grupo "Comunidad" filtrado la URL principal no se pintaba en ninguna parte
  de la ficha (a LechazoConf le faltaba su web).

### Slugs

`slugifyCommunityName` existe en `scripts/lib/communities-store.js` y en
`src/lib/communitySubmission.js`, y **deben** producir el mismo resultado: los deep links por
slug dependen de esa equivalencia. Hay un test que lo verifica
(`tests/communitiesStore.test.js`).

---

## La revalidación al volver a la pestaña es silenciosa

Volver a la pestaña vuelve a pedir `communities.json` para no quedarse con datos viejos. Eso
**no se anuncia**: la comprobación no pinta nada y no bloquea la lectura. Toda la decisión está
en `src/lib/freshness.js` (`shouldRevalidateFreshData`, función pura con test).

- Antes la comprobación bloqueaba el detalle: mientras corría, la **ficha abierta se cerraba** y
  en su hueco aparecía un aviso que empujaba el contenido. Un alt-tab bastaba para perder lo que
  estabas leyendo, y el aviso ni se llegaba a leer.
- Lo que sí espera a confirmar la última versión es **solo la edición**: una propuesta construida
  sobre datos viejos pisa cambios de otra persona. Leer una ficha diez minutos desactualizada no
  hace daño a nadie.
- Si la revalidación falla, el aviso sale **en el formulario**, con un botón de reintentar, no en
  el listado de quien solo venía a mirar.
- Hay un **throttle** (`FRESH_DATA_MIN_INTERVAL_MS`): sin él, cinco alt-tab eran cinco descargas
  del dataset completo. No aplica cuando nunca se llegó a confirmar la versión, porque reintentar
  es justo lo que desbloquea la edición.
- Con el formulario abierto no se revalida: recargar movería el suelo bajo lo que se está
  escribiendo.

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
