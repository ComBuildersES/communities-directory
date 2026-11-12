# Datos abiertos del directorio

Todos los datos de este directorio son abiertos y están publicados bajo
[CC BY 4.0](../DATA_LICENSE.md). Esta página explica dónde está cada cosa, en qué formato y
qué significa cada campo.

## Si solo quieres descargar los datos

Los ficheros publicados se sirven desde la propia app, listos para consumir:

| Fichero | Contenido |
| --- | --- |
| [`communities.json`](https://directory.communitybuilders.dev/data/communities.json) | Todas las comunidades del directorio, en un array JSON |
| [`communities.geojson`](https://directory.communitybuilders.dev/data/communities.geojson) | Las comunidades con ubicación (presenciales e híbridas), como `FeatureCollection` GeoJSON |
| [`deleted-communities.json`](https://directory.communitybuilders.dev/data/deleted-communities.json) | Bajas del directorio, con su motivo |
| [`tags.json`](https://directory.communitybuilders.dev/data/tags.json) | Taxonomía de etiquetas temáticas (`id`, `label`, `description`, `category`, `synonyms`) |
| [`audience.json`](https://directory.communitybuilders.dev/data/audience.json) | Perfiles de público objetivo |
| [`communities.csv`](https://directory.communitybuilders.dev/data/communities.csv) | Las comunidades como tabla plana, una fila por comunidad (arrays separados por `\|`) |
| [`schema.json`](https://directory.communitybuilders.dev/data/schema.json) | Diccionario de datos: JSON Schema con qué significa cada campo y cada valor de enum |
| [`coverage.json`](https://directory.communitybuilders.dev/data/coverage.json) | Qué parte del dataset ha revisado una persona, y cuántas fichas traen cada campo poco relleno |

Las etiquetas y los perfiles también están traducidos al inglés en
[`tags.en.json`](https://directory.communitybuilders.dev/data/tags.en.json) y
[`audience.en.json`](https://directory.communitybuilders.dev/data/audience.en.json).

Las claves `tags` y `targetAudience` de cada comunidad son **IDs** que referencian esos dos
catálogos: para mostrar etiquetas legibles hay que cruzarlas con `tags.json` / `audience.json`.

## Cómo se hacen estos datos

Conviene decirlo antes de que nadie construya nada encima, porque cambia cómo se leen los
campos:

1. **Las comunidades las ha añadido gente**, una a una, a lo largo del tiempo. Ninguna la ha
   creado una máquina a partir de un volcado.
2. **El etiquetado mínimo lo puso un proceso semiautomático**: temáticas, enlaces por
   plataforma y estado. Era la única forma de que 600+ comunidades fuesen buscables sin esperar
   a que alguien las clasificase a mano. Esas llevan `humanValidated: false`.
3. **La revisión completa va comunidad por comunidad**, y es donde estamos ahora. Una persona
   abre la comunidad, comprueba cada campo contra las fuentes y la corrige. Entonces pasa a
   `humanValidated: true`.

Así que una comunidad sin revisar no es una comunidad inventada: es una comunidad con un
etiquetado que nadie ha confirmado. Si presentas estos datos a otras personas, la distinción
importa, y por eso el campo viaja en el dataset en vez de quedarse en una nota al pie.

**El porcentaje que publicamos es el de las comunidades activas**, no el del dataset entero.
Repasar una comunidad que ya no organiza nada no mejora lo que alguien va a consultar hoy, así
que medir sobre el total castigaría el esfuerzo sin que sirva de nada. Los dos recuentos están
en [`coverage.json`](https://directory.communitybuilders.dev/data/coverage.json) (`active` y el
bloque raíz), se regeneran en cada despliegue, y el de activas es lo que muestra la barra de
progreso del popover "Sobre el proyecto" de la web.

En el directorio se puede filtrar: `?s=active&hv=true` deja solo las activas revisadas y
`?s=active&hv=false` solo las activas pendientes — que es, de paso, la lista de trabajo de quien
quiera echar una mano. Con que cada persona que pasa por el directorio repase una, esto se
cierra rápido.

El **código** de la aplicación también se ha programado en buena parte con ayuda de IA,
revisado por personas antes de cada despliegue, y está publicado entero.

## Si quieres corregir o añadir datos

La fuente de verdad **no** son los ficheros anteriores: son un fichero JSON por comunidad en el
repositorio.

| Directorio | Contenido |
| --- | --- |
| [`data/communities/`](https://github.com/ComBuildersES/communities-directory/tree/master/data/communities) | Una comunidad por fichero, `<slug>.json` |
| [`data/deleted-communities/`](https://github.com/ComBuildersES/communities-directory/tree/master/data/deleted-communities) | Una baja por fichero |
| [`public/data/tags.json`](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/tags.json) · [`audience.json`](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/audience.json) | Las taxonomías, editables directamente |

`communities.json`, `communities.geojson` y `deleted-communities.json` son **artefactos
generados** a partir de esos ficheros y están gitignorados: no aparecen en el repositorio y no
tiene sentido editarlos (los cambios se perderían en el siguiente build).

El motivo de un fichero por comunidad es el conflicto de merge: con las 650+ comunidades en un
único JSON, dos propuestas simultáneas tocaban las mismas líneas y chocaban siempre.

Para regenerar los artefactos en local:

```bash
npm install
npm run compile-communities   # escribe public/data/communities.json y .geojson
npm run validate-data         # valida el dataset completo
```

La forma más cómoda de proponer un cambio no es editar JSON a mano, sino el
[formulario del directorio](https://directory.communitybuilders.dev/): genera un issue con los
datos ya estructurados, y de ahí sale una PR automática. Ver
[CONTRIBUTING.md](../CONTRIBUTING.md).

## Qué campos tiene una comunidad

```js
{
  id: number | null,            // null mientras la propuesta no se ha publicado
  name: string,
  status: "active" | "inactive" | "unknown" | "merged",
  lastReviewed: "DD/MM/YYYY",   // última revisión humana de la ficha
  communityType: "tech-meetup" | "conference" | "umbrella-org" | "hacklab"
               | "collaborative-group" | "meta-community" | "mutual-aid",
  eventFormat: "in-person" | "online" | "hybrid" | "unknown",
  location: string,             // dónde ocurren sus eventos
  geographicScope: "unknown" | "local" | "provincial" | "regional"
                 | "national" | "international",   // a qué territorio da servicio
  shortDescription: string,
  topics: string,               // texto libre heredado, separado por comas
  langs: string[],              // "es", "en", "ca", "eu", "gl", "oc"
  tags: string[],               // IDs de tags.json
  targetAudience: string[],     // IDs de audience.json
  matchesAllTags?: boolean,     // comunidad generalista: encaja con cualquier filtro de tags
  matchesAllAudience?: boolean, // idem para cualquier perfil de público
  contactInfo: string,          // email público
  communityUrl: string,         // URL principal
  urls: { web?, eventsUrl?, blog?, rss?, github?, discord?, telegram?, ... },
  archivedUrls?: string[],      // canales que la comunidad ya no atiende; no se muestran
  parentId?: number | null,     // organización paraguas a la que pertenece
  mergedIntoId?: number | null, // solo con status "merged": comunidad en la que continúa
  thumbnailUrl: string,
  latLon: { lat: number | null, lon: number | null },
  displayOnMap: boolean,
  humanValidated: boolean       // false = datos enriquecidos automáticamente, sin revisar
}
```

Dos avisos sobre la calidad del dato, por si construyes algo encima:

- `humanValidated: false` significa que el etiquetado de esa comunidad lo puso un proceso
  semiautomático y nadie lo ha repasado. Cuántas hay en cada estado, en
  [`coverage.json`](https://directory.communitybuilders.dev/data/coverage.json).
- `status: "inactive"` no se borra: las comunidades que dejaron de organizar eventos siguen en
  el directorio, porque forman parte de la historia del ecosistema y pueden reactivarse.
- `status: "merged"` es otra cosa: la comunidad dejó de existir por separado porque se fusionó
  con otras (Makers of Murcia, GameDev Murcia y murcia dev pasaron a ser MurciaTech). No la
  recomiendes: su actividad continúa en la comunidad que indica `mergedIntoId`. Tampoco es
  `parentId`, donde la comunidad local y su organización paraguas siguen existiendo las dos.
  La cara inversa ("qué comunidades se fusionaron en esta") no se guarda: se deriva buscando
  las fichas cuyo `mergedIntoId` apunta a ese id.

`urls` solo trae las claves con valor. La lista canónica de plataformas está en
`URL_PLATFORM_OPTIONS` ([`src/lib/communitySubmission.js`](https://github.com/ComBuildersES/communities-directory/blob/master/src/lib/communitySubmission.js));
no existe una clave por plataforma de eventos (Meetup, Eventbrite, Luma…): esas URLs van en
`eventsUrl`.

## Eventos

El directorio **no** almacena eventos. Cuando una comunidad publica un feed en formato
[Open Tech Events](https://opentechevents.org/), su URL está en `urls.ote` y la ficha lo lee en
caliente al abrirse. Para consumir eventos, ese feed es la fuente; `urls.eventosWiki` apunta a
la página de la comunidad en [eventos.wiki](https://eventos.wiki/).

## Si quieres usar los datos con IA o con un agente

Los datos están pensados para que un modelo o un agente los lea sin tener que rastrear la web.
La app es una SPA que renderiza en cliente: rastrear el HTML da mucha peor información que
leer estos ficheros, que se regeneran en cada despliegue.

| Fichero | Para qué |
| --- | --- |
| [`llms.txt`](https://directory.communitybuilders.dev/llms.txt) | Punto de entrada siguiendo la convención de [llmstxt.org](https://llmstxt.org/): qué ficheros hay, qué contiene cada uno y las reglas para interpretar un registro sin equivocarse |
| [`llms-full.txt`](https://directory.communitybuilders.dev/llms-full.txt) | El directorio entero en Markdown, una sección por comunidad, con tags y público ya resueltos a etiquetas legibles |
| [`schema.json`](https://directory.communitybuilders.dev/data/schema.json) | El significado de cada campo, en JSON Schema |
| [`robots.txt`](https://directory.communitybuilders.dev/robots.txt) | Política de rastreo: todos los crawlers, los de IA incluidos, son bienvenidos |
| [`sitemap.xml`](https://directory.communitybuilders.dev/sitemap.xml) | Un deep link por comunidad activa, en los dos idiomas |

El botón **Datos abiertos + IA** de la cabecera del directorio lleva a lo mismo con prompts
listos para copiar, ejemplos de código e instrucciones para pegar en el contexto de un agente.

No hay servidor MCP y no hace falta: los datos son ficheros estáticos públicos servidos con
CORS abierto, así que cualquier agente con acceso a la red los lee directamente.

Los cinco artefactos los genera `npm run generate-llm-artifacts`
([`scripts/generate-llm-artifacts.js`](https://github.com/ComBuildersES/communities-directory/blob/master/scripts/generate-llm-artifacts.js))
a partir de la fuente de verdad, dentro de `npm run build`. Como el resto de artefactos, están
gitignorados: no se editan a mano.

## Licencia y atribución

Datos bajo [CC BY 4.0](../DATA_LICENSE.md): puedes copiarlos, redistribuirlos y construir
encima, también con fines comerciales, citando a **Community Builders** y, a poder ser,
enlazando a <https://directory.communitybuilders.dev/>.

El código de la app está bajo [Apache 2.0](../LICENSE).
