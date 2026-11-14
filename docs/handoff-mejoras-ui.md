# Handoff de las mejoras de UI

Actualizado: 14 de noviembre de 2026.

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
| Reutilizar contenido y lógica existentes. | En «Conectar con Community Builders», integrar el componente completo compartido con el modal original, sin duplicarlo ni sustituirlo por un resumen y otro CTA. En este recorrido se retiran puesta en marcha y mantenimiento de ficha por petición del usuario. |
| Revisar una entrada cada vez y aplicar el feedback a la siguiente. | Completar la entrada actual, validar estos criterios y parar. No reabrir la entrada aprobada ni avanzar a la siguiente sin revisión. |

Antes de entregar, revisar expresamente: **solo español; apoyo visual para los controles explicados; ausencia de prosa obvia; espaciado real; acciones y prompts verificados; pausa para revisión**. Registrar lo pendiente y justificar las adaptaciones al contenido. No hace falta pedir de nuevo aprobación para aplicar lo ya acordado.

## Punto de continuación

**Nueva mejora de búsqueda — 14 de noviembre:** el usuario ha aprobado el bloque 1 del buscador. El bloque 2 está implementado y validado: explorador por categorías con ejemplos y chips, búsqueda global, selección persistente, «Cualquiera / Todas», contador contextual y modo compartible en URL. La revisión del bloque 2 añade «Añadir todas» por categoría y un formulario para sugerir varias temáticas y preparar un issue en GitHub. El usuario también pidió y autorizó públicos: el mismo explorador incorpora pestañas, 43 públicos en diez categorías, selección y modos independientes, contador combinado y propuestas por catálogo. Ambas plantillas incluidas deben publicarse en la rama predeterminada. Se para para revisión del usuario antes de cualquier trabajo adicional. El detalle, las decisiones y la validación están al final del plan temporal. Conservar ambos documentos y los cambios locales ajenos; no hacer commit ni push sin petición. Este párrafo determina la siguiente acción de la nueva petición; el estado de las fases anteriores sigue debajo.

**Implementación terminada para revisión final.** El usuario pidió completar todo el plan, incluidas las traducciones pendientes de fase 2. Esa petición sustituye las pausas por entrada y el aplazamiento del inglés de las sesiones anteriores. Fases 3–4 implementadas; validación de fase 5 y traducciones terminadas.

Queda únicamente la revisión conjunta del resultado y, después, eliminar `docs/plan-temporal-mejoras-ui.md`. Se conserva por el acuerdo expreso de no borrarlo antes de esa revisión. No hacer commit, push ni despliegue sin petición.

El detalle actual está en «Cierre de implementación — fases 3–5 y traducciones», al final del plan. Los registros posteriores de este handoff describen sesiones anteriores; sus puntos de continuación y restricciones temporales quedan sustituidos por este bloque.

## Acuerdos que se deben mantener

