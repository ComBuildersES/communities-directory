# Relevo: capa de datos abiertos + IA

Estado al cerrar la sesión del 2026-11-10 (peticiones 1, 2 y 4 ya hechas). Lo que sigue es lo pendiente, no lo hecho: para
lo hecho, `CLAUDE.md` y `AGENTS.md` ya lo documentan.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Artefactos para LLMs | `scripts/generate-llm-artifacts.js` → `llms.txt`, `llms-full.txt`, CSV, `schema.json`, `sitemap.xml` |
| Modal "Datos abiertos + IA" | `src/components/OpenDataModal/` |
| Prompts del modal | `src/i18n/locales/{es,en}.json` → `openData.prompts.*` (planos; las pestañas eligen cuáles pintan) |
| Alta asistida por IA | `src/lib/aiAssist.js` + `src/components/CommunityContribution/AiAssistPanel.jsx` |
| Botón flotante de apoyo | `src/components/SupportFab/` + `src/lib/shareLinks.js` |
| Changelog | `scripts/generate-changelog.js`, hook `.githooks/post-commit`, job en `deploy.yml` |

Los prompts tienen red: `tests/openDataPrompts.test.js` falla si se reintroduce un
placeholder `[rellena aquí]`, si un prompt deja de preguntar a la persona, o si se caen los
avisos sobre `archivedUrls` / `matchesAllTags` / `geographicScope`. Al tocar los textos hay
que mirar ese test.

---

## Petición 3 — Prompts que prometían datos que no existen (RESUELTA)

Se midió la cobertura real antes de reescribir nada. De las 446 comunidades activas:
`communityType` y `status` al 100 %, `location` 436, `latLon` 368, `tags` 220,
`humanValidated` 77, `targetAudience` 60, `urls.ote` 41, `geographicScope` 27. Y 438
fichas tienen `lastReviewed` en 2024.

Conclusiones que cambiaron el plan original:

- **"Actividad reciente vía `lastReviewed`" no existe**: es fecha de revisión de la ficha,
  no de actividad. El único indicio real es `urls.ote`.
- **"Alcance" tampoco**: `geographicScope` lo trae el 6 % de las activas. La zona sí se
  puede usar, pero por `location`, que está en el 98 %.
- **`communityType` es el campo más fuerte del dataset** y el que menos se explotaba. De
  ahí salió el prompt "Qué tipo de comunidad me conviene".

Se aplicó la opción (1): los prompts solo prometen lo que el dato sostiene, y los tres que
tocan terreno inexistente (voluntariado, sinergias, acogida) **dicen en voz alta que el
dataset no trae ese campo** y piden el canal para preguntarlo. Hay test.

Sigue abierta la opción (3) como issue aparte si se ve demanda: un `openTo: ["volunteers",
"collaborations", "co-organisers", "speakers"]`. Es cambio de modelo de datos y toca los
cuatro sitios de siempre más `buildSchema()` y `buildLlmsIndex()`.

---

## Sesión del 2026-11-10 (tarde): reorganización del modal

**Las pestañas pasan a ir por persona**: `attend` · `organizers` · `found` · `build`.
Antes mezclaban eje de herramienta y eje de persona. Detalle y razones en `CLAUDE.md`.

Prompts nuevos: `types` (las siete dinámicas de `communityType`), `umbrella` (quién
puede acoger a quien va a montar algo) y `onboarding` (poner al día al agente de quien
construye sobre los datos). `volunteer`, `synergies` y `gaps` reescritos.

Arreglado de paso: el mojibake de los `.txt` (`llms.txt` es ASCII puro, `llms-full.txt`
abre con BOM) y la clave `heading.bookmarkHint` que estaba **duplicada** en los dos
locales, con la primera copia muerta.

Pendiente menor: el subtítulo del modal sigue diciendo "puedes descargarlas" aunque los
chips de ficheros ahora vivan en la última pestaña. No molesta, pero se puede afinar.

---

## Hecho en esta sesión (para contexto, no para rehacer)

- **Paso 4 de OTE y bloque de ayuda** (`openData.organizers.*`): el paso vende el porqué de
  la especificación abierta; "¿Te atascas?" pasó a "Pregúntanos lo que sea".
- **Placeholders del alta asistida**: un ejemplo de URL distinto por campo (web, Meetup,
  GitHub, LinkedIn, RSS) en vez de un texto explicativo: es lo que deja claro que va una
  URL por campo.
- **El paso 4 pasó a un stepper** (1 ▸ 2 ▸ 3 ▸ 4) con un paso visible cada vez.
- **El "cómo colaborar" del popover "Sobre el proyecto" se fue al FAB** (vista "Quiero
  ayudar"); en el popover queda un botón que lo abre ahí, vía `src/lib/supportFab.js`. Y
  "¿Te parece útil?" abre ahora con dar una estrella al repo y guardar en favoritos.
- **Botón flotante**: ahora pregunta primero (¿necesitas ayuda o quieres ayudar?) y de ahí
  salen dos vistas, `support.help.*` y `support.give.*`. El aviso automático ya no salta a
  los 7 s en frío: espera a una señal de valor (`resolveNudgeTrigger`). Detalle en
  `CLAUDE.md`.

Pendiente ahí: el botón sin etiqueta es un círculo sobre un muro de logos. Si se ve que pasa
desapercibido, el arreglo barato es recuperar la etiqueta solo en escritorio.

---

## Dos constantes duplicadas a propósito

La URL del grupo de Telegram está en `SupportFab.jsx` **y** en `OpenDataModal.jsx`. Si cambia
el grupo, son dos sitios.
