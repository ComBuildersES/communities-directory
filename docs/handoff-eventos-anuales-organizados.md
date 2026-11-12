# Handoff — alta de eventos anuales organizados por comunidades

> **Estado 12/11/2026 (tarde): aplicado.** `organizedBy` commiteado en
> `feat/organized-by-475` (f97406c). Altas, vínculos y la baja de DevFest Sevilla 2024,
> hechos. Queda: logos de las dos fichas nuevas, confirmar la autoría del BiznagaFest con
> quien lo organiza, y las altas de GDG Valladolid / Córdoba / Zaragoza / Lleida.

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

### GDGs disponibles para vincular

| GDG | id | | GDG | id |
|---|---|---|---|---|
| GDG A Coruña | 195 | | GDG Madrid | 202 |
| GDG Alicante | 587 | | GDG Málaga | 203 |
| GDG Barcelona | 613 | | GDG Menorca | 543 |
| GDG Girona | 604 | | GDG Ponferrada | 205 |
| GDG Granada | 198 | | GDG Sevilla | 206 |
| GDG Jaén | 200 | | GDG Toledo | 208 |
| GDG Jerez de la Frontera | 630 | | GDG Valencia | 209 |
| GDG La Rioja | 201 | | GDG Spain (paraguas) | 207 |

**No están en el directorio**: GDG Córdoba, GDG Zaragoza, GDG Lleida, GDG Valladolid.

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

## Por cada ficha que se cree

- [ ] `name`, `status: active`, `communityType: conference`, `eventFormat: in-person`
- [ ] `location`, `provinceId`, `geographicScope` (casi todos `local` o `provincial`)
- [ ] `communityUrl` + `urls` reales (no inventar; si no hay, dejar vacío)
- [ ] `organizedBy: [<id del GDG>]` cuando el organizador esté en el directorio
- [ ] `tags` / `targetAudience` del catálogo
- [ ] `latLon` + `displayOnMap`
- [ ] `thumbnailUrl` (la validación avisa si falta)
- [ ] `id: null`
- [ ] `npm run validate-data` (o el hook) y `npm test`

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

## Siguiente sesión

1. **URLs con etiqueta personalizada** (idea nueva): sustituir la lista fija de plataformas
   por pares etiqueta + URL. Si la etiqueta coincide con una conocida, icono predefinido; si
   no, icono genérico. Afecta a `URL_PLATFORM_OPTIONS`, `ALLOWED_URL_KEYS`,
   `URL_CONFIG_KEYS` / `URL_GROUP_DEFS` y los locales — hoy añadir una plataforma obliga a
   tocar cuatro sitios, que es parte del problema. Hay que decidir qué pasa con las 655
   fichas actuales y con la validación.
2. Logos de GeeksCAT Conf y VallaTech Summit.
3. Confirmar con quien organiza el BiznagaFest que el vínculo con GDG Málaga es correcto.
4. Altas de GDG Valladolid, Córdoba, Zaragoza y Lleida (son altas de comunidad, no de evento).
5. #477 sigue abierto: tipo para hackathones, jams y datatones.