- El aplazamiento del inglés ha terminado: las traducciones pendientes se completan en el cierre autorizado por el usuario, a partir de la interfaz española acordada. Las demás decisiones editoriales y de interacción se mantienen.
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
| `src/components/DirectoryGuideModal/DirectoryGuideModal.jsx` | Menú de seis entradas, navegación, cierre, foco y acciones hacia los controles existentes. Los cinco recorridos tienen vista propia; `legacy` conserva el acceso al contenido anterior de puesta en marcha y contexto. |
| `src/components/DirectoryGuideModal/OrganizeCommunityGuide.jsx` | Conectar con Community Builders, contenido compartido de Community Builders, colaboraciones con contador contextual y prompt de sinergias. Sin puesta en marcha ni mantenimiento por petición del usuario. |
| `src/components/DirectoryGuideModal/ImproveDirectoryGuide.jsx` | Alta/edición, mantenimiento, asistencia IA y consulta. Capturas españolas reales, acciones explícitas hacia buscador/formulario. |
| `src/components/DirectoryGuideModal/BuildDataGuide.jsx` | Tres bloques: recursos, código y agentes. Mismo destino desde menú y pie; recursos compartidos con el modal anterior. |
| `src/lib/openDataCode.js` | Ejemplos copiables compartidos y verificables con datos de prueba. |
| `src/components/DirectoryGuideModal/ContributeCommunityGuide.jsx` | Recorrido de aportaciones: siete chips con contadores, nota previa sobre cobertura del dato y CTA explícito que sustituye solo `openTo`, ayuda de disponibilidad y pestaña IA con `speaker` / `volunteer`. |
| `src/components/DirectoryGuideModal/FindCommunityGuide.jsx` | Vista aprobada del directorio. `GuideSection` y `GuideScreenshot` se exportan y comparten con aportaciones; no se altera la vista aprobada. |
| `src/components/DirectoryGuideModal/FindCommunityAiGuide.jsx` | Vista aprobada de IA. Selector de datos, copia de URL y dos prompts. `DataSourcePicker` se exporta y se comparte con el recorrido de aportaciones. |
| `src/components/DirectoryGuideModal/DirectoryGuideModal.css` | Estilos del menú, acordeones, capturas, selector y espaciado. Reutiliza la base de estilos de OpenDataModal. |
| `src/components/OpenDataModal/OpenDataModal.jsx` | Conserva las consultas de puesta en marcha y contexto; comparte descargas, ejemplos, instrucciones y canales de ayuda con los recorridos nuevos. Exporta `PromptList`, que interpola reglas y URLs y usa los bloques copiables existentes. Permite pestaña inicial y regreso al menú. |
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

Los contadores respetan los demás filtros activos e ignoran el `openTo` previo, para coincidir con el resultado de cada chip. Los ceros se muestran desactivados; los demás aplican el filtro al pulsarlos. Las descripciones siguen en tooltips. «Explorar el mapa» conserva su botón con tooltip. Se mantiene la captura real de filtros y la pestaña de IA aprobada para este recorrido. El usuario ya ha revisado esta entrada y confirma su commit. No reabrirla sin una petición nueva.

## Alcance de Aportar (aprobado por el usuario)

Para «Aportar a una comunidad», consultar el checklist del plan y el contenido existente antes de maquetar:

1. Ofrecer caminos para charlas, coorganización, voluntariado, mentoría, patrocinio, espacios y colaboración entre comunidades. Decidir cuánto explicar según lo que ya deja claro la interfaz.
2. Conectar las acciones a `openTo` y mantener el contexto de búsqueda pertinente. Revisar el comportamiento real de los filtros antes de decidir cómo combinar o sustituir criterios.
3. Explicar el matiz importante: disponibilidad declarada no equivale a búsqueda urgente, C4P abierto ni plaza garantizada. Dato ausente significa sin información, no rechazo. La persona debe poder contactar y confirmar con la comunidad.
4. Reubicar los prompts existentes `speaker` y `volunteer`. Revisarlos con el criterio editorial acordado: evitar promesas de frecuencia o disponibilidad inferidas por el tipo de comunidad, y respetar los límites de ubicación. No inventar prompts de mentoría, patrocinio o espacios como si ya existieran.
5. Retirar la derivación provisional de `contribute` a la pestaña anterior cuando su sustituto esté completo. Mantener accesible el resto del contenido pendiente.
6. Validar, actualizar el checklist y **parar para revisión**. No implementar «Dinamizo una comunidad» en esa misma tanda.

## Descubrir a otras personas que dinamizan comunidades

Aprobada por el usuario el 13 de noviembre de 2026, solo en español. Se solicita commit de esta entrada; no avanzar a otra en esta sesión.

