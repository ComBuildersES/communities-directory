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
    - [Convenciones de datos](#convenciones-de-datos)
      - [Qué comunidades tienen cabida en el repo](#qu%C3%A9-comunidades-tienen-cabida-en-el-repo)
      - [Quién revisa los datos](#qui%C3%A9n-revisa-los-datos)
      - [Taxonomía de comunidades](#taxonom%C3%ADa-de-comunidades)
      - [Estado de las comunidades](#estado-de-las-comunidades)
      - [Tipos de eventos](#tipos-de-eventos)
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

#### Convenciones de datos

##### Qué comunidades tienen cabida en el repo

Cualquier comunidad tech (que gire en torno a la informática, software, hardware, datos, ...), aunque es cierto que a veces hay comunidades que pueden generar dudas, por eso hemos [abierto este issue al respecto](https://github.com/ComBuildersES/communities-directory/issues/62)

##### Quién revisa los datos

Tenemos una lista de [personas voluntarias que se encargar de revisar los PRs](https://github.com/ComBuildersES/communities-directory/issues/53) a las que puedes solicitar unirte si quieres.

##### Taxonomía de comunidades

Actualmente estos son los diferentes tipos de comunidades:

|Tipo de comunidad|Definición. ¿Qué caracteriza a este tipo de comunidad?|Ejemplos|
|---|---|---|
|Tech Meetup|Realiza encuentros periódicos (presenciales u online) normalmente varios al año, con el objetivo de compartir conocimientos en formato charla. Los eventos rara vez llegan a las 100 personas. Cuando son en presencial, suelen finalizar organizando un networking|Arcasiles Community Madrid, [Azure Malaga](https://www.meetup.com/azuremalaga/), [PyData Granada](https://linksta.cc/@PyDataGRX) / [Madrid](https://www.meetup.com/PyData-Madrid/), [Madrid JUG](https://www.meetup.com/es-ES/madridjug/)...
|Conferencia|Encuentro normalmente anual, en el que se reunen muchas personas y hay varios ponentes. Puede haber múltiples tracks en pararlelo y normalmente la logística es más compleja|[CommitConf](https://www.commit-conf.com/), [Codemotion](https://conferences.codemotion.com/madrid2024/), [CodeRioja](https://www.coderioja.com/)
|Organización paraguas|Es un tipo de organización que agrupa a múltiples comunidades. Esta comunidades normalmente son locales, comparten una marca, un propósito, y la organización paraguas dan apoyo a las nuevas comunidades con recursos, manuales, presentación y a veces financiación|[Python España](https://es.python.org/), [GDG Spain](https://gdg.es/), [PyData](https://pydata.org/), [OWASP](https://owasp.org/chapters/)...
|Hacklab|O FabLab, es un un tipo de comunidad normalmente más vinculada al movimiento maker. Normalmente cuenta con un espacio físico, cedido, alquilado o propiedad de la comunidad donde se encuentran recursos hardware y donde la comunidad se reúne|[Makespace Madrid](https://makespacemadrid.org/), [Made Makerspace](https://www.made-bcn.org/en), [La Jaquería](https://lajaqueria.org/)...
|Grupo colaborativo|Personas que se organizar para colaborar **en diferentes proyectos de interés común**. Puede ser organización de charlas, conferencias, desarrollo de proyectos, escribir artículos de blog, ofrecerse ayuda mutua, ... o todas ellas a la vez|[Step4ward](https://step4ward.es/), [Adopta un Junior](https://adoptaunjunior.es/), [AtlanTICs](https://asociacionatlantics.org/)...
|Meta comunidad|Es una organización que agrupa a personas que representan/dinamizan otras comunidades para colaborar en uno o varios proyectos de interés común|[Community Builders](https://github.com/ComBuildersES), [Granada Tech](https://www.granadatech.org/), [Vigo Tech Alliance](https://vigotech.org/)...
|Grupo de ayuda mutua|Se caracteriza porque el objetivo principal es ayudarse mutuamente. Si una persona tiene un problema, tiene un mecanismo de contacto a través del cual contactar con el resto de personas de la comunidad y pedir ayuda. Los canales pueden ser foros, listas de correo, canales de mensajería instantánea, etc.|[BCN Engineering](https://bcneng.org/), [Midudev Discord](https://discord.com/invite/midudev), [Sysarmy Galicia](https://www.sysarmygalicia.com/), [TechShessions](https://techshessions.com/)...

¿Puede una comunidad ser etiquetada con dos tipos de comunidades? Actualmente no, aunque [este aspecto y la propia taxonomía está siendo revisada](https://github.com/ComBuildersES/communities-directory/issues/63).

##### Estado de las comunidades

Actualmente usamos tres tipos:

* **Activa**: si hay personas activas dinamizando y han estado haciendo cosas "recientemente"
* **Inactiva**: 
  * En el caso de Meetups se considera inactiva si lleva más de un año sin actividad
  * En el caso de Conferencias más de la cadencia habitual (dependiendo el histórico), si es una Conferencia nueva, si lleva dos años o más sin convocarse.
* **Desconocido**: si no lo tenemos claro

> **Nota** [esto está siendo revisado](https://github.com/ComBuildersES/communities-directory/issues/63).

##### Tipos de eventos

* **Presencial**: comunidades que tienen encuentros presenciales con cierta periodicidad y **no suelen retransmitir sus eventos en directo**.
* **Online**: comunidades cuyo foco de la actividad es principalmente online.
* **Híbridos**: comunidades que celebran encuentros presenciales con cierta periodicidad y que **suelen retransmitir sus eventos**.
* **Desconocido**: no tenemos muy claro sus dinámicas

> **Nota** [esto está siendo revisado](https://github.com/ComBuildersES/communities-directory/issues/63).

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