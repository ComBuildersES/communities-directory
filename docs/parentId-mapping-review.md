# Revisión pendiente de `parentId`

Documento reducido para dejar solo los casos que siguen con dudas o que no se han vinculado en `communities.json`.

Última limpieza: `30/03/2026`

## Casos aún dudosos

| Parent propuesto | ID | Comunidad | Estado | Situación actual | Nota |
|---|---:|---|---|---|---|
| GDG Spain `[207]` | 196 | GDG Cloud Español | active | sin `parentId` | Es una comunidad paraguas. Si se vincula, quedaría jerarquía de 3 niveles: `GDG Spain -> GDG Cloud Español -> GDG Cloud Madrid`. |
| Asociación Española de Drupal `[39]` | 169 | DrupalCamp Spain | active | sin `parentId` | Es conferencia, no meetup local. Pendiente decidir si cuelga también de la asociación. |
| Asociación Española de Drupal `[39]` | 158 | Drupal Day Spain | inactive | sin `parentId` | Mismo caso que arriba, pero además está inactiva. |
| Cloud Native `[79]` | 565 | Cloud Native Sevilla | active | sin `parentId` | Posible duplicado con `Cloud Native (CNCF) Sevilla` `[88]`, que sí está vinculada. |
| Cloud Native `[79]` | 90 | Cloud Native Asturias | inactive | sin `parentId` | Pendiente decidir si se mantienen también comunidades inactivas bajo el paraguas. |
| Comunidad de R Hispano `[103]` | 231 | Grupo de usuarios de R en Málaga | inactive | sin `parentId` | Vínculo temático claro, pero quedó fuera por estar inactiva. |
| Comunidad de R Hispano `[103]` | 235 | Grupo usuarios de R de Murcia | inactive | sin `parentId` | Igual que el caso de Málaga. |
| Grafana Meetups `[221]` | 597 | GrafanaCON | active | sin `parentId` | Es conferencia global/anual, no meetup local. Pendiente decidir si se agrupa bajo Grafana Meetups. |

## No vinculadas porque no existen o faltan localizar

| Parent propuesto | Comunidad | Situación |
|---|---|---|
| Wordpress Meetup Groups `[512]` | WordPress Pamplona | No encontrada en `communities.json`. |

## Fuera de seguimiento

Todo lo demás que aparecía en la versión anterior de este documento ya está creado y/o vinculado en `communities.json`, incluyendo:

- Python España y sus capítulos locales añadidos recientemente.
- GDG Barcelona.
- WordPress Madrid.
- WordPress Murcia.
- WordPress Santiago de Compostela.
- WordCamps `[484-487]`, ya vinculadas a `Wordcamp` `[483]`.

## Siguiente paso sugerido

Cuando queramos cerrar este documento del todo, bastaría con resolver estas decisiones:

1. Permitir o no jerarquías paraguas -> paraguas -> meetup.
2. Decidir si conferencias organizadas por una asociación deben colgar también de esa asociación.
3. Decidir si seguimos vinculando comunidades `inactive` cuando el paraguas es claro.
4. Revisar el posible duplicado de Cloud Native Sevilla.
