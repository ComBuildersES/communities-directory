# Handoff de las mejoras de UI

Actualizado: 13 de noviembre de 2026.

## Criterios de aceptación para todas las entradas

Estas son **correcciones del usuario que deben trasladarse a la siguiente implementación**, no recomendaciones opcionales ni solo un registro de cómo se hizo la primera. Leer este bloque y `AGENTS.md` antes de continuar. El recurso concreto se adapta al objetivo; el idioma, el enfoque visual, el público técnico, la brevedad y la pausa de revisión deben mantenerse.

| Corrección | Cómo aplicarla |
| --- | --- |
| No traducir todavía; afecta a toda la aplicación. | Solo español hasta terminar todas las fases. No editar inglés ni generar capturas inglesas para cerrar cada entrada. Las traducciones parciales anteriores no obligan a seguir traduciendo. |
| El contenido es demasiado denso y cuesta recorrerlo. | Reducir primero lo que merece explicarse. Usar bloques bien diferenciados y detalle progresivo, con acordeones y resúmenes breves cuando corresponda. No mostrar todos los párrafos a la vez. |
| Faltan imágenes para reconocer los controles. | Al mostrar un control o flujo, incluir una captura real: frase breve → captura → CTA. Reutilizar `public/images/guide/search-es.webp` o `filters-es.webp` si ilustran el paso, o capturar la interfaz actual en español. No reemplazar las capturas por más prosa ni por una interfaz dibujada. Para contenido conceptual, adaptar el apoyo visual si una captura no aporta. |
| El público es técnico y las explicaciones obvias sobran. | Centrarse en posibilidades poco visibles. No añadir tutoriales de copiar, pegar o adjuntar, ni bloques sobre recuentos, quitar etiquetas y abrir fichas. El botón de ayuda permite ampliar. |
| La mayoría de filtros se explican solos. | Una lista breve con los matices útiles, no un párrafo por opción. Reutilizar los tooltips del panel para explicar tipos y disponibilidades. |
| Han faltado márgenes varias veces. | Comprobar el espacio real antes y después de los párrafos y entre estos, capturas, selectores, prompts y acciones; también en móvil. Una declaración `margin` no basta como verificación. |
| El selector debe mostrar nombres, no rutas. | Etiquetas descriptivas con la URL copiable aparte. El selector aprobado tiene cinco recursos: índice, Markdown y comunidades en JSON, CSV y GeoJSON. No volver a añadir esquema, tags ni audience ahí sin petición. |
| La IA aporta búsqueda semántica o entrevista, no un tutorial básico. | Presentar los prompts como ejemplos ilustrativos, con margen antes de los bloques. Omitir las instrucciones de descarga/adjunto y el roadmap en estos recorridos. |
| No repetir licencia ni catálogos en ambos idiomas en los prompts. | Licencia en reutilización; catálogos del idioma de la interfaz en los prompts. Mantener las reglas que evitan inventar datos. |
| La búsqueda por localización en un prompt no es fiable salvo coincidencia exacta. | No deducir cercanía, radios ni equivalencias por nombres. Explicar los límites y remitir al mapa para explorar la zona. Sus tarjetas se actualizan según la extensión visible; eso no filtra el listado general. |
| Decidir qué tipo de comunidad conviene es demasiado atrevido. | Descubrir y comparar dinámicas, como hacklab frente a meetup. No clasificar a la persona ni descartar tipos por su perfil; tampoco inferir frecuencias, ofertas abiertas ni plazas por el tipo de comunidad. |
| Revisar una entrada cada vez y aplicar el feedback a la siguiente. | Completar la entrada actual, validar estos criterios y parar. No reabrir la entrada aprobada ni avanzar a la siguiente sin revisión. |

Antes de entregar, revisar expresamente: **solo español; apoyo visual para los controles explicados; ausencia de prosa obvia; espaciado real; acciones y prompts verificados; pausa para revisión**. Registrar lo pendiente y justificar las adaptaciones al contenido. No hace falta pedir de nuevo aprobación para aplicar lo ya acordado.

