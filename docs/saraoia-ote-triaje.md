# Triaje del feed OTE de Sarao IA (`saraoia.com/eventos-ote.json`)

Fecha: 06/11/2026 · Feed: 189 eventos, 151 cadenas de organizador distintas.

Criterios aplicados: los de [#62](https://github.com/ComBuildersES/communities-directory/issues/62).
Las descartadas están enumeradas con enlaces en el issue #445. Se descarta lo que es canal unidireccional, evento aislado sin comunidad detrás, actividad
cerrada, promoción puramente comercial o sin conexión real con la tecnología.

## Añadidas (22)

Comunidad con actividad recurrente, abierta y con home verificada:

| Comunidad | Ciudad | URL |
|---|---|---|
| AWS User Group Madrid | Madrid | meetup.com/madrid-amazon-web-services-meetup |
| AWS User Group Barcelona | Barcelona | meetup.com/barcelona-amazon-web-services-meetup |
| AWS User Group Galicia | A Coruña | meetup.com/aws-ug-galicia |
| PyLadies Valencia | Valencia | meetup.com/pyladies-valencia |
| ProductTank Madrid | Madrid | meetup.com/producttank-madrid |
| The Vibe Coding Club Madrid | Madrid | meetup.com/the-vcc |
| AI Tinkerers Valencia | Valencia | valencia.aitinkerers.org |
| Innovators Hub Sevilla | Sevilla | meetup.com/innovatorshubsevilla |
| Everything Everywhere All with kdb+/q | Madrid | meetup.com/everything-everywhere-all-with-kdb-q |
| Barcelona Tech Talks | Barcelona | meetup.com/barcelona-tech-talks |
| InterSystems Developers Spain | Madrid | meetup.com/intersystems-developers-spain |
| Fuengirola Technology & Social Meetup Group | Málaga (Fuengirola) | meetup.com/fuengirola-technology-social-meetup-group |
| Ladies that UX Málaga | Málaga | luma.com/j7v1t5g5 |
| femCoders Club | Barcelona | femcodersclub.com |
| Women in Tech Málaga | Málaga | meetup.com/women-in-tech-malaga |
| GeeksCAT | Girona | geeks.cat |
| LleidaHack | Lleida | lleidahack.dev |
| Cascarilla Tech | A Coruña | cascarillatech.org |
| Quantum Madrid | Madrid | meetup.com/quantummadrid |
| Barcelona AI Music Meetup (BAMM) | Barcelona | eventbrite.com/o/barcelona-ai-music-meetup-91172550453 |
| Club Sintético | Madrid | clubsintetico.org |
| Claude Community Barcelona | Barcelona | claudebcn.com (parentId 627) |

Logos: `public/images/<slug>.webp`, descargados de la home o del grupo de Meetup y
optimizados con el mismo pipeline que `process-community-issue.js`. Tres son foto de grupo de
Meetup en vez de logo (AWS User Group Madrid, AWS User Group Barcelona, Women in Tech Málaga)
y conviene sustituirlos si la comunidad facilita el suyo.

Todas entran con `id: null` (lo asigna `assign-community-ids` en master) y
`humanValidated: false`: los datos vienen de investigación web, no de contacto con la
comunidad.

Zonas grises asumidas al añadirlas:
- **Innovators Hub Sevilla**: perfil startup/emprendimiento además de tech (#62, caso 1).
- **Fuengirola Tech & Social**: mezcla tech y social, en inglés, comunidad de residentes.
- **Club Sintético**: creativos que trabajan con IA generativa (#62, caso 1).
- **InterSystems Developers Spain**: comunidad de producto de fabricante, igual que las de
  MuleSoft o Elastic que ya están en el directorio.

## Pendientes de decisión

Encajan a medias o no tienen home estable que enlazar:

- **Mad Tech Campus** (Madrid) — eventos recurrentes de comunidad (Club Tech,
  Planet-In-The-Loop) pero el soporte es un campus/espacio comercial.
- **Hi Coruña / Human Intelligence Hub** (A Coruña) — talleres y charlas recurrentes sobre
  una plataforma comercial.
- **Madrid Innovation Lab** (milmadrid.es) — programa público municipal con agenda
  recurrente; no es comunidad autogestionada.
- **UXPA España** — capítulo real de UXPA, pero `uxpaspain.org` no resuelve; sin URL viva no
  se puede dar de alta.
- **n8n Barcelona** — meetups recurrentes en el Canòdrom, sin home propia (calendario global
  `luma.com/n8n-events` + `community.n8n.io`).
- **BCN Data Nights** (Barcelona) — comunidad de datos activa, sin página canónica propia.
- **Claude Community Valencia** — solo eventos sueltos en Luma; Barcelona y Madrid sí tienen
  home. Mismo caso: **Madrid AI Builders** (conviven varios grupos de nombre parecido).
- **Helmcode / NaN Builders** — comunidad promovida por Helmcode S.L.
- **Comunidades de IA muy nuevas, 1 evento en el feed**: Gremio, Happy Operators,
  Humans in the Loop (DevExpert), AAIF Community Madrid, Barcelona AI in Energy,
  iaS / AI Safety Group Valencia, Women in Tech x SheAI, Women behind AI,
  GenAI Community, AI Builders Barcelona, MadAi, Genome, Design Dialogues,
  Product People, BARRACA, SpaceXAI Málaga / Madrid (Grok Bot).
- **Grupos universitarios**: AWS Student Builder Group (U. Europea de Andalucía),
  Associació d'Estudiants de Dades (FME-UPC), ETSII Universidad de Sevilla, IDEAS UPV,
  CDTM Valencia, PMI Barcelona Student Clubs, El nexo San Vicente.
- **Conferencias y programas**: DOK Summit (Bilbao), ADCE Creative Week, Dev Days (GitHub),
  Digital Jove (programa público valenciano).
- **Capítulos de comunidades ya presentes**: Codex Community Valencia (hijo de Codex
  Community, id 632), Elastic Barcelona, Barcelona JUG (ya está), Mulesoft Barcelona (ya).

## Descartadas

- **Empresas y consultoras que organizan sus propios eventos**: Metabase, Runroom, Devoteam,
  Plain Concepts, DXC, Shakers, InnoIT Consulting, isolutions, ERNI, Itnig, Elastic+Gigamon,
  Red Hat+NVIDIA (vLLM), FOXTER, PATIO Campus, anyformat, Nucleate, Damm (LAB1876),
  BAT (Bizkaia Accelerator Tower), Prosper AI, Sovrano AI, IE University, Embajada de
  Francia, Viaró Alumni, Nueva Acrópolis, MADRIKINA, Madrid Emprende, Devoteam.
- **Personas a título individual**: Jordi (AI Networking Málaga), Sebastián Borreani,
  Neil Casagan y Sarah Malinowski, Alicia Larrazabal.
- **Hackathones y retos puntuales sin comunidad detrás**: NASA Space Apps (9 sedes),
  DATAMAD, Extrejam (IRIA), EuriChallenge, Hackathon de Tecnologías Accesibles (Alicante),
  Physical AI Hackathon Bilbao, HackIAmm, Hackathon Lláscares (ASATA),
  1hack AI Weekend (The Atlantic Community), TECHLAB II (SIC4Change).

## Ya estaban en el directorio

Startup Oasis, AI Engineers Barcelona, GDG Marbella, HackBarna, Yes We Tech, Málaga-AI,
Power BI & Fabric Málaga, AWS User Group Sevilla, Python Coruña, GPUL, CoruñaJUG,
Coruña WTF, Fullstack Sevilla, Hacking Sevilla, Madrid DevOps, WordPress Bilbao /
Granollers / Málaga, Flutter Málaga, Hack & Beers, Codex Community, Claude Community
Ambassadors, Claude Madrid, GitHub Community Spain, Tech Riders, Tech Barcelona,
Data Saturdays Madrid, Women Techmakers Barcelona, Barcelona Java User Group,
Mulesoft Barcelona, Elastic Local Meetups, Latinas in Tech Madrid, Ladies that UX (global),
Codebar, Yes We Tech, GDG Málaga.

## Reproducir el triaje

```bash
curl -sL https://saraoia.com/eventos-ote.json -o /tmp/saraoia.json
# agrupar por organizers[].name y cruzar contra data/communities/ por nombre y por URL
```
