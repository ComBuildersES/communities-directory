# Community Builders Directory — Agents

## Acuerdos activos de las mejoras de UI

Mientras siga abierto `docs/plan-temporal-mejoras-ui.md`, leer antes de modificar la interfaz los **criterios de aceptación** al principio de `docs/handoff-mejoras-ui.md` y el estado actual del plan. Las correcciones del usuario recogidas allí se aplican a las siguientes entradas; no son solo antecedentes de la primera.

- Usa tu criterio y no corras todos los tests para cualqueir cambios (por ej: para cambios menores de textos, css, etc posiblemente no haga falta)
- **Solo español, en toda la aplicación, hasta terminar todas las fases.** No añadir ni actualizar traducciones inglesas ni capturas inglesas para completar una entrada. La traducción y revisión integral se harán al cierre; conservar las traducciones parciales anteriores.
- **Ayuda visual y breve para perfiles técnicos.** Al explicar un control o flujo, acompañarlo de una captura real, preferentemente reutilizando las existentes: frase breve → captura → acción. No sustituir ese apoyo visual por párrafos explicativos. Para contenido conceptual, adaptar el recurso cuando una captura no aporte; no inventar una pantalla.
- **Evitar explicaciones obvias.** Mostrar posibilidades poco visibles. No explicar recuentos, quitar etiquetas o abrir fichas, ni describir cada opción autoexplicativa. Llevar las aclaraciones específicas a la ayuda contextual del control.
- **Lectura progresiva y espaciado comprobado.** Bloques diferenciados, resúmenes cortos y acordeones para el detalle; pestañas cuando separen recorridos útiles. Comprobar en navegador los márgenes entre párrafos, capturas, selectores, prompts y CTA, también en móvil.
- **Opciones redactadas desde lo que quiere hacer la persona.** Usar acciones concretas en lugar de nombres de roles o valores del dataset: «Dar una charla» en vez de «Ponentes». Ajustar la forma verbal a la frase que introduce las opciones: «Ver comunidades en las que pueda aportar: Dando una charla…». Mantener los IDs técnicos separados de las etiquetas de la guía.
- **Elegir el control según el contenido, sin imponer acordeones.** Para alternativas que solo conducen a una acción, preferir chips consecutivos que admitan varias líneas; evitar un acordeón por opción que solo despliegue otro botón. Reservar los acordeones para detalle que merezca desplegarse. En «Aportar», la solución revisada son siete chips con contador, no los selectores ni los bloques de versiones anteriores.
- **Acciones explícitas y contexto conservado.** Entrar en un recorrido informa, sin aplicar filtros ni abrir herramientas. Pulsar un chip puede aplicar directamente su criterio y llevar a los controles existentes. Conservar los demás filtros y sustituir solo la faceta pertinente. No añadir prosa sobre la mecánica interna de los filtros: el usuario pidió retirar ese aviso de «Aportar».
- **Los contadores deben coincidir con su destino.** Respetar los demás filtros activos e ignorar la selección previa de la faceta que se va a sustituir. Contar declaraciones explícitas una vez por comunidad, excluir fichas ocultas y no inferir propiedades. Mostrar los ceros desactivados. Comprobar que el número del chip coincide con el resultado al pulsarlo.
- **Notas reconocibles y antes de las acciones cuando condicionen su interpretación.** Diferenciarlas con icono, fondo y borde, sin confundirlas con instrucciones o alertas. Para datos nuevos o poco cumplimentados, explicar brevemente su cobertura: ausencia significa desconocimiento, no rechazo. En disponibilidad, conservar que declararla no garantiza convocatoria urgente, C4P ni plaza, y animar a contactar con la comunidad para ofrecerse a participar.
- **Aclaraciones junto al control, con interacción accesible.** Reutilizar `InfoTooltip` para las descripciones y límites, con ratón y foco; Escape debe cerrar primero la ayuda y después el modal. Las acciones equivalentes deben compartir estilo de botón. En «Aportar», «Explorar el mapa» tiene el mismo diseño que «Abrir filtros» y su aclaración de cobertura aparece en el tooltip del propio botón, no en otro párrafo.
- **IA para público técnico.** Prompts ilustrativos, sin instrucciones básicas de copiar/adjuntar, ruido de roadmap, licencia dentro de los prompts ni catálogos duplicados por idioma. Formatos con nombres descriptivos y URL copiable aparte.
- **No prometer lo que los datos no dicen.** Ubicación textual: coincidencia exacta, sin inferir proximidad. Tipos de comunidad: descubrir dinámicas, sin decidir qué tipo conviene a la persona. Disponibilidad declarada: no es una convocatoria ni una plaza garantizada.
- **Una entrada cada vez y pausa para revisión.** Conservar contenido salvo retiradas pedidas por el usuario; sus últimas decisiones prevalecen sobre el inventario inicial. No reabrir la entrada aprobada ni avanzar a otra sin revisión. Conservar el plan hasta la revisión final conjunta.