- Vista propia en `OrganizeCommunityGuide.jsx`, sin derivación inicial al modal antiguo. Dos acordeones: «Conectar con Community Builders» (abierto) y «Colaborar con otra comunidad». Entrar y desplegar no cambian filtros ni abren herramientas.
- **Corrección expresa del usuario:** «Conectar» debe mostrar dentro del recorrido el mismo contenido de Community Builders, reutilizando contenido y lógica. Se extrae `CommunityBuildersContent` del modal original y ambos lo usan: cabecera, cuatro pestañas, perfiles rotatorios, tooltips, historias, incorporación y contactos. Sin resumen sustitutorio ni botón intermedio que abra otro modal. Los perfiles llaman al mismo filtro existente.
- **Retiradas expresas:** no incluir «Quiero montar una comunidad» ni el párrafo/enlace de mantenimiento de ficha en esta entrada. Los prompts `umbrella` / `gaps` y las vías de ayuda anteriores permanecen en el modal antiguo, sin reescribirlos como parte de este recorrido. Estas decisiones prevalecen sobre el inventario inicial.
- Colaboración: frase → captura española real de filtros ampliable → nota de cobertura → acciones. El contador respeta los demás filtros e ignora el `openTo` previo; sustituye solo esa faceta. Los datos actuales no incluyen colaboraciones declaradas: se muestra cero y se desactiva esa acción. «Abrir filtros» permite explorar sin cambiar criterios. Se prueba también el caso positivo con datos servidos solo al navegador.
- IA: selector compartido de cinco formatos y URL copiable, con el prompt completo `synergies`. Se conservan entrevista, reglas y límites de ubicación; se evitan canales archivados y contactos inventados. No se actualiza inglés.
- Se comprueban foco, pestañas con flechas, tooltips/Escape y selección de perfiles en el componente compartido. El modal original conserva su acceso desde «Sobre el proyecto».

## Validación y estado del espacio de trabajo

Validación de esta entrada: **498 tests Vitest y cuatro pruebas de navegador correctos**, lint de los archivos modificados y build de producción correctos. Revisado en español a 1440 y 390 px: contenido compartido, cuatro pestañas con teclado, perfiles y filtro por persona, historias, incorporación y contactos, ausencia de los bloques retirados, captura de filtros, ceros desactivados, contador con colaboración de prueba, conservación de criterios, copia exacta de sinergias/URL, Escape y retorno de foco. El modal original también se verifica. El usuario aprueba el resultado y solicita commit.

Validación de «Aportar a una comunidad» tras revisar los acuerdos activos: **497 tests Vitest y dos pruebas de navegador pasan**, lint de componentes y pruebas modificados correcto. Comprobaciones en español a 1440 y 390 px: acordeones, captura ampliable, siete opciones y ayuda contextual, ausencia de disponibilidad, entrada sin efectos y chips que aplican explícitamente la aportación, conservación de filtros de temática/idioma/estado al sustituir `openTo`, copia completa de los dos prompts con reglas y URLs interpoladas, pestañas con teclado, retorno al menú, cierre y foco. Las descripciones de las acciones reutilizan `InfoTooltip` y los textos de disponibilidad del panel; se consultan a petición. Escape cierra primero la ayuda y después el modal. La regresión se verifica con `node --test tests/browser/contributeGuide.browser.mjs` (requiere la app local arrancada). Build final registrado en el plan. Entrada aprobada por el usuario; confirma que ha hecho commit.

Referencia de la última implementación aprobada («Encontrar»): **490 tests pasan**, lint de los archivos modificados correcto y build de producción correcto. Se comprobaron en español, a 1440 y 390 px, los márgenes, nombres de los cinco formatos, URLs copiadas y contenido exacto de los prompts. En iteraciones previas también se verificaron capturas, tooltips, acciones, teclado, Escape y retorno de foco.

- Ejecutar las comprobaciones pertinentes tras la siguiente implementación: `npm test`, lint de los ficheros modificados y `npm run build`. No repetir builds por cambios exclusivamente documentales.
- El lint global tenía errores previos ajenos a este trabajo y una advertencia existente en `src/App.jsx`; no confundirlos con regresiones propias ni corregirlos sin relación con el alcance.
- El build de ArcGIS puede tardar varios minutos. Dejarlo terminar; no arrancar dos builds sobre `dist/` en paralelo.
- Existe una observación pendiente del grid a 320 px, fuera de los bloques modificados, para la revisión responsive posterior.
- La validación visual integral del mapa y la auditoría final de accesibilidad y de inglés siguen pendientes en la fase 5.
- Preferir `127.0.0.1:4173` para QA; comprobar qué proceso sirve la app y que coincide con el código en disco. No cerrar un servidor ajeno. El puerto 5173 puede estar interceptado por VS Code.
- Hay cambios de esta implementación sin commit y documentos locales ajenos. Leer `git status` antes de editar; no hacer limpieza general, revertir ni añadir todos los ficheros indiscriminadamente. Los documentos de contactos, invitaciones y automatización n8n no pertenecen a esta tarea.
- Si se automatizan cambios de JSON, distinguir claves raíz de claves homónimas anidadas: `heading.openData` es una cadena, mientras que `openData` es el objeto del modal. Una sustitución textual no anclada causó un error que los tests detectaron y ya está corregido.

