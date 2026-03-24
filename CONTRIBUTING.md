# Guía de contribución

¡Gracias por tu interés en contribuir! Este es un proyecto colaborativo y abierto. Puedes ayudar de muchas maneras, desde añadir nuevas comunidades hasta mejorar la web o el flujo automatizado.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Índice

- [Cómo nos organizamos](#c%C3%B3mo-nos-organizamos)
- [Cómo contribuir](#c%C3%B3mo-contribuir)
- [Revisión y mejora de datos](#revisi%C3%B3n-y-mejora-de-datos)
    - [Formas de contribuir a los datos](#formas-de-contribuir-a-los-datos)
    - [Convenciones de datos](#convenciones-de-datos)
      - [Qué comunidades tienen cabida en el repo](#qu%C3%A9-comunidades-tienen-cabida-en-el-repo)
      - [Campo `communityType` (taxonomía de comunidades)](#campo-communitytype-taxonom%C3%ADa-de-comunidades)
      - [Campo `status` (estado de las comunidades)](#campo-status-estado-de-las-comunidades)
      - [Campo `eventFormat` (formato de eventos)](#campo-eventformat-formato-de-eventos)
      - [Quién revisa los datos](#qui%C3%A9n-revisa-los-datos)
    - [Estructura de los datos](#estructura-de-los-datos)
    - [Utilidades](#utilidades)
- [Mejorar el código o la web](#mejorar-el-c%C3%B3digo-o-la-web)
  - [Configuración del entorno de desarrollo](#configuraci%C3%B3n-del-entorno-de-desarrollo)
  - [Ejecutar el repo en local](#ejecutar-el-repo-en-local)
  - [Linting y estilo](#linting-y-estilo)
  - [Automatismos](#automatismos)
    - [Crear PR tras añadir comunidades](#crear-pr-tras-a%C3%B1adir-comunidades)
    - [Despliegue tras merge en master](#despliegue-tras-merge-en-master)
  - [Cómo contribuir con código](#c%C3%B3mo-contribuir-con-c%C3%B3digo)
  - [Estilo de commits](#estilo-de-commits)
- [Dudas](#dudas)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Cómo nos organizamos

- Usamos **[issues](https://github.com/ComBuildersES/communities-directory/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen)** para proponer mejoras, reportar errores, sugerir nuevas comunidades, etc.
- Los **[milestones](https://github.com/ComBuildersES/communities-directory/milestones)** nos ayudan a agrupar los issues por objetivos ("releases").

## Cómo contribuir

Hay muchas maneras de participar, tanto si sabes programar como si no. Aquí van algunas ideas:

> **Nota**: se incluye, entre corchetes, los "[Emojikeys](https://github.com/ComBuildersES/communities-directory/issues/22)" asociados a cada tipo de contribución.

1. **Revisión y mejora de datos** [`🔣 data`, `👀 review`]
    - Proponer una nueva comunidad desde la web del directorio, usando el formulario integrado que genera el issue en GitHub automáticamente.
    - Corregir o validar una comunidad existente desde la propia web, abriendo el formulario precargado para edición.
    - Avisar si se encuentran errores, comunidades duplicadas o datos desactualizados.
    - Revisar datos -> [Buscamos responsables (por provincia) para mantener los datos actualizados](https://github.com/ComBuildersES/communities-directory/issues/53).
    - Sugerir nuevas categorías o campos útiles para describir mejor cada comunidad.
        
1. **Mejorar el código o la web** [`💻 code`, `🎨 design`, `⚠️ test`, ♿️ `a11y`, `👀 review`, `🧑‍🏫 mentoring`]
    - Frontend / estilos.
    - Accesibilidad (`a11y`), navegación o UX, ...
    - Arreglar bugs.
    - Escribir y mejorar tests.
    - Revisar código.
    - Mentorizar a otras personas que contribuyen.
        
1. **Proponer ideas de mejora** [`🤔 ideas`]
    - Formas de darle más visibilidad al proyecto.
    - Nuevas funcionalidades o formas de explorar comunidades.
    - Cambios en el flujo de contribución (o [automatismos](#automatismos)).

1. **Participar en conversaciones y debates** [`🗣️ talk`]
    - Preguntar, responder dudas, aportar experiencia o comentar propuestas en los [_issues_](https://github.com/ComBuildersES/communities-directory/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen).

1. **Dar visibilidad al proyecto** [`📣 promotion`, `📹 video`, `📝 blog`, `📢 talk`, `🔊 🔊`]
    - Escribir artículos, grabar vídeos, hacer charlas o podcasts.
    - Mencionar el proyecto en comunidades o redes.
    - Organizar o participar en eventos.

1. **Mejorar la documentación** [`📖 doc`]
    - Redactar o aclarar guías como esta.
    - Añadir ejemplos, capturas, referencias o esquemas.

1. **Reportar errores o bugs** [`🐛 bug`]
    - Ya sea en la web, en el fichero JSON o en los flujos automáticos.
        
1. **Ayudar a gestionar el proyecto** [`📆 projectManagement`]
    - Definir roadmap y priorizar tareas.     
    - Organizar _issues_ y _milestones_.
    - Identificar mejoras transversales.

1. **Internacionalizar el proyecto** [`🌍 translation`]
    - Traducir la interfaz o documentación.
    - Preparar el terreno para ampliar a otros países.
    - Adaptar el lenguaje para una comunidad global.
    
---

## Revisión y mejora de datos

> *Es la forma más sencilla de empezar a contribuir, y sin necesidad de conocimientos técnicos.*

El núcleo del proyecto es el fichero [communities.json](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.json), donde se almacenan los datos de todas las comunidades. 

#### Formas de contribuir a los datos

Puedes colaborar con los datos de varias formas:

- Uniéndote a [las personas que quieran ayudar a mantener las comunidades de cada provincia](https://github.com/ComBuildersES/communities-directory/issues/53).
- Añadiendo comunidades o mejorando los datos de las existentes:
   - Desde la web del directorio, usando el formulario guiado para altas nuevas o ediciones de comunidades ya existentes.
   - Desde la web de GitHub, edita directamente [communities.json](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.json) y envía un PR.
   - Creando un _issue_ para propuestas más abiertas: correcciones, mejoras, comunidades a eliminar, normalización de campos, sugerencias sobre etiquetas, etc.
- Sugiendo mejoras en la [estructura da datos](#estructura-de-datos).
- Buscando formas de mejorar el procesamiento automatizado y validación  de datos (normalización de nombres, detección de duplicados...).
- Aportando al debate de cómo mejorar [las convenciones establecidas](https://github.com/ComBuildersES/communities-directory/issues/63).

#### Asignación automática de issues y PRs

Los issues de alta o edición de comunidades creados desde la web intentan inferir automáticamente una `provinceId` a partir del campo `location`.

- La lista viva de responsables por provincia está en [`.github/community-owners.yml`](./.github/community-owners.yml).
- Ese fichero es la fuente de verdad para automatizar asignaciones; el issue [#53](https://github.com/ComBuildersES/communities-directory/issues/53) se mantiene como punto de coordinación para que nuevas personas se ofrezcan voluntarias.
- Cuando una persona se ofrece para una zona, hay que actualizar también `community-owners.yml` para que la automatización la tenga en cuenta.
- Al abrir un issue de comunidad, se asigna automáticamente a las personas responsables de esa provincia.
- Cuando ese issue genera una PR automática, la PR se asigna a las mismas personas y además se les solicita revisión.
- Si no se puede resolver la provincia o no hay responsables configurados para esa provincia, se asigna a `@hhkaos` y `@alvarosaugar` y se añade la etiqueta `needs-area-owner`.

#### Convenciones de datos

##### Qué comunidades tienen cabida en el repo

Cualquier comunidad tech (que gire en torno a la informática, software, hardware, datos, ...), aunque es cierto que a veces hay comunidades que pueden generar dudas, por eso hemos [abierto este issue al respecto](https://github.com/ComBuildersES/communities-directory/issues/62).

##### Campo `communityType` (taxonomía de comunidades)

Actualmente estos son los diferentes tipos de comunidades:

|Tipo de comunidad|Definición. ¿Qué caracteriza a este tipo de comunidad?|Ejemplos|
|---|---|---|
|Tech Meetup|Realiza encuentros periódicos (presenciales u online) normalmente varios al año, con el objetivo de compartir conocimientos en formato charla. Los eventos rara vez llegan a las 100 personas. Cuando son en presencial, suelen finalizar organizando un networking|[Arcasiles Community Madrid](https://www.linkedin.com/company/arcasilesgroup/), [Azure Malaga](https://www.meetup.com/azuremalaga/), [PyData Granada](https://linksta.cc/@PyDataGRX) / [Madrid](https://www.meetup.com/PyData-Madrid/), [Madrid JUG](https://www.meetup.com/es-ES/madridjug/)...
|Conferencia|Encuentro normalmente anual, en el que se reunen muchas personas y hay varios ponentes. Puede haber múltiples tracks en pararlelo y normalmente la logística es más compleja|[CommitConf](https://www.commit-conf.com/), [Codemotion](https://conferences.codemotion.com/madrid2024/), [CodeRioja](https://www.coderioja.com/)
|Organización paraguas|Es un tipo de organización que agrupa a múltiples comunidades. Esta comunidades normalmente son locales, comparten una marca, un propósito, y la organización paraguas dan apoyo a las nuevas comunidades con recursos, manuales, presentación y a veces financiación|[Python España](https://es.python.org/), [GDG Spain](https://gdg.es/), [PyData](https://pydata.org/), [OWASP](https://owasp.org/chapters/)...
|Hacklab|O FabLab, es un un tipo de comunidad normalmente más vinculada al movimiento maker. Normalmente cuenta con un espacio físico, cedido, alquilado o propiedad de la comunidad donde se encuentran recursos hardware y donde la comunidad se reúne|[Makespace Madrid](https://makespacemadrid.org/), [Made Makerspace](https://www.made-bcn.org/en), [La Jaquería](https://lajaqueria.org/)...
|Grupo colaborativo|Personas que se organizar para colaborar **en diferentes proyectos de interés común**. Puede ser organización de charlas, conferencias, desarrollo de proyectos, escribir artículos de blog, ofrecerse ayuda mutua, ... o todas ellas a la vez|[Step4ward](https://step4ward.es/), [Adopta un Junior](https://adoptaunjunior.es/), [AtlanTICs](https://asociacionatlantics.org/)...
|Meta comunidad|Es una organización que agrupa a personas que representan/dinamizan otras comunidades para colaborar en uno o varios proyectos de interés común|[Community Builders](https://github.com/ComBuildersES), [Granada Tech](https://www.granadatech.org/), [Vigo Tech Alliance](https://vigotech.org/)...
|Grupo de ayuda mutua|Se caracteriza porque el objetivo principal es ayudarse mutuamente. Si una persona tiene un problema, tiene un mecanismo de contacto a través del cual contactar con el resto de personas de la comunidad y pedir ayuda. Los canales pueden ser foros, listas de correo, canales de mensajería instantánea, etc.|[BCN Engineering](https://bcneng.org/), [Midudev Discord](https://discord.com/invite/midudev), [Sysarmy Galicia](https://www.sysarmygalicia.com/), [TechShessions](https://techshessions.com/)...

¿Puede una comunidad ser etiquetada con dos tipos de comunidades? Actualmente no, aunque [este aspecto y la propia taxonomía está siendo revisada](https://github.com/ComBuildersES/communities-directory/issues/63).

##### Campo `status` (estado de las comunidades)

Actualmente usamos tres tipos:

* **Activa**: si hay personas activas dinamizando y han estado haciendo cosas "recientemente"
* **Inactiva**: 
  * En el caso de Meetups se considera inactiva si lleva más de un año sin actividad
  * En el caso de Conferencias más de la cadencia habitual (dependiendo el histórico), si es una Conferencia nueva, si lleva dos años o más sin convocarse.
* **Desconocido**: si no lo tenemos claro

> **Nota** [esto está siendo revisado](https://github.com/ComBuildersES/communities-directory/issues/63).

##### Campo `eventFormat` (formato de eventos)

* **Presencial**: comunidades que tienen encuentros presenciales con cierta periodicidad y **no suelen retransmitir sus eventos en directo**.
* **Online**: comunidades cuyo foco de la actividad es principalmente online.
* **Híbridos**: comunidades que celebran encuentros presenciales con cierta periodicidad y que **suelen retransmitir sus eventos**.
* **Desconocido**: no tenemos muy claro sus dinámicas

> **Nota** [esto está siendo revisado](https://github.com/ComBuildersES/communities-directory/issues/63).

##### Quién revisa los datos

Tenemos una lista de personas voluntarias que se encargan de revisar issues y PRs de comunidades por provincia.

- La fuente principal para la automatización es [`.github/community-owners.yml`](./.github/community-owners.yml).
- El issue [#53](https://github.com/ComBuildersES/communities-directory/issues/53) sigue siendo el lugar donde coordinar nuevas incorporaciones o cambios en el reparto.

> **Nota**: cada vez que llegue un PR asignaremos a todas las personas que correspondan, y daremos un par de días de plazo para revisarlos, pasados esos días, si no ha habido ninguna pega procederemos a mergear.

#### Estructura de los datos

> **Referencia técnica para desarrolladores.** Si quieres añadir o editar una comunidad, usa el [formulario web del directorio](https://combuilderses.github.io/communities-directory/), que guía el proceso y genera el issue automáticamente. Los valores válidos de los enums (`status`, `communityType`, `eventFormat`) están disponibles en el propio formulario; los que se documentan aquí incluyen matices adicionales que no caben en un desplegable.

El fichero [communities.json](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.json) es un array donde cada comunidad es un objeto con la siguiente estructura:

```json
{
  "id": <integer-autoincrement>,
  "name": "<community name>",
  "status": "<enum>",
  "lastReviewed": "dd/mm/yyyy",
  "communityType": "<enum>",
  "eventFormat": "<enum>",
  "location": "<postal address>",
  "topics": "<comma separated values>",
  "tags": ["<tag-id>", "..."],
  "targetAudience": ["<audience-id>", "..."],
  "contactInfo": "<email, contact form, ...>",
  "communityUrl": "<absolute URL>",
  "urls": {
    "web": "<absolute URL or omit>",
    "eventsUrl": "<absolute URL or omit>",
    "linkedin": "<absolute URL or omit>",
    "twitter": "<absolute URL or omit>",
    "instagram": "<absolute URL or omit>",
    "youtube": "<absolute URL or omit>",
    "discord": "<absolute URL or omit>",
    "telegram": "<absolute URL or omit>",
    "github": "<absolute URL or omit>",
    "mastodon": "<absolute URL or omit>",
    "bluesky": "<absolute URL or omit>",
    "linkAggregator": "<absolute URL or omit>",
    "mailingList": "<absolute URL or omit>",
    "facebook": "<absolute URL or omit>"
  },
  "thumbnailUrl": "images/<slugify-name>.webp",
  "latLon": {
    "lat": <float or null>,
    "lon": <float or null>
  },
  "displayOnMap": <true or false>,
  "humanValidated": <true or false>
},
```

- **id** _(*)_: Identificador (autoincremental, gestionado por `ensure-id-autoincrement`)
- **name** _(*)_: Nombre de la comunidad.
- **status** _(*)_: Estado en el que se encuentra la comunidad (ver [Campo `status`](#campo-status-estado-de-las-comunidades)).
- **lastReviewed** _(*)_: Última fecha en la que alguien modificó o validó los datos (`dd/mm/yyyy`).
- **communityType** _(*)_: Tipo de comunidad (ver [Campo `communityType`](#campo-communitytype-taxonomía-de-comunidades)).
- **eventFormat** _(*)_: Formato de eventos (ver [Campo `eventFormat`](#campo-eventformat-formato-de-eventos)).
- **location**: Ciudad o región principal en formato `Ciudad` o `Ciudad, País`. Para comunidades sin ubicación fija: `Itinerante`. Para organizaciones paraguas: `n/a`. Solo para comunidades presenciales o híbridas.
- **topics**: Lista de temáticas en texto libre separada por comas (campo heredado, [ver issue](https://github.com/ComBuildersES/communities-directory/issues/6)).
- **tags**: Array de IDs de etiquetas temáticas definidas en [`public/data/tags.json`](../public/data/tags.json). Ejemplo: `["python", "data-science", "machine-learning"]`.
- **targetAudience**: Array de IDs de perfiles de público objetivo definidos en [`public/data/audience.json`](../public/data/audience.json). Ejemplo: `["data-scientist", "ml-engineer"]`.
- **contactInfo**: Email o URL de contacto.
- **communityUrl** _(*)_: URL principal de la comunidad. Se usa como enlace en la tarjeta y en el mapa. Preferencia: web propia > plataforma más activa.
- **urls**: Objeto con URLs adicionales por plataforma. Solo incluir las claves que tengan valor. Claves principales: `web`, `eventsUrl` (Meetup, Lu.ma, etc.), `linkedin`, `twitter`, `instagram`, `youtube`, `discord`, `telegram`, `github`, `mastodon`, `bluesky`. Claves menos comunes: `linkAggregator`, `mailingList`, `facebook`.
- **thumbnailUrl** _(*)_: Ruta relativa a la imagen de la comunidad (`images/<slug>.webp`). El fondo de la web es blanco.
- **latLon**: Coordenadas geográficas para comunidades presenciales o híbridas. Si ya hay comunidades en esa ciudad, usar las mismas coordenadas. Si no aplica: `{ "lat": null, "lon": null }`.
- **displayOnMap**: `true` para comunidades presenciales o híbridas.
- **humanValidated**: `true` si los datos han sido revisados por una persona. `false` indica que fueron enriquecidos automáticamente por el scraper y están pendientes de validación humana.

> _(*): Campos obligatorios_

#### Utilidades

Scripts de mantenimiento del dataset, agrupados por caso de uso.

##### Validación e integridad

Útiles antes de hacer un PR o al revisar contribuciones:

* `npm run validate-data`: valida el dataset completo, taxonomías y referencias cruzadas.
* `npm run find-duplicates`: busca comunidades potencialmente duplicadas en el JSON.
* `npm run ensure-id-autoincrement`: reescribe los IDs para asegurar que son consecutivos (ejecutar si se añaden o eliminan entradas manualmente).

##### Salud de URLs

Útiles periódicamente para detectar enlaces caídos o archivados:

* `npm run check-urls`: comprueba la salud de las URLs. Omite dominios que bloquean bots (twitter.com, x.com). Admite `--report <ruta>` para guardar el informe en Markdown.
* `npm run archive-broken-urls`: para cada URL rota del informe, busca un snapshot en [Wayback Machine](https://web.archive.org/) y actualiza `communities.json`. Admite `--dry-run`, `--from-report <ruta>`, `--include-warnings` y `--concurrency <n>`.

Flujo recomendado:

```bash
npm run check-urls -- --report report.txt   # genera el informe
npm run archive-broken-urls -- --dry-run    # previsualiza qué cambiaría
npm run archive-broken-urls                 # aplica los cambios
npm run check-urls -- --report report.txt   # verifica el resultado
```

##### Enriquecimiento de datos

Útiles para mejorar datos de comunidades existentes (tags, URLs de redes sociales, estado):

* `npm run scrape-community-data`: visita las webs de las comunidades con Playwright y extrae redes sociales, tags sugeridos e indicios de estado activo/inactivo. Genera `suggestions.json` para revisión antes de aplicar. Opciones: `--start <n>`, `--end <n>`, `--id <n>`, `--resume`.
* `npm run apply-suggestions`: aplica `suggestions.json` a `communities.json` tras revisión humana. Admite `--dry-run` y `--only-approved`.
* `npm run apply-url-mapping`: aplica el mapeo manual `url-mapping.json` (URLs alternativas curadas). Admite `--dry-run` y `--force-status`.

##### Mapa y GeoJSON

* `npm run process-to-communities-to-geojson`: regenera `communities.geojson` a partir de `communities.json`. Ejecutar tras modificar coordenadas o el campo `displayOnMap`.
* `npm run test-geojson`: abre un visor local para explorar las ubicaciones del GeoJSON.

##### Automatismos (uso interno)

Scripts que usa la automatización de GitHub Actions o que sirven para depurar el flujo de asignación:

* `npm run simulate-community-owner-assignment`: simula la asignación de responsables por provincia a partir de `community-owners.yml`, sin abrir issues ni PRs. Útil para probar cambios en el fichero de propietarios.

---

## Mejorar el código o la web

### Configuración del entorno de desarrollo

Clona el repositorio:

```
git clone https://github.com/ComBuildersES/communities-directory.git
cd communities-directory
```

Instala las dependencias:

```
npm install
```

> **Nota**: Asegúrate de tener Node.js 24 instalado.
> **Nota**: `npm install` deja configurados los hooks locales de Git para validar los datos antes de cada commit.

Ejecutar el entorno local:

```
npm run dev
```

Esto abrirá la aplicación en `http://localhost:5173` por defecto (puede variar según el puerto libre).

### Ejecutar el repo en local

- Para desarrollar en local usa `npm run dev`
  - Los cambios se ven reflejados en tiempo real en el navegador al modificar el código.
- Para probar el build en local usa `npm run build-preview`

### Linting y estilo

- Usamos ESLint con configuración personalizada (`eslint.config.js`) y plugins para React y hooks.
- Ejecuta `npm run lint` para verificar que todo esté bien antes de hacer un PR.

### Validación de datos

- Ejecuta `npm run validate-data` para validar el dataset completo, taxonomías y referencias cruzadas.
- Cada `git commit` lanza automáticamente `npm run validate-data:staged` y bloquea el commit si las comunidades nuevas o modificadas incumplen campos obligatorios, fechas, URLs o taxonomías.
- La comprobación de URLs accesibles no bloquea el `pre-commit`, porque depende de red y puede dar falsos negativos. En su lugar se usa `npm run check-urls` como auditoría específica y se ejecuta también en GitHub Actions.
- El dataset histórico todavía tiene algunas advertencias heredadas; esas advertencias se muestran, pero no bloquean la contribución salvo que introduzcas nuevas inconsistencias.

### Automatismos

#### Crear PR tras añadir comunidades

El flujo principal recomendado es usar el formulario integrado en la web del directorio. Ese formulario abre un issue en GitHub con el JSON propuesto ya preparado para revisión.

Cuando se crea ese issue, se ejecuta [create-community-entry.yml](https://github.com/ComBuildersES/communities-directory/blob/master/.github/workflows/create-community-entry.yml), que:
- Procesa el issue y genera un PR añadiendo o actualizando los datos ([process-community-issue.js](https://github.com/ComBuildersES/communities-directory/blob/master/scripts/process-community-issue.js)).
- Ejecuta [process-to-communities-to-geojson.js](https://github.com/ComBuildersES/communities-directory/blob/master/scripts/process-to-communities-to-geojson.js) que procesa los datos anteriores y actualiza el fichero [communities.geojson](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.geojson) que contiene las comunidades presenciales e híbridas.
- Valida el JSON generado antes de abrir el PR.
- Abre un PR con todos los cambios.

Además, cualquier `pull request` ejecuta de nuevo la validación en GitHub Actions:

- `npm run validate-data` comprueba la integridad global del dataset y de las taxonomías.
- Se valida de forma estricta cualquier comunidad nueva o modificada frente a la rama base del PR.
- Se ejecuta un chequeo no bloqueante de las URLs cambiadas y se sube un informe con warnings y sugerencias de `web.archive.org` cuando haya enlaces caídos o archivados.
- El build vuelve a ejecutarse para evitar que se mergeen cambios que rompan la app.

La creación de issues desde GitHub queda ahora orientada a propuestas abiertas; para altas nuevas la entrada recomendada es el formulario web.

#### Despliegue tras merge en master

Cada push a `master` activa `deploy.yml`, que:
- Instala dependencias
- Genera el sitio con Vite.
- Publica el contenido de `/dist` en GitHub Pages.

###  Cómo contribuir con código

Empieza por crear un fork.

Luego crea una nueva rama:
```
git checkout -b tu-nombre/mejora-o-fix
```

Haz tus cambios y súbelos:
```
git commit -m "feat: mejora en el filtrado por ciudad"
git push origin tu-nombre/mejora-o-fix
```

Y por último abre un Pull Request

Explica brevemente qué has cambiado y si cierra o está relacionado con un issue.

> 💬 Usa el formato `Closes #xx` para vincular el PR al issue correspondiente.

### Estilo de commits

Usamos una convención ligera basada en `type: descripción`. Ejemplos:

```
feat: añadir filtro por ciudad
fix: corregir error al cargar imágenes
docs: mejorar instrucciones en README
```

## Dudas

Usa los issues también para abrir debates, sugerencias, propuestas…  

Nos organizamos y comunicamos abiertamente por allí.