## Qué es

Directorio interactivo de comunidades tecnológicas españolas. Tiene dos vistas principales: listado de tarjetas y mapa. La prioridad del proyecto es facilitar descubrimiento por temática, formato y ubicación, y mantener un dataset de comunidades razonablemente limpio y enriquecido.

## Stack y piezas clave

- Frontend: React 19 + Vite 5
- Estado: Zustand 5
- Mapas: ArcGIS (`@arcgis/core`, `@arcgis/map-components`)
- Estilos: Bulma por CDN + CSS propio
- Datos principales: `data/communities/` — un fichero JSON por comunidad, **fuente de verdad**
- Taxonomías: `public/data/tags.json`, `public/data/audience.json`
- Tests: Vitest (`npm test`), en `tests/`

## Estructura que importa

- `src/App.jsx`: compone la app, alterna lista/mapa y resuelve el routing por query params
- `src/components/CommunitiesList.jsx` y `CommunityCard.jsx`: grid y tarjeta
- `src/components/CommunityModal/`: ficha ampliada; `OteEvents.jsx` lee el feed de eventos
- `src/components/CommunityContribution/`: formulario de alta, edición y baja
- `src/components/OpenDataModal/`: el modal "Datos abiertos + IA" de la cabecera
- `src/components/Map/`: vista de mapa con clustering
- `src/components/TagSearch/`, `FilterPanel.jsx`, `SideBar.jsx`: búsqueda y filtros
- `src/lib/communitySubmission.js`: payload de propuestas, slugs, routing y filtros en URL
- `src/i18n/`: i18next y los locales `es` / `en`; la URL lleva prefijo de idioma
- `src/stores/community.store.js`: carga de datos, filtros, búsqueda e índice invertido
- `src/stores/sidebar.store.js`: comportamiento responsive del panel lateral
- `scripts/`: mantenimiento y enriquecimiento del dataset; `scripts/lib/` es su API

## Dónde viven los datos

`data/communities/<slug>.json` y `data/deleted-communities/<slug>.json` son la fuente de
verdad. Todo lo que hay en `public/data/` salvo las taxonomías y `communities.meta.json` es un
artefacto generado y gitignorado: `communities.json`, `communities.geojson`,
`deleted-communities.json`, `communities.csv` y `schema.json`. Editarlos no sirve de nada,
el siguiente build los pisa.

Desde un script, nunca leas ni escribas el bundle: usa `readCommunities()` /
`writeCommunities()` de `scripts/lib/communities-store.js`.