## Mensaje histórico de continuación (sustituido por el cierre actual)

En una sesión ya abierta, pedir primero: «Relee los acuerdos activos de `AGENTS.md` y los criterios de aceptación al principio de `docs/handoff-mejoras-ui.md`. Aplícalos al trabajo actual: solo español en toda la aplicación hasta el cierre; capturas reales para mostrar controles y flujos; ayuda breve para perfiles técnicos; detalle progresivo y márgenes comprobados. Conserva el trabajo local y para para revisión antes de avanzar a otra entrada».

> «Descubrir a otras personas que dinamizan comunidades» está aprobada y se ha solicitado su commit. La siguiente entrada pendiente es «Mejorar este directorio»; espera una petición para continuar. Continúa las mejoras de UI desde `docs/handoff-mejoras-ui.md` y `docs/plan-temporal-mejoras-ui.md`. «Encontrar mi comunidad» está aprobada. La implementación y su checklist están actualizados en el plan. Conserva el contenido y los cambios locales ajenos; espera la revisión antes de pasar a otra entrada. No borres el plan ni traduzcas al inglés todavía.


## Cierre de implementación de la fase 2 — pendiente de revisión

El usuario pide completar juntas «Mejorar este directorio» y «Construir con los datos», validar y parar. No se reabren las entradas aprobadas ni se avanza a las fases 3–5.

- **Mejora:** cuatro acordeones, con alta/edición abierto al entrar. Búsqueda previa para evitar duplicados, alta si falta y edición/revisión desde una ficha. Captura española de búsqueda reutilizada; nuevas capturas reales del aviso de revisión y del acceso a la asistencia IA. La ayuda de IA tiene su propio bloque con captura y acción hacia el formulario. No se envía ninguna propuesta durante la validación.
- Se distingue revisión humana de vigencia del dato, se invita también a quien no organiza la comunidad y se aclara que preparar/enviar una propuesta no publica cambios automáticamente ni exige Git. Los cuatro aspectos de mantenimiento conservan temáticas/públicos, canales archivados y eventos, con Open Tech Events, su lector y eventos.wiki. Telegram, GitHub y lista de correo usan el componente de consulta compartido.
- **Construcción:** datos, código y agentes en tres acordeones, solo el primero abierto. Selector compartido de cinco recursos con URL copiable aparte, todas las descargas previas (también esquema y taxonomías ES/EN), licencia/atribución y documentación. No se añade una captura artificial a contenido conceptual: los formatos y ejemplos son el recurso útil.
- Shell, JavaScript, Python y OTE conservados en `openDataCode.js`, compartidos con el modal anterior. Se excluyen fichas ocultas y se incluyen generalistas en consultas por temática. Las pruebas ejecutan JavaScript y agregación OTE con fixtures, incluido un feed caído. Instrucciones de agentes con reglas precisas sobre facetas, ubicación, revisión, disponibilidad y canales archivados; sin licencia ni catálogos duplicados por idioma en el bloque copiable.
- El prompt `onboarding` conserva sus reglas. Construcción → agentes → «Más consultas con IA y contexto del proyecto» permite llegar a los otros siete prompts, puesta en marcha, notas y roadmap anteriores. El inventario de fase 2 queda contrastado en español; se conserva inglés y su revisión sigue aplazada al cierre.
- Entrar o desplegar no cambia filtros ni abre herramientas. El menú y «Descargar y reutilizar los datos» comparten el recorrido de construcción. Los iconos decorativos del modal anterior se excluyen del nombre accesible.