## Punto de continuación

«Descubrir comunidades» (antes «Encontrar mi comunidad») y la fase 1 están aprobadas. **«Aportar a una comunidad» está implementada solo en español y pendiente de revisión del usuario. Parar para revisión; no avanzar automáticamente a «Dinamizo una comunidad».**

La sexta entrada «Construir con los datos» ya está en el menú y abre «Construyo con los datos», igual que el enlace del pie. Su revisión específica de contenido sigue pendiente. Los otros nuevos rótulos son «Descubrir comunidades», «Descubrir a otras personas que dinamizan comunidades» y «Mejorar este directorio»; corresponden a los mismos recorridos e IDs anteriores.

Bajo «Qué puedes hacer aquí» se ha añadido una introducción común para asistentes, ponentes, personas que dinamizan y quienes crean herramientas o análisis; destaca **open data** en negrita. El paréntesis se retira de «Mejorar este directorio». El usuario pide hacer commit del trabajo de esta sesión y no volver a ejecutar tests después de este último cambio de texto; la última suite previa pasó con 497 tests.

El alcance y el inventario de contenido siguen en [el plan temporal](plan-temporal-mejoras-ui.md). Este handoff recoge el estado final y los aprendizajes; el registro cronológico del plan contiene versiones anteriores que ya se han sustituido. Las decisiones más recientes del usuario prevalecen sobre el inventario inicial.

**No borrar el plan** hasta terminar todas las fases y realizar la revisión final con el usuario. Esta aprobación cierra una entrada, no la fase 2 ni el proyecto completo.

## Acuerdos que se deben mantener

- Trabajar **solo en español en toda la aplicación** hasta terminar todas las fases. Completar y revisar el inglés al final. Hay traducciones parciales de esta sesión, anteriores a esa indicación: son provisionales, no una referencia editorial definitiva.
- El público es técnico. La guía debe mostrar posibilidades y opciones poco visibles, sin enseñar lo obvio ni convertirse en un manual. El botón de ayuda cubre las dudas adicionales.
- Entrar en un objetivo muestra información; no debe aplicar filtros ni abrir herramientas automáticamente. Las acciones deben ser explícitas y usar los controles existentes.
- Conservar el contenido al reorganizarlo. Las retiradas y reescrituras solicitadas expresamente por el usuario sí están autorizadas y están registradas en el plan.
- Mantener los cambios locales ajenos. No hacer commits, pushes ni despliegues como parte de este handoff.

## Lo que aprendimos de la primera entrada

### Contenido y presentación

Una lista de párrafos con encabezados resultó demasiado densa. Añadir bordes no bastó: también hizo falta reducir el contenido y decidir qué merecía explicarse.

El resultado aprobado tiene tres bloques de acordeón: búsqueda, filtros y mapa. Solo el primero empieza abierto; abrir otro cierra el anterior, y se pueden cerrar todos. Los encabezados muestran un icono, título y resumen corto. Las pestañas separan «Con el directorio» y «Con ayuda de IA».

- Una frase útil, una captura real cuando aporta contexto y un CTA funcionaron mejor que explicar cada control.
- El buscador se ilustra con «mad» y su desplegable. Los filtros tienen una captura y tres viñetas sobre combinar criterios, el estado inicial y la disponibilidad para aportar.
- Las explicaciones de recuentos, quitar etiquetas y consultar una ficha se retiraron por obvias.
- La orientación sobre los siete tipos de comunidad pasó a iconos de información dentro del propio panel de filtros. La ayuda contextual evita repetirla en el tour.
- Las capturas tienen texto alternativo y enlace para ampliarlas. En móvil una captura completa de escritorio sirve para reconocer el control, pero necesita ampliación para leer el detalle.
- Comprobar los márgenes **entre elementos reales**, no solo una declaración CSS: el espaciado antes de párrafos, selectores y prompts necesitó varias correcciones. En la vista de IA aprobada hay 20 px antes del párrafo de datos y 12 px entre este y el selector.

