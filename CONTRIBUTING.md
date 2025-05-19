# Guía de contribución

¡Gracias por tu interés en contribuir! Este es un proyecto colaborativo y abierto. Puedes ayudar de muchas maneras, desde añadir nuevas comunidades hasta mejorar la web o el flujo automatizado.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Índice

- [Cómo nos organizamos](#c%C3%B3mo-nos-organizamos)
- [Cómo contribuir](#c%C3%B3mo-contribuir)
- [Revisión y mejora de datos](#revisi%C3%B3n-y-mejora-de-datos)
    - [Estructura de los datos](#estructura-de-los-datos)
    - [Formas de contribuir a los datos](#formas-de-contribuir-a-los-datos)
- [Mejorar el código o la web](#mejorar-el-c%C3%B3digo-o-la-web)
  - [Configuración del entorno de desarrollo](#configuraci%C3%B3n-del-entorno-de-desarrollo)
  - [Probar el repo en local](#probar-el-repo-en-local)
  - [Linting y estilo](#linting-y-estilo)
  - [Automatismos](#automatismos)
    - [Crear PR tras añadir comunidades](#crear-pr-tras-a%C3%B1adir-comunidades)
    - [Despliegue tras merge en master](#despliegue-tras-merge-en-master)
  - [Cómo contribuir con código](#c%C3%B3mo-contribuir-con-c%C3%B3digo)
  - [Estilo de commits](#estilo-de-commits)
- [Dudas](#dudas)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Cómo nos organizamos

- Usamos **[issues](https://github.com/ComBuildersES/communities-directory/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen)** para proponer mejoras, reportar errores, sugerir nuevas comunidades, etc.
- Los **[milestones](https://github.com/ComBuildersES/communities-directory/milestones)** nos ayudan a agrupar temas por objetivos.

## Cómo contribuir

Hay muchas maneras de participar, tanto si sabes programar como si no. Aquí van algunas ideas:

1. **Revisión y mejora de datos** [`🔣 data`]
    - Proponer una nueva comunidad [completando el formulario](https://github.com/ComBuildersES/communities-directory/issues/new?template=community_entry.yml).
    - Avisar si ves errores, duplicados o datos desactualizados.
    - Sugerir nuevas categorías o campos útiles para describir mejor cada comunidad.
        
1. **Mejorar el código o la web** [`💻 code`, `🎨 design`, `⚠️ test`, ♿️ `a11y`, `👀 review`, `🧑‍🏫 mentoring`]
    - Frontend, estilos.
    - Accesibilidad (`a11y`), navegación o UX, ...
    - Arreglar bugs.
    - Escribir y mejorar tests.
    - Revisar de código.
    - Mentorizar a otras personas que contribuyen.
        
1. **Proponer ideas de mejora** [`🤔 ideas`]
    - Pensar en formas de darle más visibilidad al proyecto.
    - Nuevas funcionalidades o formas de explorar comunidades.
    - Proponer cambios en el flujo de contribución o [automatismos](#automatismos).                

1. **Participar en conversaciones y debates** [`🗣️ talk`]
    - Preguntar, responder dudas, aportar experiencia o comentar propuestas en los _issues_.

1. **Dar visibilidad al proyecto** [`📣 promotion`, `📹 video`, `📝 blog`, `📢 talk`, `🔊 🔊`]
    - Escribir artículos, grabar vídeos, hacer charlas o podcasts.
    - Mencionar el proyecto en comunidades o redes.
    - Organizar o participar en eventos.

1. **Mejorar la documentación** [`📖 doc`]
    - Redactar o aclarar guías como esta.
    - Añadir ejemplos, capturas, referencias o esquemas.

1. **Reportar errores o bugs** [`🐛 bug`]
    - Ya sea en la web, en el fichero JSON o en los flujos automáticos.
        
1. **Ayudar a gestionar el proyecto** [`📆 projectManagement`]
    - Definir roadmap y priorizar tareas.     
    - Organizar issues y milestones.
    - Identificar mejoras transversales.

1. **Internacionalizar el proyecto** [`🌍 translation`]
    - Traducir la interfaz o documentación.
    - Preparar el terreno para ampliar a otros países.
    - Adaptar el lenguaje para una comunidad global.
    
---

## Revisión y mejora de datos

> *Es la forma más sencilla de empezar a contribuir, y sin necesidad de conocimientos técnicos.*

El núcleo del proyecto es el fichero [communities.json](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.json), donde se almacenan los datos de todas las comunidades. 

#### Estructura de los datos

Cada comunidad es un objeto con información clave como:

- Nombre de la comunidad
- Estado (activa/inactiva)
- Ciudad o región principal
- Tipo de comunidad (meetup, organización paraguas, etc.)
- Formato de eventos (presencial, online, híbrido)
- Temáticas
- URL principal
- Imagen/logo

#### Formas de contribuir a los datos

Puedes colaborar con los datos de varias formas:

- Uniéndote a [las personas que quieran ayudar a mantener las comunidades de cada provincia](https://github.com/ComBuildersES/communities-directory/issues/53).
- Desde la web de GitHub, edita directamente [communities.json](https://github.com/ComBuildersES/communities-directory/blob/master/public/data/communities.json) y envía un PR.
- Crea un _issue_ describiendo los cambios sugeridos: correcciones, mejoras, comunidades a eliminar, normalización de campos, etc.
- Sugiere datos de alto valor que podrían añadirse.
- Buscar formas de mejorar el procesamiento automatizado y validación  de datos (nombres normalizados, detección de duplicados...).
- Comparte ideas sobre cómo mantener clasificar comunidades por temáticas o tecnologías.
- Cambios en la estructura del JSON para facilitar su reutilización en otras aplicaciones.

---
## Mejorar el código o la web

### Configuración del entorno de desarrollo

Clona el repositorio:

```
git clone https://github.com/ComBuildersES/communities-directory.git
cd communities-directory
```

Instala las dependencias:

```
npm install
```

> **Nota**: Asegúrate de tener Node.js 20 instalado.

Ejecutar el entorno local:

```
npm run dev
```

Esto abrirá la aplicación en `http://localhost:5173` por defecto (puede variar según el puerto libre).

### Probar el repo en local

- Para desarrollar en local usa `npm run dev`
  - Los cambios se ven reflejados en tiempo real en el navegador al modificar el código.
- Para probar el build en local usa `npm run build-preview`

### Linting y estilo

- Usamos ESLint con configuración personalizada (`eslint.config.js`) y plugins para React y hooks.
- Ejecuta `npm run lint` para verificar que todo esté bien antes de hacer un PR.

### Automatismos

#### Crear PR tras añadir comunidades

Al crear un issue con la etiqueta `nueva-comunidad`, se ejecuta `create-community-entry.yml`, que:
- Procesa el issue.
- Genera los datos y la imagen.
- Abre un PR con los cambios en `public/data/communities.json`.

#### Despliegue tras merge en master

Cada push a `master` activa `deploy.yml`, que:
- Instala dependencias
- Genera el sitio con Vite.
- Publica el contenido de `/dist` en GitHub Pages.

###  Cómo contribuir con código

Empieza por crear un fork.

Luego crea una nueva rama:
```
git checkout -b tu-nombre/mejora-o-fix
```

Haz tus cambios y súbelos:
```
git commit -m "feat: mejora en el filtrado por ciudad"
git push origin tu-nombre/mejora-o-fix
```

Y por último abre un Pull Request

Explica brevemente qué has cambiado y si cierra o está relacionado con un issue.

> 💬 Usa el formato `Closes #xx` para vincular el PR al issue correspondiente.

### Estilo de commits

Usamos una convención ligera basada en `type: descripción`. Ejemplos:

```
feat: añadir filtro por ciudad
fix: corregir error al cargar imágenes
docs: mejorar instrucciones en README
```

## Dudas

Usa los issues también para abrir debates, sugerencias, propuestas…  

Nos organizamos y comunicamos abiertamente por allí.