Validación: **502 tests Vitest correctos**, lint de los componentes, biblioteca de ejemplos y tests modificados correcto. Navegador en español a **1440 y 390 px**: acordeones, capturas, alta/búsqueda, descargas, cinco formatos, copia exacta de URLs y bloques, ocho prompts accesibles, navegación al contenido conservado, regreso, Escape, foco y ausencia de desbordamiento. Comprobación visual del espaciado real en ambos anchos, más una prueba de teclado/acción del bloque de IA y del selector «Otra cosa»: 13,6 px entre frase y captura, 12 px entre captura y acción, sin desbordamiento. El último ajuste editorial conserva la suscripción a feeds sin depender de una plataforma; no cambia estructura ni lógica. **Build de producción correcto** (23 avisos previos de imágenes ausentes en el dataset y aviso de tamaño de chunks de ArcGIS).

**Parar para revisión del usuario.** Mantener el plan. Sin commit, push ni despliegue; los documentos locales de contactos e invitaciones permanecen intactos.


### Último ajuste de revisión y commit

- Por petición del usuario, los cinco recorridos comienzan con todos sus acordeones cerrados. La persona elige qué sección abrir; se conserva la apertura exclusiva y la posibilidad de cerrarlas todas.
- Se ajustan las expectativas de las pruebas a ese estado inicial. **No se ejecutan tests después de este cambio**, por indicación expresa del usuario. La validación previa fue de 502 tests, lint, build y navegador; después del último ajuste editorial pasaron las 110 pruebas específicas.
- Se solicita commit de todo el trabajo de UI de esta sesión. Se excluyen los documentos locales de contactos, invitaciones y automatización. El changelog lo genera el hook; no se edita a mano. Sin push ni avance a otra fase.


## Cierre actual — fases 3–5 y traducciones

- Tarjeta de alta al principio del grid, sin duplicado final; búsqueda de ficha existente, aportaciones de cualquier persona y brillo que respeta movimiento reducido. Una fila propia evita estirar las tarjetas de comunidades.
- Botón de alta sobre el mapa, separado de controles y leyenda. Revisado con datos y clusters cargados a 1440, 390 y 320 px y también en inglés móvil.
- «Sobre el proyecto» conserva el botón original «¿Dinamizas una comunidad tech?», sin tarjeta ni párrafo añadido. `BuildersInvitation.jsx` se usa al final de preparación de propuestas, reutilizando el mismo modal original. GitHub y correo se prueban sin envío. Abrir una vía externa no equivale a enviar ni publicar; el aviso lo aclara.
- Inglés completado: cinco recorridos, formatos, chips, notas, prompts, instrucciones de agentes, comentarios de código e invitaciones. Capturas inglesas reales de revisión y asistencia IA; búsqueda/filtros ingleses reutilizados. Sin claves faltantes respecto al español. Los prompts respetan los límites acordados y usan solo los catálogos del idioma de la interfaz.
- **511 tests Vitest correctos; 16 casos de navegador verificados** entre las suites de aportación, organización y cierre; lint específico de componentes nuevos, traducción y pruebas correcto. El lint global sigue fallando por problemas previos, también en `CommunitiesList.jsx` (props), `CommunityContribution.jsx` (tres variables sin uso) y `App.jsx` (dependencia de efecto), además de scripts/configuración ajenos. No se amplía el alcance para corregirlos. **Build de producción correcto**, con avisos previos de imágenes de comunidades y chunks de ArcGIS.
- Los tests de navegador existentes se adaptan al acuerdo de acordeones cerrados. La selección de perfiles compara handles normalizados, como el filtro real; se espera la tarjeta tras la carga y el render de capas antes de comprobar el mapa.
- Validación visual de márgenes, capturas y acciones en ambos idiomas, escritorio y móvil; listado/mapa sin desbordamiento a 320 px. Capturas de QA en `/tmp` son auxiliares; las dos capturas inglesas de ayuda están en `public/images/guide/`.

**Pendiente únicamente:** revisión final conjunta y eliminación del plan después de esa revisión. Sin commit, push ni despliegue; documentos locales ajenos conservados.


## Correcciones de la revisión final