La estructura se adapta al objetivo; las correcciones de la tabla inicial deben aplicarse. En particular, no volver a presentar una explicación de controles solo como prosa: acompañarla de capturas reales, reutilizadas o nuevas. Adaptar el recurso cuando no se describa una interfaz concreta. Tampoco explicar las siete disponibilidades con siete párrafos si basta la ayuda contextual existente.

### IA y datos

La pestaña de IA explica que una búsqueda semántica o una entrevista con un agente pueden aportar algo distinto a los controles de la web. No explica cómo adjuntar archivos ni incluye referencias de roadmap.

- El selector ofrece cinco recursos con **nombres descriptivos**: índice para agentes (`llms.txt`), directorio completo en Markdown (`llms-full.txt`) y comunidades en JSON, CSV y GeoJSON.
- La URL aparece aparte y se puede copiar. Usar URLs de producción al compartir con agentes: no pueden entrar en el servidor local. El selector no contiene esquema, tags ni audience; siguen accesibles donde corresponden en reutilización y en los prompts.
- Los prompts son ejemplos ilustrativos para un público técnico, con separación visual respecto al párrafo anterior.
- Los ocho prompts españoles omiten menciones a la licencia; esta sigue accesible en la interfaz de reutilización. Las reglas enlazan los catálogos del idioma de la interfaz, sin duplicarlos en ambos idiomas. El inglés de estas reglas se revisará al cierre.
- La búsqueda por localización textual solo se presenta como fiable con coincidencia exacta. No inferir proximidad, radios ni equivalencias entre lugares por sus nombres. No prometer una búsqueda geográfica exhaustiva cuando faltan datos.
- El antiguo «Qué tipo de comunidad me conviene» ahora es **«Descubrir tipos de comunidades»**: compara dinámicas y formas de participar que pueden pasar inadvertidas, sin decidir qué tipo conviene a alguien ni descartar otros por su perfil.
- Conservar las reglas que evitan inventar datos: campos vacíos, revisión humana, canales archivados, disponibilidad declarada, significado de los feeds, etc.

El mapa sí actualiza **las tarjetas de su propia vista** según la extensión visible al terminar de moverlo. No confundirlo con filtrar el listado general. No se han añadido filtros de radio ni distancia.

## Implementación actual y piezas reutilizables

