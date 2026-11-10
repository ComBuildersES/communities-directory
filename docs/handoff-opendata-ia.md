# Relevo: capa de datos abiertos + IA

Estado al cerrar la sesión del 2026-11-10. Lo que sigue es lo pendiente, no lo hecho: para
lo hecho, `CLAUDE.md` y `AGENTS.md` ya lo documentan.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Artefactos para LLMs | `scripts/generate-llm-artifacts.js` → `llms.txt`, `llms-full.txt`, CSV, `schema.json`, `sitemap.xml` |
| Modal "Datos abiertos + IA" | `src/components/OpenDataModal/` |
| Prompts del modal | `src/i18n/locales/{es,en}.json` → `openData.chat.prompts.*` |
| Alta asistida por IA | `src/lib/aiAssist.js` + `src/components/CommunityContribution/AiAssistPanel.jsx` |
| Botón flotante de soporte | `src/components/SupportFab/` |
| Changelog | `scripts/generate-changelog.js`, hook `.githooks/post-commit`, job en `deploy.yml` |

Los prompts tienen red: `tests/openDataPrompts.test.js` falla si se reintroduce un
placeholder `[rellena aquí]`, si un prompt deja de preguntar a la persona, o si se caen los
avisos sobre `archivedUrls` / `matchesAllTags` / `geographicScope`. Al tocar los textos hay
que mirar ese test.

---

## Petición 1 — Reenfocar el paso de OTE y el bloque de ayuda

**Dónde**: `openData.organizers.step4` y `openData.organizers.help*` en ambos locales.
El componente es `OrganizersTab` en `OpenDataModal.jsx`.

Hoy el paso 4 describe el mecanismo ("publica un feed y añádelo a tu ficha"). Debería vender
el porqué: una especificación abierta en crecimiento que da difusión al organizador y permite
a la gente suscribirse sin depender de una plataforma intermediaria, además de facilitar que
te descubran. Enlaces ya presentes: opentechevents.org, el lector, eventos.wiki.

El bloque "¿Te atascas?" debería dejar de sonar a fracaso ("¿te has atascado?") y pasar a una
invitación: dudas o ayuda con OTE o con cualquier otra cosa, y que da gusto ayudar.

Traducir los dos a `en` con el mismo tono.

---

## Petición 2 — Placeholders de las URLs del alta asistida

**Dónde**: `contribution.aiAssist.urlPlaceholderMain` y `urlPlaceholderMore`.

No queda claro que **es un campo por URL** (no una lista separada por comas; al escribir en el
último aparece otro campo vacío) ni qué merece la pena pegar. Conviene sugerir fuentes con
información pública aprovechable: web propia, Meetup/Eventbrite/Luma, GitHub, LinkedIn,
Mastodon/Bluesky, blog o RSS, canal de YouTube con charlas.

Ojo: el texto de apoyo (`urlsCopy`) ya explica qué aporta cada fuente; no repetirlo, el
problema es solo el placeholder.

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

## Petición 4 — Reposicionar el botón flotante

**Dónde**: `src/components/SupportFab/` + claves `support.*` en los locales.

Hoy es "¿Ayuda?" / "¿Te echamos una mano?", enfocado a soporte. Lo que más falta ahora es
**apoyo a la iniciativa**: difundir en redes, pasar el directorio a quien dinamiza comunidades
para que revise sus datos, escribir sobre ello. El soporte (dudas, bugs, errores en los datos)
sigue cabiendo, pero deja de ser el titular.

Implica repensar: la etiqueta del botón, el título y copy del panel, y probablemente los
canales — tiene sentido añadir compartir en redes, que hoy solo vive en el popover "Sobre el
proyecto" (`buildShareLinks` en `Heading.jsx`, reutilizable).

Cuidado con dos cosas ya resueltas que no conviene romper:
- El aviso a los 7 s (`useSupportNudge.js`) y su texto salen de `support.title`.
- El anillo blanco y el fondo azul marino son lo que separa el botón del muro de logos.
  Si cambia el color, comprobarlo sobre la vista de lista, no sobre fondo blanco.

---

## Dos constantes duplicadas a propósito

La URL del grupo de Telegram está en `SupportFab.jsx` **y** en `OpenDataModal.jsx`. Si cambia
el grupo, son dos sitios.
