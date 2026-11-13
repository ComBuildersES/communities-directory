# Handoff de las mejoras de UI

Actualizado: 13 de noviembre de 2026.

## Punto de continuación

El usuario ha dado por terminada y aprobada **«Encontrar mi comunidad»**, primera entrada de la fase 2. La fase 1 también está revisada. La siguiente sesión debe implementar **solo «Aportar a una comunidad»**, validar y parar para revisión. No avanzar automáticamente a la siguiente entrada.

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

Estos patrones son referencias, no una plantilla obligatoria. En la siguiente entrada, decidir primero qué contenido merece existir; usar acordeones, pestañas, capturas o tooltips solo donde ayuden. No añadir una captura por sistema ni explicar las siete disponibilidades con siete párrafos si basta la ayuda contextual existente.

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
| `src/components/DirectoryGuideModal/DirectoryGuideModal.jsx` | Menú de cinco entradas, navegación, cierre, foco y acciones hacia los controles existentes. `EXISTING_TABS` todavía deriva los recorridos pendientes al modal anterior. |
| `src/components/DirectoryGuideModal/FindCommunityGuide.jsx` | Vista aprobada del directorio. `GuideSection` y `GuideScreenshot` son componentes internos; extraerlos si la siguiente entrada realmente necesita compartirlos. |
| `src/components/DirectoryGuideModal/FindCommunityAiGuide.jsx` | Vista aprobada de IA. Selector de datos, copia de URL y dos prompts. `DataSourcePicker` es interno; se puede extraer si resulta útil. |
| `src/components/DirectoryGuideModal/DirectoryGuideModal.css` | Estilos del menú, acordeones, capturas, selector y espaciado. Reutiliza la base de estilos de OpenDataModal. |
| `src/components/OpenDataModal/OpenDataModal.jsx` | Conserva el contenido todavía pendiente de reubicar. Exporta `PromptList`, que interpola reglas y URLs y usa los bloques copiables existentes. Permite pestaña inicial y regreso al menú. |
| `src/components/OpenToOptions.jsx` | Exporta `InfoTooltip`, reutilizado para disponibilidad y tipos; soporta puntero, foco, clic, Escape y posicionamiento en pantalla. Evitar crear otra implementación equivalente. |
| `src/components/FilterPanel.jsx` | Incluye los tooltips de tipos. Es enfocable para recibir el foco tras el CTA de la guía. |
| `src/lib/communityOpenTo.js` | Opciones y disponibilidad declarada. El panel solo ofrece valores presentes en los datos: no asumir que hay comunidades para las siete opciones. |
| `src/stores/community.store.js` | Filtros y acciones existentes. Antes de tocarlos, revisar también `src/data/invertedindex.js` y `src/data/searchFaceted.js`. |
| `src/i18n/locales/es.json` | Textos de la guía en `directoryGuide`, prompts/reglas en `openData.prompts` y ayuda de tipos en `sidebar`. Modificar solo español durante estas fases. |
| `public/images/guide/` | Capturas reales, WebP con densidad doble: buscador a 960 px, filtros a 1280 px. Se capturaron también versiones inglesas antes de aplazar la traducción. |
| `tests/directoryGuide.test.jsx` | Menú, estructura, capturas, ayuda contextual y selector. |
| `tests/openDataPrompts.test.js` | Contratos de los prompts y reglas; incluye las nuevas restricciones en español. |
| `tests/directoryLayout.test.jsx` | Cabecera y agrupación del recuento con filtros activos. |

No depender de los scripts de QA o capturas de `/tmp`: son auxiliares de esta sesión, no parte del repositorio.

## Alcance concreto de la siguiente entrada

Para «Aportar a una comunidad», consultar el checklist del plan y el contenido existente antes de maquetar:

1. Ofrecer caminos para charlas, coorganización, voluntariado, mentoría, patrocinio, espacios y colaboración entre comunidades. Decidir cuánto explicar según lo que ya deja claro la interfaz.
2. Conectar las acciones a `openTo` y mantener el contexto de búsqueda pertinente. Revisar el comportamiento real de los filtros antes de decidir cómo combinar o sustituir criterios.
3. Explicar el matiz importante: disponibilidad declarada no equivale a búsqueda urgente, C4P abierto ni plaza garantizada. Dato ausente significa sin información, no rechazo. La persona debe poder contactar y confirmar con la comunidad.
4. Reubicar los prompts existentes `speaker` y `volunteer`. Revisarlos con el criterio editorial acordado: evitar promesas de frecuencia o disponibilidad inferidas por el tipo de comunidad, y respetar los límites de ubicación. No inventar prompts de mentoría, patrocinio o espacios como si ya existieran.
5. Retirar la derivación provisional de `contribute` a la pestaña anterior cuando su sustituto esté completo. Mantener accesible el resto del contenido pendiente.
6. Validar, actualizar el checklist y **parar para revisión**. No implementar «Dinamizo una comunidad» en esa misma tanda.

## Validación y estado del espacio de trabajo

Última implementación aprobada: **490 tests pasan**, lint de los archivos modificados correcto y build de producción correcto. Se comprobaron en español, a 1440 y 390 px, los márgenes, nombres de los cinco formatos, URLs copiadas y contenido exacto de los prompts. En iteraciones previas también se verificaron capturas, tooltips, acciones, teclado, Escape y retorno de foco.

- Ejecutar las comprobaciones pertinentes tras la siguiente implementación: `npm test`, lint de los ficheros modificados y `npm run build`. No repetir builds por cambios exclusivamente documentales.
- El lint global tenía errores previos ajenos a este trabajo y una advertencia existente en `src/App.jsx`; no confundirlos con regresiones propias ni corregirlos sin relación con el alcance.
- El build de ArcGIS puede tardar varios minutos. Dejarlo terminar; no arrancar dos builds sobre `dist/` en paralelo.
- Existe una observación pendiente del grid a 320 px, fuera de los bloques modificados, para la revisión responsive posterior.
- La validación visual integral del mapa y la auditoría final de accesibilidad y de inglés siguen pendientes en la fase 5.
- Preferir `127.0.0.1:4173` para QA; comprobar qué proceso sirve la app y que coincide con el código en disco. No cerrar un servidor ajeno. El puerto 5173 puede estar interceptado por VS Code.
- Hay cambios de esta implementación sin commit y documentos locales ajenos. Leer `git status` antes de editar; no hacer limpieza general, revertir ni añadir todos los ficheros indiscriminadamente. Los documentos de contactos, invitaciones y automatización n8n no pertenecen a esta tarea.
- Si se automatizan cambios de JSON, distinguir claves raíz de claves homónimas anidadas: `heading.openData` es una cadena, mientras que `openData` es el objeto del modal. Una sustitución textual no anclada causó un error que los tests detectaron y ya está corregido.

## Mensaje para iniciar la siguiente sesión

> Continúa las mejoras de UI desde `docs/handoff-mejoras-ui.md` y `docs/plan-temporal-mejoras-ui.md`. «Encontrar mi comunidad» está aprobada. Implementa solo «Aportar a una comunidad», en español, aplicando los aprendizajes cuando aporten valor y conservando el contenido y los cambios locales ajenos. Valida, actualiza el checklist y para para revisión antes de pasar a otra entrada. No borres el plan ni traduzcas al inglés todavía.