| Fichero | Papel / precaución |
| --- | --- |
| `src/components/DirectoryGuideModal/DirectoryGuideModal.jsx` | Menú de seis entradas, navegación, cierre, foco y acciones hacia los controles existentes. `EXISTING_TABS` deriva solo organización, mejora y reutilización al modal anterior; «Aportar» ya tiene vista propia. |
| `src/components/DirectoryGuideModal/ContributeCommunityGuide.jsx` | Recorrido de aportaciones: siete chips con contadores, nota previa sobre cobertura del dato y CTA explícito que sustituye solo `openTo`, ayuda de disponibilidad y pestaña IA con `speaker` / `volunteer`. |
| `src/components/DirectoryGuideModal/FindCommunityGuide.jsx` | Vista aprobada del directorio. `GuideSection` y `GuideScreenshot` se exportan y comparten con aportaciones; no se altera la vista aprobada. |
| `src/components/DirectoryGuideModal/FindCommunityAiGuide.jsx` | Vista aprobada de IA. Selector de datos, copia de URL y dos prompts. `DataSourcePicker` se exporta y se comparte con el recorrido de aportaciones. |
| `src/components/DirectoryGuideModal/DirectoryGuideModal.css` | Estilos del menú, acordeones, capturas, selector y espaciado. Reutiliza la base de estilos de OpenDataModal. |
| `src/components/OpenDataModal/OpenDataModal.jsx` | Conserva el contenido todavía pendiente de reubicar. Exporta `PromptList`, que interpola reglas y URLs y usa los bloques copiables existentes. Permite pestaña inicial y regreso al menú. |
| `src/components/OpenToOptions.jsx` | Exporta `InfoTooltip`, reutilizado para disponibilidad y tipos; soporta puntero, foco, clic, Escape y posicionamiento en pantalla. Evitar crear otra implementación equivalente. |
| `src/components/FilterPanel.jsx` | Incluye los tooltips de tipos. Es enfocable para recibir el foco tras el CTA de la guía. |
| `src/lib/communityOpenTo.js` | Opciones y disponibilidad declarada. El panel solo ofrece valores presentes en los datos. La guía muestra los siete chips y usa `countOpenToOptions()` sobre el contexto filtrado, con ceros desactivados. No inferir disponibilidad. |
| `src/stores/community.store.js` | Filtros y acciones existentes. Antes de tocarlos, revisar también `src/data/invertedindex.js` y `src/data/searchFaceted.js`. |
| `src/i18n/locales/es.json` | Textos de la guía en `directoryGuide`, prompts/reglas en `openData.prompts` y ayuda de tipos en `sidebar`. Modificar solo español durante estas fases. |
| `public/images/guide/` | Capturas reales, WebP con densidad doble: buscador a 960 px, filtros a 1280 px. Se capturaron también versiones inglesas antes de aplazar la traducción. |
| `tests/directoryGuide.test.jsx` | Menú, estructura, capturas, ayuda contextual y selector. |
| `tests/openDataPrompts.test.js` | Contratos de los prompts y reglas; incluye las nuevas restricciones en español. |
| `tests/directoryLayout.test.jsx` | Cabecera y agrupación del recuento con filtros activos. |

No depender de los scripts de QA o capturas de `/tmp`: son auxiliares de esta sesión, no parte del repositorio.

## Última revisión de «¿Cómo quieres aportar?»

Los siete bloques internos se han sustituido por chips consecutivos con contador y etiquetas en gerundio. Van precedidos por «Ver comunidades en las que pueda aportar:» y una nota diferenciada: `openTo` es nuevo y está poco cumplimentado; dato ausente significa disponibilidad desconocida, no rechazo; declararlo no garantiza C4P, convocatoria ni plaza, y se anima a contactar para participar.

Los contadores respetan los demás filtros activos e ignoran el `openTo` previo, para coincidir con el resultado de cada chip. Los ceros se muestran desactivados; los demás aplican el filtro al pulsarlos. Las descripciones siguen en tooltips. «Explorar el mapa» conserva su botón con tooltip. Se mantiene la captura real de filtros y la pestaña de IA aprobada para este recorrido. El usuario aún debe revisar esta entrada; no avanzar a la siguiente.

## Alcance de Aportar (implementado, pendiente de revisión)

Para «Aportar a una comunidad», consultar el checklist del plan y el contenido existente antes de maquetar:

1. Ofrecer caminos para charlas, coorganización, voluntariado, mentoría, patrocinio, espacios y colaboración entre comunidades. Decidir cuánto explicar según lo que ya deja claro la interfaz.
2. Conectar las acciones a `openTo` y mantener el contexto de búsqueda pertinente. Revisar el comportamiento real de los filtros antes de decidir cómo combinar o sustituir criterios.
3. Explicar el matiz importante: disponibilidad declarada no equivale a búsqueda urgente, C4P abierto ni plaza garantizada. Dato ausente significa sin información, no rechazo. La persona debe poder contactar y confirmar con la comunidad.
4. Reubicar los prompts existentes `speaker` y `volunteer`. Revisarlos con el criterio editorial acordado: evitar promesas de frecuencia o disponibilidad inferidas por el tipo de comunidad, y respetar los límites de ubicación. No inventar prompts de mentoría, patrocinio o espacios como si ya existieran.
5. Retirar la derivación provisional de `contribute` a la pestaña anterior cuando su sustituto esté completo. Mantener accesible el resto del contenido pendiente.
6. Validar, actualizar el checklist y **parar para revisión**. No implementar «Dinamizo una comunidad» en esa misma tanda.

