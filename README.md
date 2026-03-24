<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Communities directory

Este proyecto identifica y visibiliza comunidades tecnológicas en España (activas e inactivas) para que **cualquier persona interesada descubra fácilmente las opciones disponibles y encuentre las que se ajustan a sus intereses.**

También actúa como punto de encuentro para quienes desean dinamizar comunidades, facilitando el contacto con aquellas que buscan nuevas personas en sus equipos organizadores.

Además, muestra qué comunidades ya están representadas en **Community Builders**.

[![Pantallazo de la app](./public/images/directorio-de-comunidades-tecnicas-de-españa-1280-800.webp)](https://combuilderses.github.io/communities-directory/)


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## 📖 Índice

- [¿Por qué este proyecto?](#por-qué-este-proyecto)
- [Instalación y uso en local](#instalaci%C3%B3n-y-uso-en-local)
- [Roadmap](#roadmap)
- [Licencias](#licencias)
- [Contribuir](#contribuir)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Por qué este proyecto

Este directorio puede ser útil en muchos escenarios:

**Si quieres crear o ayudar en una comunidad**:
- Te puede interesar unirte a una red con branding más fuerte o con un ecosistema más amplio.
- Puede ayudar a coordinar fechas y evitar solapes en grandes eventos del ecosistema.
- Puedes ver qué _organizaciones paraguas_ existen (como GDG, PyLadies, Cloud Native, ...) que ofrecen red de contactos, recursos, apoyo económico o simplemente *know-how*.
- Podrás encontrar comunidades con las que hacer sinergias o cocrear eventos.
- También te permite detectar comunidades que podrían reactivarse.

**Si estás buscando una comunidad en la que participar**:
- Es una forma rápida de descubrir comunidades (locales u online) que podrías haber pasado por alto.
- Útil si estás de viaje o te has mudado a otra ciudad y quieres encontrar comunidades allí.
- Pudiendo filtrar por ubicación y también por temática o tipo de actividad.

**Para quienes impulsamos comunidad**:
- Nos ayuda a tener una visión más global del ecosistema a nivel nacional.
- Nos permite conectar con comunidades actuales o antiguas, aprender de su experiencia.
- Podemos identificar personas interesadas en participar en encuentros presenciales de Community Builders.

> **Nota**: Puedes ver el hilo de correos donde explicamos el por qué del proyecto oficialmente por primera vez: [Listado de comunidades](https://groups.google.com/u/1/g/community-builders-es/c/agm4LEFrZco)

## Instalación y uso en local

Tan solo ejecuta:

```
git clone https://github.com/ComBuildersES/communities-directory.git
cd communities-directory
npm install
```

Y una vez hecho esto, puede arrancar el entorno de desarrollo con:

`npm run dev`

Esto iniciará la app en `http://localhost:5173` por defecto, donde podrás explorar el directorio interactivo.

Si vas a tocar `public/data/`, puedes comprobar el dataset manualmente con `npm run validate-data`. Además, `npm install` configura un hook local para validar las contribuciones antes de cada commit.

Para sanear URLs rotas o caídas:

```bash
npm run check-urls -- --report report.txt  # audita todas las URLs
npm run archive-broken-urls -- --dry-run   # busca snapshots en Wayback Machine
npm run archive-broken-urls                # aplica las URLs archivadas
```

## Contribuir
¿Te gustaría añadir una comunidad, mejorar datos existentes o proponer ideas?

Consulta la guía de colaboración → CONTRIBUTING.md

## Roadmap

Echa un vistazo a los *[milestones](https://github.com/ComBuildersES/communities-directory/milestones)* e *[issues](https://github.com/ComBuildersES/communities-directory/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen)* del proyecto.

## Licencias

* El código fuente está disponible bajo la licencia [Apache 2.0](./LICENSE).
* Los datos en el directorio `public/data/` están bajo la licencia [CC BY 4.0](./LICENSE.data).

## Contribuir

¿Quieres unirte? -> [CONTRIBUTING.md](https://github.com/ComBuildersES/communities-directory/blob/master/CONTRIBUTING.md)

Los issues y PRs automáticos de comunidades se asignan por provincia usando [`.github/community-owners.yml`](./.github/community-owners.yml). Si quieres ayudar a revisar una zona concreta, puedes ofrecerte en el [issue #53](https://github.com/ComBuildersES/communities-directory/issues/53).

Echa un vistazo a algunas de las tareas por las que podrías empezar a ayudar: 

[![GitHub issues by-label](https://img.shields.io/github/issues/ComBuildersES/communities-directory/good%20first%20issue)](https://github.com/ComBuildersES/communities-directory/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://manuelsaezcarmona.netlify.app/"><img src="https://avatars.githubusercontent.com/u/70754764?v=4?s=100" width="100px;" alt="Manuel Saez Carmona"/><br /><sub><b>Manuel Saez Carmona</b></sub></a><br /><a href="https://github.com/ComBuildersES/communities-directory/commits?author=manuelsaezcarmona" title="Code">💻</a> <a href="#research-manuelsaezcarmona" title="Research">🔬</a> <a href="#maintenance-manuelsaezcarmona" title="Maintenance">🚧</a> <a href="#design-manuelsaezcarmona" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alvarogtrzcliment"><img src="https://avatars.githubusercontent.com/u/124072319?v=4?s=100" width="100px;" alt="Álvaro Gutiérrez"/><br /><sub><b>Álvaro Gutiérrez</b></sub></a><br /><a href="https://github.com/ComBuildersES/communities-directory/commits?author=alvarogtrzcliment" title="Code">💻</a> <a href="#research-alvarogtrzcliment" title="Research">🔬</a> <a href="#maintenance-alvarogtrzcliment" title="Maintenance">🚧</a> <a href="#design-alvarogtrzcliment" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Aleixbs"><img src="https://avatars.githubusercontent.com/u/84009394?v=4?s=100" width="100px;" alt="Aleix Batlle"/><br /><sub><b>Aleix Batlle</b></sub></a><br /><a href="https://github.com/ComBuildersES/communities-directory/commits?author=Aleixbs" title="Code">💻</a> <a href="#research-Aleixbs" title="Research">🔬</a> <a href="#maintenance-Aleixbs" title="Maintenance">🚧</a> <a href="#design-Aleixbs" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.rauljimenez.info"><img src="https://avatars.githubusercontent.com/u/826965?v=4?s=100" width="100px;" alt="Raul Jimenez Ortega"/><br /><sub><b>Raul Jimenez Ortega</b></sub></a><br /><a href="#data-hhkaos" title="Data">🔣</a> <a href="#maintenance-hhkaos" title="Maintenance">🚧</a> <a href="#projectManagement-hhkaos" title="Project Management">📆</a> <a href="#ideas-hhkaos" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/andreamagan"><img src="https://avatars.githubusercontent.com/u/45942798?v=4?s=100" width="100px;" alt="Andrea Magán Rey"/><br /><sub><b>Andrea Magán Rey</b></sub></a><br /><a href="https://github.com/ComBuildersES/communities-directory/commits?author=andreamagan" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://yisus82.github.io/"><img src="https://avatars.githubusercontent.com/u/7774855?v=4?s=100" width="100px;" alt="Jesús Ángel Pérez-Roca Fernández"/><br /><sub><b>Jesús Ángel Pérez-Roca Fernández</b></sub></a><br /><a href="#data-yisus82" title="Data">🔣</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dzknl"><img src="https://avatars.githubusercontent.com/u/137705294?v=4?s=100" width="100px;" alt="Daniel"/><br /><sub><b>Daniel</b></sub></a><br /><a href="https://github.com/ComBuildersES/communities-directory/pulls?q=is%3Apr+reviewed-by%3Adzknl" title="Reviewed Pull Requests">👀</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

Las instrucciones para añadirte o añadir emojis de contribución a tu nombre están [en este *issue*](https://github.com/ComBuildersES/communities-directory/issues/22). 