- No rediseñar la invitación de Community Builders en «Sobre el proyecto»: restaurados el botón, iconos, sección y comportamiento originales. El texto y la tarjeta nuevos se conservan únicamente tras preparar una propuesta de alta o edición.
- La tarjeta del listado pregunta «¿Dinamizas o participas en alguna comunidad?» y explica que una comunidad sin metadatos es más difícil de descubrir: buscar la ficha, revisar sus datos si existe o añadirla si falta. «Pendientes de revisión» es un enlace real que aplica `humanValidated=false`, sustituyendo esa faceta y conservando las demás.
- Cierre accesible de la tarjeta. Al cerrarla aparece «Mejorar el directorio» antes de «Qué puedes hacer aquí». Pulsarlo restaura la tarjeta y la enfoca; desde el mapa vuelve al listado sin cambiar filtros. La preferencia abierta/cerrada se guarda en localStorage y se restaura al volver a la página. Si el almacenamiento está bloqueado, la interacción sigue funcionando durante la sesión.
- Botón de alta del mapa arriba a la izquierda. En mapas estrechos, la búsqueda baja una fila para evitar solapamientos.
- Validación de esta revisión: 513 tests Vitest correctos, lint específico correcto y comprobaciones de navegador en español e inglés, escritorio y móvil. Se comprueban persistencia tras recarga, cierre/reapertura y foco a 1440/390/320 px, conservación de filtros y recuento de pendientes, diseño original de «Sobre el proyecto», acceso al formulario y ubicación del botón del mapa. Se mantiene el plan para la revisión final conjunta.


## Revisión del 14 de noviembre — tira y panel de contribución

Se parte de la reorganización realizada con otro agente: tira fina antes del listado y panel de contribución separado. Las decisiones de este bloque sustituyen las versiones anteriores de esta invitación; no se cambia «Sobre el proyecto» ni el mapa en esta entrada.

- Tira sin recuentos en sus tres variantes, con texto a la izquierda, acción a la derecha y un aspa siempre visible. En móvil las acciones bajan a otra línea. Cerrar la tira usa `directory-cta-bar-dismissed`; no cierra el panel ni activa el botón de reapertura del panel en la cabecera.
- `createDismissStore(storageKey)` instancia ambos estados, reutilizando la caducidad de 30 días y el fallback con almacenamiento bloqueado. El panel conserva `directory-add-community-cta-dismissed`, «Ahora no» y su reapertura desde la cabecera.
- En la variante filtrada, tira y panel explican primero que una ficha puede existir sin las etiquetas necesarias para aparecer en el recorte. El lead incluye una acción de búsqueda por nombre. El alta queda como segunda opción y dice expresamente «No está en el directorio».
- Panel en dos columnas desde 900 px: título/lead a la izquierda, acciones a la derecha y nota debajo ocupando todo el ancho. En móvil sigue en columna. El botón principal usa azul `#245c9b` y texto blanco mediante una clase propia, sin cambiar otros botones.
- `resolveCtaPanelPlacement`: con hasta 24 resultados el panel va al final; con más se inserta después de la ficha 24, ocupando la fila completa. Una sola instancia. El título de revisión deja de decir que se ha llegado al final, porque ahora puede aparecer antes.
- Textos actualizados en español e inglés. `CLAUDE.md` explica por qué se usan el umbral de 24 y claves de cierre independientes.
- Validación: 532 tests Vitest y siete pruebas de navegador correctos, lint de los componentes, biblioteca, store y pruebas nuevos/modificados correcto (salvo los errores previos ya registrados de `CommunitiesList.jsx`). Revisión visual a 1900, 900, 390 y 320 px según el caso: espaciado, columnas, contraste, enlace por nombre, posición única del panel, cierres independientes y persistencia tras recarga. Build de producción correcto (59 s), con los avisos previos de imágenes del dataset y tamaño de chunks de ArcGIS.

Se conserva el plan para la revisión conjunta. Sin commit, push ni despliegue; documentos locales ajenos intactos.


## Ajuste de filas completas y acciones del panel — 14 de noviembre