## Validación y estado del espacio de trabajo

Validación de «Aportar a una comunidad» tras revisar los acuerdos activos: **497 tests Vitest y dos pruebas de navegador pasan**, lint de componentes y pruebas modificados correcto. Comprobaciones en español a 1440 y 390 px: acordeones, captura ampliable, siete opciones y ayuda contextual, ausencia de disponibilidad, entrada sin efectos y chips que aplican explícitamente la aportación, conservación de filtros de temática/idioma/estado al sustituir `openTo`, copia completa de los dos prompts con reglas y URLs interpoladas, pestañas con teclado, retorno al menú, cierre y foco. Las descripciones de las acciones reutilizan `InfoTooltip` y los textos de disponibilidad del panel; se consultan a petición. Escape cierra primero la ayuda y después el modal. La regresión se verifica con `node --test tests/browser/contributeGuide.browser.mjs` (requiere la app local arrancada). Build final registrado en el plan. Se mantiene pendiente la revisión del usuario.

Referencia de la última implementación aprobada («Encontrar»): **490 tests pasan**, lint de los archivos modificados correcto y build de producción correcto. Se comprobaron en español, a 1440 y 390 px, los márgenes, nombres de los cinco formatos, URLs copiadas y contenido exacto de los prompts. En iteraciones previas también se verificaron capturas, tooltips, acciones, teclado, Escape y retorno de foco.

- Ejecutar las comprobaciones pertinentes tras la siguiente implementación: `npm test`, lint de los ficheros modificados y `npm run build`. No repetir builds por cambios exclusivamente documentales.
- El lint global tenía errores previos ajenos a este trabajo y una advertencia existente en `src/App.jsx`; no confundirlos con regresiones propias ni corregirlos sin relación con el alcance.
- El build de ArcGIS puede tardar varios minutos. Dejarlo terminar; no arrancar dos builds sobre `dist/` en paralelo.
- Existe una observación pendiente del grid a 320 px, fuera de los bloques modificados, para la revisión responsive posterior.
- La validación visual integral del mapa y la auditoría final de accesibilidad y de inglés siguen pendientes en la fase 5.
- Preferir `127.0.0.1:4173` para QA; comprobar qué proceso sirve la app y que coincide con el código en disco. No cerrar un servidor ajeno. El puerto 5173 puede estar interceptado por VS Code.
- Hay cambios de esta implementación sin commit y documentos locales ajenos. Leer `git status` antes de editar; no hacer limpieza general, revertir ni añadir todos los ficheros indiscriminadamente. Los documentos de contactos, invitaciones y automatización n8n no pertenecen a esta tarea.
- Si se automatizan cambios de JSON, distinguir claves raíz de claves homónimas anidadas: `heading.openData` es una cadena, mientras que `openData` es el objeto del modal. Una sustitución textual no anclada causó un error que los tests detectaron y ya está corregido.

## Mensaje para iniciar la siguiente sesión

En una sesión ya abierta, pedir primero: «Relee los acuerdos activos de `AGENTS.md` y los criterios de aceptación al principio de `docs/handoff-mejoras-ui.md`. Aplícalos al trabajo actual: solo español en toda la aplicación hasta el cierre; capturas reales para mostrar controles y flujos; ayuda breve para perfiles técnicos; detalle progresivo y márgenes comprobados. Conserva el trabajo local y para para revisión antes de avanzar a otra entrada».

> Revisa «Aportar a una comunidad», implementada solo en español. No avances sin revisar esta entrada. Continúa las mejoras de UI desde `docs/handoff-mejoras-ui.md` y `docs/plan-temporal-mejoras-ui.md`. «Encontrar mi comunidad» está aprobada. La implementación y su checklist están actualizados en el plan. Conserva el contenido y los cambios locales ajenos; espera la revisión antes de pasar a otra entrada. No borres el plan ni traduzcas al inglés todavía.
