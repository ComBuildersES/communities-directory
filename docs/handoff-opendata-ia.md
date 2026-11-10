# Relevo: capa de datos abiertos + IA

Estado al cerrar la sesión del 2026-11-10 (peticiones 1, 2 y 4 ya hechas). Lo que sigue es lo pendiente, no lo hecho: para
lo hecho, `CLAUDE.md` y `AGENTS.md` ya lo documentan.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Artefactos para LLMs | `scripts/generate-llm-artifacts.js` → `llms.txt`, `llms-full.txt`, CSV, `schema.json`, `sitemap.xml` |
| Modal "Datos abiertos + IA" | `src/components/OpenDataModal/` |
| Prompts del modal | `src/i18n/locales/{es,en}.json` → `openData.chat.prompts.*` |
| Alta asistida por IA | `src/lib/aiAssist.js` + `src/components/CommunityContribution/AiAssistPanel.jsx` |
| Botón flotante de apoyo | `src/components/SupportFab/` + `src/lib/shareLinks.js` |
| Changelog | `scripts/generate-changelog.js`, hook `.githooks/post-commit`, job en `deploy.yml` |

Los prompts tienen red: `tests/openDataPrompts.test.js` falla si se reintroduce un
placeholder `[rellena aquí]`, si un prompt deja de preguntar a la persona, o si se caen los
avisos sobre `archivedUrls` / `matchesAllTags` / `geographicScope`. Al tocar los textos hay
que mirar ese test.

---

## Petición 3 — Prompts que prometen datos que no existen (la importante)

Los prompts **"Echar una mano"** y **"Sinergias para mi comunidad"** piden a la IA que
encuentre comunidades que buscan voluntariado, que están abiertas a colaborar o que necesitan
organizadores. **El dataset no tiene ninguno de esos campos.** El modelo no puede responder
sin inventárselo, que es justo lo que el resto de esta capa intenta evitar.

Opciones, de menos a más:

1. Reescribir los dos prompts para que solo prometan lo que el dato soporta (proximidad
   temática, zona, alcance, actividad reciente vía `lastReviewed`), y que digan
   explícitamente que el interés en colaborar hay que preguntarlo a cada comunidad.
2. Quitar "Echar una mano" y dejar el de sinergias acotado a lo anterior.
3. Ampliar el esquema si se ve demanda: algo como `openTo: ["volunteers", "collaborations",
   "co-organisers", "speakers"]`. Esto es un cambio de modelo de datos y toca los cuatro
   sitios de siempre (formulario, validación, modal, i18n) más `buildSchema()` y
   `buildLlmsIndex()` en los artefactos.

Mi recomendación: (1) ahora, y (3) como issue aparte para medir demanda primero.

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