- Las 24 fichas son una referencia, no un corte fijo. La inserción se redondea hacia la siguiente fila completa según las columnas reales del grid: 26 fichas con 13 columnas, 28 con 14, etc. Si no quedan más fichas tras esa fila, el panel va al final. Nunca se duplica.
- `CommunitiesList` mide `grid-template-columns`; `ResizeObserver` y el evento de resize recalculan la posición al cambiar el ancho disponible. No se codifican columnas por breakpoint ni se depende solo del ancho de la ventana.
- En el diseño de escritorio, «Buscar mi comunidad» y el enlace de alta se apilan y alinean a la derecha, bajo «Ahora no». Se conserva el diseño móvil.
- `CLAUDE.md` refleja la política nueva. Esta corrección sustituye el corte fijo tras la ficha 24 documentado en la revisión anterior.
- Validación: 544 tests Vitest correctos; cinco pruebas de navegador correctas, incluidas comprobaciones en español e inglés y un redimensionado continuo a 1900, 1774, 1450, 1208, 1100, 900, 699, 390 y 320 px. Verificado también el cambio de ancho del contenedor, la última tarjeta alineada al borde del grid, una sola instancia del panel, las acciones apiladas y la ausencia de desbordamiento. Lint específico correcto salvo el error previo de props en `CommunitiesList.jsx`. Build de producción correcto (1 min 10 s), con los avisos previos del dataset y tamaño de chunks.


## Simplificación de la invitación y jerarquía de acciones — 14 de noviembre

La última decisión del usuario sustituye el diseño de tira más panel: se retira la tira para no repetir la misma búsqueda junto al buscador superior y dentro del panel.

- Queda un único panel. «Añadir una comunidad» es la acción principal, con botón azul; «Buscar mi comunidad» es la secundaria, con borde azul y el mismo ancho. Se conserva «Buscar» porque el botón localiza la ficha antes de poder revisarla. Ambas acciones siguen apiladas y alineadas a la derecha en escritorio.
- Se retiran el componente, estilos, traducciones y estado exclusivos de la tira. Su antigua preferencia guardada deja de usarse. El cierre del panel y la reapertura desde cabecera mantienen la caducidad de 30 días.
- La variante filtrada conserva la aclaración sobre fichas existentes sin etiquetas, sin un botón de búsqueda adicional dentro del párrafo.
- Texto español exacto solicitado: «Si la tuya no está, o sus datos están incompletos o desactualizados, puede no aparecer en las búsquedas.». «Estos datos son abiertos» aparece en negrita. Se actualiza también inglés y `CLAUDE.md`.
- Sin cambios en la inserción por filas completas, los filtros, «Sobre el proyecto» ni el mapa.
- Validación: 543 tests Vitest y cinco pruebas de navegador correctos (se elimina la prueba de los dos cierres independientes al desaparecer la tira). Comprobadas ambas acciones y su destino, una sola búsqueda en el panel, negrita y texto exacto, persistencia, foco, columnas/filas y ausencia de desbordamiento en ES/EN y escritorio/móvil. Lint específico correcto; permanece el error previo de props de `CommunitiesList.jsx`. Build de producción correcto (1 min 4 s), con los avisos previos del dataset y tamaño de chunks.


### Espaciado del panel — 14 de noviembre

Por petición del usuario, margen superior e inferior iguales: `1rem`. Comprobado en navegador a 1900 y 390 px: la separación real respecto a las tarjetas es idéntica arriba y abajo (23,19 px y 22,39 px, respectivamente, incluyendo el gap del grid). Cambio exclusivo de CSS, sin repetir tests ni build.


### Introducción del menú y commit — 14 de noviembre

Por petición del usuario, la introducción queda en «Asistentes, ponentes, personas que dinamizan comunidades y quienes crean herramientas pueden aprovechar este directorio.». Se retira el añadido HTML «open data» y se ajusta inglés. El usuario solicita commit del trabajo de UI pendiente; se excluyen los documentos locales de contactos, invitaciones y n8n. El changelog lo genera el hook del repositorio; no se edita a mano. No se solicita push ni despliegue. El plan se conserva para la revisión final conjunta.
