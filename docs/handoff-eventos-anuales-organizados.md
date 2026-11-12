# Handoff — alta de eventos anuales organizados por comunidades

> **Estado 12/11/2026 (noche): altas de GDG hechas.** `organizedBy` commiteado en
> `feat/organized-by-475` (f97406c); ids 659 (GeeksCAT Conf) y 660 (VallaTech Summit)
> asignados por CI en 76ca68b. Añadidos los cuatro GDG que faltaban (661 Córdoba,
> 662 Lleida, 663 Valladolid, 664 Zaragoza) y vinculado VallaTech Summit → GDG Valladolid.
> **URLs con etiqueta hechas, formulario incluido** (#478): `urls` es una lista de pares, las
> 510 fichas con canales están migradas y el formulario edita filas con etiqueta propia.
> Queda: los logos de los cuatro GDG nuevos (manual) y #477 (a la espera de opiniones).

Estado al **12/11/2026**. Trabajo derivado de los issues
[#475](https://github.com/ComBuildersES/communities-directory/issues/475) (modelo de autoría
`organizedBy`) y [#477](https://github.com/ComBuildersES/communities-directory/issues/477)
(hackathones, abierto).

## Paso 0 — hecho

`organizedBy` (#475) commiteado en `feat/organized-by-475` (f97406c). Sin eso, el hook de
pre-commit rechazaba cualquier ficha con la clave.

## Criterio acordado (#475)

Una ficha propia **solo** con:

1. **Marca propia que sobrevive a la edición.** "Biznaga Fest" sí; "Biznaga Fest 2026" no.
2. **Canales propios** (web, redes, feed). Si no los hay, la ficha no se crea: el evento se
   queda como `urls.eventsUrl` de la comunidad que lo organiza.
3. **Recurrencia.** Una sola edición no es comunidad posible.

Y además:

- `organizedBy` solo enumera **comunidades del directorio**. Si el GDG local no está, o se
  añade primero, o la ficha nace sin vínculo.
- El solapamiento de canales con la comunidad organizadora es un precio asumido.
- Si el evento no tiene canales propios pero sí marca y lo organiza alguien del directorio,
  la ficha se crea sin `urls` y el modal ya muestra el CTA + enlace a los canales del
  organizador.
- `humanValidated: true` solo si una persona ha comprobado los datos de esa ficha.
- `id: null` en el fichero nuevo: el id se asigna en master.

## Qué hay ya en el directorio

| Ficha | id | Estado respecto a este trabajo |
|---|---|---|
| BiznagaFest | 62 | Existe. Falta `organizedBy`. **Duda**: su LinkedIn es `company/fjxgroup`, así que no está claro si la autoría es de GDG Málaga (203), de la empresa, o de ambas. |
| CodeRioja | 96 | Existe. Es el "DevFest La Rioja" de la lista. Falta `organizedBy: [201]` si se confirma que lo organiza GDG La Rioja. |
| DevFest Sevilla 2024 | 136 | **Edición, no serie.** Deuda registrada en #477: renombrar a "DevFest Sevilla" o dar de baja. |
| GeeksCAT | 647 | Existe la comunidad. Falta la ficha de la conferencia (conf.geeks.cat). |

## Evaluación (12/11/2026, verificada en las webs)

### El hallazgo que decide casi todo

Las tres "webs propias" de DevFest que existen **son del GDG, no del DevFest**:

| Web | Qué es en realidad |
|---|---|
| `gdg.barcelona` | Landing del DevFest **en el dominio de GDG Barcelona**; los canales que enlaza son los del GDG (@gdg_barcelona, LinkedIn GDG Barcelona, gdg.community.dev). |
| `gdgzaragoza.es` | Web de la **comunidad** GDG Zaragoza; el DevFest es uno más de sus eventos (2018, 2019, 2021, 2023, a veces como "DevFest & VR Day"). |
| `gdg-jaen.netlify.app` | Landing del DevFest **en el subdominio del GDG**; canales del GDG y de WTM Jaén. |

Es decir: **"DevFest <ciudad>" no es una marca propia.** Es el nombre del programa global de
Google más el nombre de la ciudad, ejecutado por el capítulo local con los canales del
capítulo. No pasa el criterio 1 (marca que sobrevive a la edición, independiente de quien la
organiza) ni el 2 (canales propios).

**La frontera queda limpia y se puede escribir en la guía: si el evento se llama
"<programa global> + <ciudad>", no hay ficha; si tiene nombre propio, sí.** Y eso explica por
qué el DevFest de GDG Málaga sí la tiene: se llama BiznagaFest. Los que se renombran son
exactamente los que se independizan.

### Sí llevan ficha

| Candidato | Evidencia | Acción |
|---|---|---|
| **BiznagaFest** (62, existe) | Nació como DevFest Málaga (2017-2019) y se renombró en 2022. 8+ ediciones. Equipo propio de voluntarios. Marca, web y redes propias. | Añadir `organizedBy: [203]`. **Y corregir un error**: su `urls.linkedin` apunta a `company/fjxgroup`, que es un **patrocinador**, no el organizador. |
| **CodeRioja** (96, existe) | Es el **sucesor** del DevFest La Rioja que GDG La Rioja organizó hasta 2018. Hoy lo lleva La Rioja Tech Alliance; sigue siendo DevFest oficialmente. Marca, web, Telegram, Bluesky y LinkedIn propios. | Añadir `organizedBy`. **Decisión**: ¿`[201]` (GDG La Rioja), `[311]` (La Rioja Tech Alliance, meta-community con URL archivada) o los dos? |
| **GeeksCAT Conf** | Evolución de la "Festa Open Source". Evento anual de la comunidad tech catalana, en Girona. Web propia (`conf.geeks.cat`), email propio (`conf@geekscat.org`), marca propia. | **Ficha nueva**, `organizedBy: [647]`. Mover ahí `conf.geeks.cat`, que hoy está como `eventsUrl` de GeeksCAT: una URL en dos fichas se queda desactualizada en una. |
| **VallaTech Summit** (DevFest Valladolid) | Nombre propio y **dominio propio** (`vallatechsummit.com`). Contacto `valladolidgdg@gmail.com`. | **Ficha nueva**. GDG Valladolid **no está en el directorio**: o se añade primero y se vincula, o la ficha nace sin `organizedBy`. |

### No llevan ficha

DevFest **Madrid, Barcelona, Valencia, Girona, Jaén, Jerez, Córdoba, Zaragoza y Lleida**: sin
marca ni canales propios. Lo que corresponde es que la URL del evento viva en
`urls.eventsUrl` de la ficha del GDG correspondiente, no una ficha aparte.

Caso aparte, deuda ya existente: **DevFest Sevilla 2024** (136) es una **edición**, y además
sin marca propia, y su `communityUrl` es la página de esa edición concreta en
gdg.community.dev. No encaja ni como serie ni por marca: lo coherente es **darla de baja** y
dejar la URL en la ficha de GDG Sevilla (206).

### Pendiente de confirmar con las personas que organizan

- **BiznagaFest**: la web no dice explícitamente que hoy lo organice GDG Málaga (sí que viene
  de su DevFest, y su `eventsUrl` apunta al Meetup del GDG). Conviene confirmarlo antes de
  fijar el vínculo: un vínculo de autoría equivocado es peor que ninguno.
- **GDG Valladolid, Córdoba, Zaragoza y Lleida**: no están en el directorio. Son altas de
  comunidad, no de evento.

## Lo aplicado (12/11/2026)

| Cambio | Ficha |
|---|---|
| `organizedBy: [203]` y fuera el LinkedIn de FJX Group (era un patrocinador, no el organizador) | BiznagaFest (62) |
| `organizedBy: [201, 311]` — GDG La Rioja lo creó como DevFest, La Rioja Tech Alliance lo lleva hoy | CodeRioja (96) |
| Ficha nueva, `organizedBy: [647]`; `conf.geeks.cat` **movida** desde el `eventsUrl` de GeeksCAT | GeeksCAT Conf |
| Ficha nueva, sin `organizedBy` (GDG Valladolid no está en el directorio) | VallaTech Summit |
| Baja: es una edición, no una serie | DevFest Sevilla 2024 (136) |

Las dos fichas nuevas van con `humanValidated: false` y `thumbnailUrl` vacío: los datos salen
de leer sus webs, no de que una persona los haya repasado, y no hay logo.

## Lo que no se pudo aplicar, y por qué importa

El plan decía "para los nueve DevFest sin ficha, la URL del evento va en `urls.eventsUrl` del
GDG". **No cabe**: `eventsUrl` es una sola clave y ya está ocupada por Meetup o por
gdg.community.dev en GDG Madrid, Barcelona, Valencia, Jaén, Sevilla, A Coruña y La Rioja. En
Girona y Jerez está libre, pero la URL estable de su DevFest **es** la página del GDG, que ya
está en `communityUrl`: añadirla sería duplicarla.

O sea que hoy no hay sitio donde decir "y además organizan este evento anual, aquí". Es el
mejor argumento a favor de las **URLs con etiqueta personalizada**: con ellas, cada GDG podría
tener su enlace "DevFest" junto al de Meetup, y de paso Meetup, Eventbrite y Luma tendrían
icono propio en vez de compartir `eventsUrl`.

## Lo aplicado (12/11/2026, segunda vuelta): los cuatro GDG que faltaban

Son **altas de comunidad, no de evento**: lo que no llevaba ficha era el capítulo, y por eso
el DevFest de esas cuatro ciudades no tenía dónde colgarse. Los cuatro están **activos**
(eventos con fecha de 2026 en `gdg.community.dev`), así que ninguno entra como `inactive`.

Van con `humanValidated: false`: los datos salen de leer sus páginas, no de que una persona
del capítulo los haya repasado.

La única decisión que no se lee en la ficha: **`gdgzaragoza.es` va a `archivedUrls`**. Su
último evento es de 2023 y hoy pone "No Events are found", mientras el capítulo sigue activo
en el programa. Es el caso exacto del canal zombie de #353.

**Y el vínculo que esto desbloquea**: `VallaTech Summit` (660) ya tiene
`organizedBy: [663]`. Era el único de los dos encuentros nuevos que nació sin autoría,
precisamente porque su GDG no estaba en el directorio.

El `id` se asignó **en local** con `npm run assign-community-ids` a propósito: `organizedBy`
referencia ids, así que sin asignarlos antes el vínculo del VallaTech Summit habría tenido
que esperar a otra ronda después del merge. Estando en `master` y sin nada más pendiente de
asignar, es determinista y CI no reasigna lo que ya tiene id.

### Lo que sigue sin ficha, y es correcto

DevFest **Córdoba, Zaragoza y Lleida** no llevan ficha propia, por el mismo criterio de
antes: "DevFest + ciudad" no es marca propia. Ahora al menos su capítulo existe en el
directorio, que es donde la gente los va a buscar.

## Confirmar la autoría del BiznagaFest

El vínculo `organizedBy: [203]` (GDG Málaga) está **aplicado pero sin confirmar**. Lo que hay
a favor: nació como DevFest Málaga, y su `eventsUrl` es literalmente el Meetup de
`google-developer-group-malaga`. Lo que no hay: una frase en su web que lo diga.

Canales para preguntar: `biznagafest@gmail.com` (en la ficha), y el Discord de GDG Málaga
(`discord.gg/PbUpg2b6pW`).

Borrador:

> Asunto: ¿quién organiza hoy el BiznagaFest? (directorio de Community Builders)
>
> Hola:
>
> Mantenemos [el directorio de comunidades tecnológicas españolas](https://directory.communitybuilders.dev/)
> y acabamos de añadir un campo para decir qué comunidad organiza cada encuentro anual, de
> forma que desde la ficha del BiznagaFest se pueda llegar a la gente que lo hace posible y
> al revés.
>
> Hemos puesto que lo organiza **GDG Málaga**, porque el BiznagaFest viene del DevFest Málaga
> y porque vuestras inscripciones salen del Meetup del GDG. ¿Es correcto a día de hoy, o lo
> lleva otro equipo (o varios a la vez)? El campo admite más de una comunidad.
>
> Dos cosas más, por si queréis aprovechar:
>
> - Quitamos de vuestra ficha el LinkedIn de FJX Group, porque entendemos que es un
>   patrocinador y no quien organiza. Si nos equivocamos, lo devolvemos.
> - La ficha está marcada como *pendiente de revisar*: los datos los sacamos de vuestra web,
>   no de que nos los hayáis confirmado. Si le echáis un ojo y nos decís que está bien, la
>   marcamos como revisada.
>
> Gracias, y cualquier corrección es bienvenida.

Si no contestan, la decisión es **mantener el vínculo**: la evidencia del Meetup es fuerte y
el coste de equivocarse aquí es un enlace entre dos fichas que de verdad están relacionadas.
Lo que no se puede hacer sin respuesta es marcar la ficha como `humanValidated: true`.

## URLs con etiqueta personalizada: hecho (#478)

Era el punto 1 de esta lista y resuelve el "no cabe" de la sección anterior. `urls` pasa de
objeto `{ clave: url }` a **lista de pares** `{ url, kind?, label? }`. El modelo y el criterio
están en `CLAUDE.md`; aquí queda lo que importa para este trabajo:

- Un GDG ya puede tener su Meetup **y además** su DevFest, los dos como `eventsUrl`,
  distinguidos por `label`. Eso era exactamente lo que no cabía.
- `kind` se **omite** cuando el dominio lo delata, así que las fichas migradas no repiten
  "twitter" al lado de una URL de `x.com`.
- Añadir una plataforma ya no obliga a tocar cuatro sitios: `URL_KINDS` más la clave de i18n.

### La migración, que era el miedo razonable

No se repasó ninguna ficha a mano, así que la garantía es mecánica y está en tres capas: el
script aborta entero si una ficha no sobrevive la ida y vuelta; un test corre esa misma
comprobación sobre el dataset completo, para que no caduque con el script; y una vez aplicada
se comparó cada ficha contra `git HEAD` — **0 URLs perdidas, 0 aparecidas, 0 `kind` que no
cuadren**.

### El formulario ya edita pares

Una fila por canal: `[icono] [¿qué es?] [URL] [archivar] [quitar]` y un `+ Añadir canal`.
Fuera los 24 campos fijos y los chips "+ Telegram". El campo del medio rellena solo el nombre
y el icono cuando el dominio delata la plataforma, y pide el nombre con un placeholder cuando
no. Detalles en `CLAUDE.md`.

Lo que **no** era obvio y por poco se cuela: seis kinds (`web`, `ote`, `blog`, `rss`, `forum`,
`mastodon`) **no se infieren nunca** por dominio. Con un campo de texto libre a secas, el feed
OTE de alguien se habría guardado con la etiqueta "Eventos" y sin `kind`, y la sección de
próximos eventos de su ficha se habría apagado sin decir nada. Por eso el campo es un
combobox: texto libre, pero sugiriendo las plataformas conocidas.

Y un bug que se arregló por el camino: `archivedUrlMatches` hacía `Object.values(payload.urls)`,
que con pares devuelve los objetos entrada y no las URLs. El aviso de "esta URL ya está
archivada" llevaba roto desde la migración.

### Segunda pasada del editor

Tres cosas, salidas de probarlo de verdad:

1. **Quitar un canal los borraba todos**, y sólo al *editar* una ficha existente: la identidad
   de fila se generaba en el componente, y ese camino no pasaba por ahí. Hay test de regresión.
2. **El `datalist` nativo no servía** con la lista ya crecida. Sustituido por un desplegable
   propio, agrupado como la ficha.
3. **Meetup, Eventbrite y Luma pasan a tener clave propia.** Eso cambió el `kind` inferido de
   236 URLs de meetup.com que lo tenían implícito: ningún fichero hubo que reescribirlo, pero
   sí actualizar a quien preguntaba por `eventsUrl`.

De paso apareció una inconsistencia de fondo: la inferencia crece con el tiempo, así que un
`kind` escrito antes puede volverse redundante y el dataset acaba con dos formas de escribir
lo mismo. Ya pasaba en 11 fichas.

### Los dos primeros canales con etiqueta propia

El campo `label` no tenía **ni un solo uso** en 1505 entradas, así que no se podía comprobar
de verdad. Ahora tiene dos, los dos verificados (HTTP 200 y la página leída):

| Ficha | Entrada | Por qué |
|---|---|---|
| GDG Barcelona (613) | `eventsUrl` + label `DevFest Barcelona` → `gdg.barcelona` | Su `eventsUrl` ya lo ocupaba el Meetup |
| GDG Jaén (200) | `eventsUrl` + label `DevFest Jaén` → `gdg-jaen.netlify.app` | Su `eventsUrl` ya lo ocupaba `gdg.community.dev` |

Son exactamente el "no cabe" que cerró la sesión anterior. La etiqueta lleva el nombre de la
**serie**, no el de la edición ("DevFest Barcelona", no "DevFest Barcelona 2026"): mismo
criterio que #475, aunque la landing sea de la edición de 2026.

Quedan los otros siete DevFest sin ficha (Madrid, Valencia, Girona, Jerez, Córdoba, Zaragoza,
Lleida). No se han añadido porque **no tienen URL propia estable**: su página es la del GDG,
que ya está en `communityUrl`, o la de una edición concreta en `gdg.community.dev`.

## Cerrado por decisión: el correo del BiznagaFest

No se manda. El vínculo `organizedBy: [203]` se queda puesto con la evidencia que hay (nació
como DevFest Málaga y sus inscripciones salen del Meetup del GDG), y la ficha **no** se marca
como revisada. El borrador sigue más arriba por si algún día se quiere usar.

## Cerrado por decisión: la frescura de los feeds

Se midió (de 40 feeds de comunidades activas, 10 traían algún evento futuro) y se descartó
perseguirlo: **si eventos.wiki está al día o no, no es responsabilidad del directorio**, que
se limita a leer el feed. No queda script ni lista de contacto.

Lo único que sí se corrigió es lo que el directorio decía de sí mismo: `llms.txt`, los prompts
y `docs/DATA.md` afirmaban que el feed es *"lo único que evidencia actividad real"*, y con eso
un modelo deduce "tiene feed, luego está viva" sin haber abierto el feed. Ahora dicen que el
campo sólo indica que existe un feed, que lo que contenga es cosa de la comunidad, y que hay
que leer las fechas de dentro.

## Por qué GDG Madrid no enlaza su DevFest

Preguntado y verificado: **DevFest Madrid no tiene URL propia**. La única es la de la edición
(`.../google-gdg-madrid-presents-devfest-madrid-2026/`), y el año en el slug la hace caducar
cada enero. `devfest.gdgmadrid.es`, `devfestmadrid.com`, `gdgmadrid.es` y `devfest.madrid` no
existen.

Comprobados los **siete** sin entrada (Madrid, Valencia, Girona, Jerez, Córdoba, Zaragoza,
Lleida): ninguno tiene dominio propio. `gdglleida.com` y `gdgzaragoza.es` sí existen, pero son
la web del capítulo, ya tratadas. Barcelona y Jaén la llevan porque su landing vive en un
dominio que sobrevive a la edición.

## Logos: lo que falta y por qué no sale solo

GeeksCAT Conf y VallaTech Summit ya tienen logo. Quedan los **cuatro GDG nuevos** (661, 662,
663, 664), que son las **únicas cuatro comunidades activas del directorio sin logo**.

Y no se pueden sacar automáticamente. Lo que publican los capítulos no sirve:

- En `gdg.community.dev` lo específico del capítulo es una **foto de la ciudad** como banner y
  los avatares de quien organiza. No hay logo.
- El avatar de Linktree de GDG Córdoba es `GDG-Professional---Horizontal---Dark.png`: el
  **lockup genérico** de GDG, sin ciudad. Ponérselo a los cuatro sería la misma imagen en
  cuatro fichas distintas, que en una cuadrícula no identifica nada.
- `gdglleida.com` es un Blogger y sus imágenes son carteles de eventos.

Lo que llevan los 19 GDG que ya estaban (el lockup con el nombre de la ciudad) sale de los
avatares de sus redes, que no son descargables sin sesión. Es trabajo manual.

Mientras tanto no se ve un hueco roto: la tarjeta pinta las iniciales.

## Siguiente sesión

1. Logos de GDG Córdoba, Lleida, Valladolid y Zaragoza (manual, ver arriba).
2. #477 sigue abierto: tipo para hackathones, jams y datatones.
