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

Las etiquetas y los perfiles también están traducidos al inglés en
[`tags.en.json`](https://directory.communitybuilders.dev/data/tags.en.json) y
[`audience.en.json`](https://directory.communitybuilders.dev/data/audience.en.json).

Las claves `tags` y `targetAudience` de cada comunidad son **IDs** que referencian esos dos
catálogos: para mostrar etiquetas legibles hay que cruzarlas con `tags.json` / `audience.json`.

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
  status: "active" | "inactive" | "unknown",
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
  thumbnailUrl: string,
  latLon: { lat: number | null, lon: number | null },
  displayOnMap: boolean,
  humanValidated: boolean       // false = datos enriquecidos automáticamente, sin revisar
}
```

Dos avisos sobre la calidad del dato, por si construyes algo encima:

- `humanValidated: false` significa que la ficha viene de scraping y nadie la ha revisado.
- `status: "inactive"` no se borra: las comunidades que dejaron de organizar eventos siguen en
  el directorio, porque forman parte de la historia del ecosistema y pueden reactivarse.

`urls` solo trae las claves con valor. La lista canónica de plataformas está en
`URL_PLATFORM_OPTIONS` ([`src/lib/communitySubmission.js`](https://github.com/ComBuildersES/communities-directory/blob/master/src/lib/communitySubmission.js));
no existe una clave por plataforma de eventos (Meetup, Eventbrite, Luma…): esas URLs van en
`eventsUrl`.

## Eventos

El directorio **no** almacena eventos. Cuando una comunidad publica un feed en formato
[Open Tech Events](https://opentechevents.org/), su URL está en `urls.ote` y la ficha lo lee en
caliente al abrirse. Para consumir eventos, ese feed es la fuente; `urls.eventosWiki` apunta a
la página de la comunidad en [eventos.wiki](https://eventos.wiki/).

## Licencia y atribución

Datos bajo [CC BY 4.0](../DATA_LICENSE.md): puedes copiarlos, redistribuirlos y construir
encima, también con fines comerciales, citando a **Community Builders** y, a poder ser,
enlazando a <https://directory.communitybuilders.dev/>.

El código de la app está bajo [Apache 2.0](../LICENSE).
