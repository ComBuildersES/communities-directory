# Community Builders Directory — Agents

## Qué es

Directorio interactivo de comunidades tecnológicas españolas. Tiene dos vistas principales: listado de tarjetas y mapa. La prioridad del proyecto es facilitar descubrimiento por temática, formato y ubicación, y mantener un dataset de comunidades razonablemente limpio y enriquecido.

## Stack y piezas clave

- Frontend: React 19 + Vite 5
- Estado: Zustand 5
- Mapas: ArcGIS (`@arcgis/core`, `@arcgis/map-components`)
- Estilos: Bulma por CDN + CSS propio
- Datos principales: `public/data/communities.json`
- Taxonomías: `public/data/tags.json`, `public/data/audience.json`

## Estructura que importa

- `src/App.jsx`: compone la app y alterna entre lista y mapa
- `src/components/CommunitiesList.jsx`: grid de comunidades
- `src/components/CommunityCard.jsx`: tarjeta individual
- `src/components/CommunityModal/`: detalle ampliado de la comunidad
- `src/components/Map/`: vista de mapa
- `src/stores/community.store.js`: carga de datos, filtros, búsqueda e índice invertido
- `src/stores/sidebar.store.js`: comportamiento responsive del panel lateral
- `scripts/`: utilidades de mantenimiento y enriquecimiento del dataset

## Modelo mental de datos

Cada comunidad tiene campos heredados y campos nuevos:

- Base: `id`, `name`, `status`, `lastReviewed`, `communityType`, `eventFormat`, `location`, `topics`, `contactInfo`, `communityUrl`, `thumbnailUrl`, `latLon`
- Nuevos: `tags`, `targetAudience`, `matchesAllTags`, `matchesAllAudience`, `urls`, `displayOnMap`, `humanValidated`

Notas:

- `topics` sigue siendo texto libre heredado
- `tags` y `targetAudience` referencian IDs de los catálogos JSON
- `matchesAllTags` y `matchesAllAudience` compactan el payload final a arrays vacíos, pero no deben forzar a borrar la selección visible del formulario
- `communityUrl` sigue siendo la URL principal/fallback
- `urls` guarda URLs adicionales por plataforma

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
- `npm run process-to-communities-to-geojson`: genera GeoJSON
- `npm run migrate-add-new-fields`: añade `urls`, `tags`, `targetAudience`
- `npm run scrape-community-data`: scraping/enriquecimiento
- `npm run apply-suggestions`: aplica `suggestions.json`
- `npm run apply-url-mapping`: aplica `url-mapping.json`

## Reglas prácticas

- Mantener naming funcional en español y naming técnico de componentes en inglés
- No romper compatibilidad con `communityUrl` aunque exista `urls`
- Antes de tocar búsqueda o filtros, revisar `community.store.js`, `invertedindex.js` y `searchFaceted.js`
- Antes de tocar mapa, revisar que `communities.geojson` y `displayOnMap` sigan consistentes
- Si se tocan scripts de datos, asumir que el repo puede estar en estado parcialmente migrado

## Estado reciente a recordar

- Existe una nueva taxonomía de `tags` y `targetAudience`
- La tarjeta de comunidad se simplificó para abrir un modal con más detalle
- El grid de tarjetas se ha compactado para mostrar más comunidades por pantalla y limitar nombres largos a 2 líneas
- No hay tests automatizados; la validación habitual es con `npm run build` y comprobaciones manuales

## Riesgos habituales

- Hay muchos cambios locales no relacionados en el repo; no revertir nada por defecto
- El dataset es grande y mezcla datos manuales con enriquecimiento automático
- ArcGIS hace el build pesado; un `build` correcto no implica que el mapa esté perfecto sin validación visual
- `localhost:5173` puede estar interceptado por un port forwarding local de VS Code (`Code Helper`) aunque la URL parezca “local”; si el runtime no coincide con el código en disco, comprobar `lsof -nP -iTCP:5173 -sTCP:LISTEN` y considerar `npm run dev:local:clean`