El motivo del fichero por comunidad es el conflicto de merge (issue #437): con las 650+
comunidades en un único JSON, dos propuestas simultáneas chocaban siempre.

## Modelo mental de datos

Campos de una comunidad: `id`, `name`, `status`, `hidden`, `lastReviewed`, `communityType`,
`eventFormat`, `location`, `provinceId`, `geographicScope`, `parentId`, `shortDescription`,
`topics`, `langs`, `tags`, `targetAudience`, `matchesAllTags`, `matchesAllAudience`,
`contactInfo`, `communityUrl`, `urls`, `archivedUrls`, `thumbnailUrl`, `latLon`,
`displayOnMap`, `humanValidated`. El esquema comentado está en `docs/DATA.md` y en
`buildSchema()` de `scripts/generate-llm-artifacts.js`.

Lo que no se deduce leyendo el JSON:

- `id` puede ser `null`: se asigna en `master`, dentro del job `build`, no al crear la
  propuesta. Mientras tanto la comunidad ya es enlazable por slug.
- `topics` es texto libre heredado; lo vigente es `tags`.
- `tags` y `targetAudience` son IDs de los catálogos; la búsqueda sobre ellos usa `label`,
  `description` y `synonyms`, no solo el ID.
- `matchesAllTags` y `matchesAllAudience` compactan el array a `[]` en el payload final, pero
  **no** deben borrar la selección visible del formulario.
- `location` es dónde ocurren los eventos; `geographicScope` es el territorio al que da
  servicio. Son cosas distintas (#402).
- `archivedUrls` son canales que la comunidad ya no atiende: se conservan pero **nunca** se
  renderizan, y la clave se omite si está vacía.
- `communityUrl` sigue siendo la URL principal y el fallback.
- `urls` no tiene clave por plataforma de eventos: Meetup, Eventbrite y Luma van en
  `eventsUrl`. Inventar una clave pasa el `writeCommunity` pero falla en el pre-commit.

## Cómo funciona la búsqueda

- La app usa búsqueda facetada con índice invertido, no filtrado ingenuo sobre todo el array
- La búsqueda de tags debe apoyarse en `label`, `description` y `synonyms`
- Los filtros activos viven en Zustand y recalculan `communitiesFiltered`

## Scripts importantes

- `npm run dev`: desarrollo
- `npm run dev:clean`: limpia caché local de Vite y arranca
- `npm run dev:local`: arranca en `127.0.0.1:4173`
- `npm run dev:local:clean`: limpia caché local de Vite y arranca en `127.0.0.1:4173`
- `npm run build`: build de producción
- `npm run lint`: lint
- `npm run scrape-community-data`: scraping/enriquecimiento
- `npm run apply-suggestions`: aplica `suggestions.json`
- `npm run apply-url-mapping`: aplica `url-mapping.json`
- `npm run compile-communities`: compila el bundle y el GeoJSON desde la fuente
- `npm run generate-llm-artifacts`: genera `llms.txt`, `llms-full.txt`, el CSV, `schema.json` y el sitemap
- `npm run validate-data` y `validate-data:staged`: validación del dataset (la segunda, en pre-commit)
- `npm run check-urls`: comprueba que las URLs responden
- `npm run match-eventos-wiki`: empareja organizadores de eventos.wiki con comunidades
- `npm test`: Vitest

La lista completa está en `package.json`; no existe `migrate-add-new-fields` aunque alguna
doc antigua lo cite.

## Artefactos para LLMs y agentes

El directorio publica su propia superficie para agentes, generada en cada build por
`scripts/generate-llm-artifacts.js`:

- `public/llms.txt`: índice al estilo [llmstxt.org](https://llmstxt.org/) con los ficheros disponibles y las reglas para interpretar un registro
- `public/llms-full.txt`: el dataset entero en Markdown, con tags y público resueltos a etiquetas
- `public/data/communities.csv` y `public/data/schema.json`: volcado tabular y diccionario de datos
- `public/sitemap.xml`: un deep link por comunidad activa, en `es` y `en`
- `public/robots.txt` (estático, sí versionado): rastreo abierto, con atribución

Están en inglés a propósito. Si añades un campo al modelo de datos, documéntalo también en
`buildSchema()` y, si cambia cómo se interpreta un registro, en `buildLlmsIndex()`: ese texto
es lo que leen los agentes antes de usar el dataset.

En la UI, el botón **Datos abiertos + IA** de la cabecera (`src/components/OpenDataModal/`)
expone lo mismo a las personas: prompts copiables, ejemplos de código e instrucciones para
pegar en el contexto de un agente.

## Alta asistida por IA

`src/lib/aiAssist.js` + `src/components/CommunityContribution/AiAssistPanel.jsx`: abren Claude
o ChatGPT con un prompt preparado y validan el JSON que la persona pega de vuelta. No hay
clave de API; el bucle es manual a propósito. El parser filtra a claves conocidas y nunca
acepta `id` ni `humanValidated` de la IA. Campo nuevo en el modelo → añadirlo a
`STRING_FIELDS`, `ARRAY_FIELDS` o `ENUM_VALUES` o la IA no podrá rellenarlo.

## CHANGELOG

No se edita a mano: `scripts/generate-changelog.js` lo regenera entero desde el log de git.
Corre en el hook `.githooks/post-commit` (local) **y** en el job `build` de `deploy.yml`
(master). El segundo es el que lo garantiza: lo que se mergea desde la web de GitHub nunca
pasa por un hook local.

Los cambios de comunidad aparecen como `Añadida`/`Actualizada`/`Eliminada` con enlace a la
ficha y a la PR, una línea por comunidad.

## Reglas prácticas

- Mantener naming funcional en español y naming técnico de componentes en inglés
- No romper compatibilidad con `communityUrl` aunque exista `urls`
- Antes de tocar búsqueda o filtros, revisar `community.store.js`, `invertedindex.js` y `searchFaceted.js`
- Antes de tocar mapa, revisar que `communities.geojson` y `displayOnMap` sigan consistentes
- Si se tocan scripts de datos, asumir que el repo puede estar en estado parcialmente migrado

## Cosas que muerden

- **Rutas de ficheros locales: siempre absolutas.** La URL lleva prefijo de idioma (`/es/`,
  `/en/`), así que `"data/foo.json"` se rompe. Usar `` `${import.meta.env.BASE_URL}data/foo.json` ``.
- **`[skip ci]` salta el push entero, no su commit.** GitHub solo mira el commit de cabeza. El
  hook de pre-commit regenera el changelog; si ese commit queda encima, no se publica nada de
  lo que hay debajo.
- **No añadas otro workflow que asigne ids.** Dos jobs en grupos de concurrencia distintos
  pueden reclamar el mismo id: es justo el bug que resuelve el flujo actual.
- **`public/sw.js` contiene `__BUILD_VERSION__` literal.** Sustituirlo a mano rompe para
  siempre la detección de actualizaciones de la PWA.
- **Comparar registros con `stableStringify`** del store, nunca `JSON.stringify` directo: el
  orden de claves haría aparecer las 650+ comunidades como modificadas.
- **Añadir una clave a `urls` exige tocar cuatro sitios** (formulario, validación, modal e
  i18n) o el enlace no se renderiza nunca. Están listados en `CLAUDE.md`.
- Hay tests con Vitest en `tests/`: ejecutar `npm test` tras cualquier corrección, y añadir un
  test por bug fix.

## Riesgos habituales

- El repo suele tener cambios locales no relacionados; no revertir nada por defecto
- El dataset es grande y mezcla datos manuales con enriquecimiento automático (`humanValidated: false`)
- ArcGIS hace el build pesado; un `build` correcto no implica que el mapa esté perfecto sin validación visual
- `localhost:5173` puede estar interceptado por un port forwarding local de VS Code (`Code Helper`) aunque la URL parezca “local”; si el runtime no coincide con el código en disco, comprobar `lsof -nP -iTCP:5173 -sTCP:LISTEN` y considerar `npm run dev:local:clean`
