# Plan temporal de mejoras de UI/UX

Estado: fases 1–4 implementadas y traducciones pendientes de fase 2 completadas. Validación final de fase 5 realizada; pendiente únicamente la revisión conjunta del usuario y, después, borrar este plan temporal. La petición del 13 de noviembre de 2026 autoriza terminar juntas todas las fases y completar el inglés al cierre; sustituye las pausas por entrada de sesiones anteriores.

Continuidad y aprendizajes: [handoff de las mejoras de UI](handoff-mejoras-ui.md).

**Antes de continuar una entrada, aplicar los [criterios de aceptación del handoff](handoff-mejoras-ui.md#criterios-de-aceptación-para-todas-las-entradas) y los acuerdos activos de `AGENTS.md`.** Las correcciones sobre idioma, capturas, brevedad, público técnico y espaciado se aplican a las siguientes entradas; no son únicamente un registro histórico de la primera.

Este fichero sirve para revisar las decisiones y registrar el avance durante la implementación. Actualizar las casillas y las decisiones pendientes conforme se resuelvan. Borrar este fichero al terminar el trabajo.

## Prioridades acordadas

1. Encontrar una comunidad.
2. Conectar con otras personas que organizan mediante Community Builders.
3. Aportar añadiendo comunidades o mejorando sus datos.

## Criterio de idioma durante la implementación

Trabajar y revisar los cambios en español hasta terminar todas las fases. Posponer las nuevas traducciones y la revisión integral en inglés a la fase 5. Conservar los textos ingleses ya existentes; las traducciones parciales realizadas hasta esta indicación son provisionales.

## Fase 1. Simplificar cabecera y resultados

- [x] Mantener título y subtítulo, dándoles espacio para evitar el truncado observado.
- [x] Dejar «Qué puedes hacer aquí», «Sobre el proyecto» y selector de idioma.
- [x] Retirar de la cabecera las estrellas de GitHub, la invitación a Community Builders, «Datos abiertos + IA» y «Añadir comunidad».
- [x] Conservar el enlace para dar una estrella dentro de «Sobre el proyecto», sin contador.
- [x] Colocar los filtros activos junto a «X de Y comunidades», permitiendo varias líneas cuando falte espacio.
- [x] Mantener los controles de filtros y cambio lista/mapa.
- [x] No añadir chips de posibilidades bajo la búsqueda: esas opciones vivirán en el nuevo modal.

### Registro de la fase 1

- Cabecera simplificada en español e inglés, con título y subtítulo completos también en móvil. Los filtros activos comparten bloque con el recuento y admiten varias líneas.
- Transición durante la fase 1 (sustituida ya por el nuevo menú): «Qué puedes hacer aquí» abre el modal actual de datos e IA, íntegro. Se sustituirá por el menú de objetivos al implementar esa fase, manteniendo accesible el contenido pendiente de reubicación.
- Se adelanta el acceso a Community Builders desde «Sobre el proyecto» (después del párrafo del registro de cambios y antes de la transparencia de datos) para que el modal siga accesible al retirar su botón de cabecera. La fase 4 completará el texto y los demás accesos.
- Validación: 476 tests correctos (incluidas cuatro pruebas nuevas), lint de los archivos modificados correcto y build de producción correcto. El lint global sigue fallando en archivos ajenos a esta fase (43 errores y dos advertencias).
- Revisión en navegador de cabecera y accesos en español e inglés, a 320, 390, 768, 1100 y 1440 px: modales, cierre con Escape y retorno de foco de Community Builders. A 320 px se detectó desbordamiento del contenedor del grid, fuera del bloque modificado; queda anotado para la revisión responsive de las fases 3 y 5.
- Feedback aplicado: se elimina el contador de estrellas, conservando el diseño del enlace original; la invitación a Community Builders pasa antes de «¿De dónde salen estos datos?».
- Pausa para revisión de la fase 1. En la fase 2 se hará una pausa tras **cada entrada**. Criterio editorial indicado por el usuario: ayuda ligera, sin prosa excesiva ni explicaciones obvias; destacar el potencial y las opciones menos visibles, con el botón de ayuda como apoyo.

## Fase 2. Modal «Qué puedes hacer aquí»

- [x] Mostrar las seis entradas de la tabla, incluida «Construir con los datos».
- [x] Al elegir una, mostrar una explicación breve antes de las acciones disponibles.
- [x] Permitir volver al menú inicial.

| Entrada | Posibilidades |
| --- | --- |
| Descubrir comunidades | Buscar por afinidad o ubicación. |
| Aportar a una comunidad | Proponer charlas, participar como coorganizador, ayudar con voluntariado o mentoría, ofrecer patrocinio o espacios. |
| Descubrir a otras personas que dinamizan comunidades | Descubrir y conectar con otras personas que dinamizan el ecosistema tech. |
| Mejorar este directorio | Añadir una comunidad o mejorar la ficha de una existente. |
| Construir con los datos | Reutilizar los datos para crear un directorio, un agregador de eventos, un bot o un análisis puntual. |
| Otra cosa | Abrir el selector de ayuda existente (`support-fab-chooser` / `support-fab-choice`). |

- [x] Integrar las posibilidades actuales de IA y reutilización de datos en los recorridos donde resulten útiles.
- [x] Añadir al pie un acceso discreto a «Descargar y reutilizar los datos».
- [x] Explicar que «Abiertas a» indica disponibilidad declarada, sin implicar una convocatoria vigente.
- [x] Conectar las acciones con los filtros o interfaces existentes que correspondan.

### Qué ocurre al pulsar una entrada

Cada entrada abre una vista de detalle dentro del modal. Primero explica cómo lograr ese objetivo con los controles del directorio; después ofrece acciones para usarlos y, cuando corresponda, alternativas con IA. No aplicar filtros ni abrir herramientas automáticamente al pulsar la entrada inicial.

- [x] Usar una lista de bloques breves cuando el contenido sea corto.
- [x] Usar pestañas para separar contenido extenso, por ejemplo «Con el directorio» y «Con ayuda de IA», según la cantidad de contenido de cada recorrido. La estructura exacta se decidirá al maquetar, manteniendo los contenidos descritos aquí.
- [x] Mantener las explicaciones visibles antes de los CTA y permitir volver al menú de entradas.
- [x] Conservar los prompts copiables y las instrucciones existentes: reubicarlos por objetivo, sin perder contenido al retirar el botón «Datos abiertos + IA» de la cabecera.

#### Encontrar mi comunidad

**Terminada y aprobada por el usuario el 13 de noviembre de 2026.**

Decisión de revisión: limitar la ayuda a opciones útiles y menos visibles. Se conservan los prompts y las reglas; se eliminan las explicaciones obvias solicitadas por el usuario.

- [x] **Barra de búsqueda:** breve explicación de filtros por temática y público, y búsqueda de comunidades por nombre. Captura real del desplegable con «mad», seguida del CTA.
- [x] **Filtros:** introducción breve, captura real y tres viñetas sobre combinar criterios, estado inicial y disponibilidad para aportar. Evitar describir las opciones autoexplicativas.
- [x] **Tipos de comunidad:** trasladar la orientación de los siete tipos a iconos de información en el panel de filtros, con la nota de que no garantizan frecuencia ni actividad.
- [x] **Ayuda obvia:** retirar del recorrido los bloques de recuento/etiquetas y de ficha/contacto, por petición expresa del usuario.
- [x] **Mapa:** explicar la búsqueda por dirección o arrastre y que las tarjetas de la vista de mapa se actualizan según su extensión visible. Conservar la aclaración de qué comunidades se representan, sin prometer filtros de radio ni que se altere el listado general.
- [x] **Con ayuda de IA / agente:** reubicar los prompts completos «Encontrar mi tribu» y «Descubrir tipos de comunidades», con sus instrucciones de uso y reglas de interpretación. Mantener la orientación sobre lo que ofrece la búsqueda actual frente a las consultas más elaboradas con IA.
- [x] Ofrecer acciones para buscar, abrir filtros, abrir mapa y copiar prompts después de las explicaciones.
- [x] Capturas locales con texto alternativo, versión española e inglesa y acceso a tamaño completo.

#### Aportar a una comunidad

**Aprobada por el usuario; confirma que ha hecho commit.**

- [x] Explicar las siete disponibilidades: ponentes, personas coorganizadoras, voluntariado, mentoría, patrocinio, espacios y colaboraciones entre comunidades.
- [x] Explicar cómo combinar «Abierta a…» con temática, formato, idioma y exploración del mapa.
- [x] Explicar cómo abrir la ficha y contactar: disponibilidad declarada no equivale a una oferta urgente, un C4P abierto ni una plaza garantizada. Ausencia del dato significa sin información, no rechazo.
- [x] Separar charlas, voluntariado, mentoría y apoyo con patrocinio o espacios en bloques breves o pestañas si el contenido lo requiere.
- [x] Reubicar los prompts completos «Dónde dar una charla» y «Echar una mano», incluidos los límites sobre C4Ps y la necesidad de confirmar la disponibilidad con la comunidad.
- [x] Ofrecer acciones para ver comunidades con la disponibilidad elegida y copiar los prompts correspondientes. No presentar como existentes prompts específicos de mentoría, patrocinio o espacios que aún no se han creado.

#### Descubrir a otras personas que dinamizan comunidades

**Aprobada por el usuario el 13 de noviembre de 2026, solo en español. Solicita commit.**

- [x] **Conectar con otras personas que dinamizan:** integrar dentro del acordeón el mismo contenido y lógica del modal Community Builders, extraídos a `CommunityBuildersContent`: quiénes somos, qué hacemos, historias, perfiles, incorporación y contactos. No sustituirlo por un resumen o un CTA hacia otro modal.
- [x] **Colaborar con otra comunidad:** conectar el filtro de colaboraciones y reubicar el prompt completo «Sinergias para mi comunidad», con sus propuestas de colaboración local, entre ciudades y posible reactivación.
- Retirado del alcance por el usuario: **«Quiero montar una comunidad»**. Su contenido sigue accesible en el modal anterior; no incluirlo aquí.
- Retirado del alcance por el usuario: **«Dar visibilidad a mi comunidad»** y el enlace de mantenimiento. No incluirlos aquí.

#### Mejorar el directorio

- [x] Explicar cómo buscar primero una comunidad para evitar duplicados, solicitar su alta si falta y proponer cambios desde una ficha existente.
- [x] Explicar los datos revisados y pendientes de revisión y permitir aportar también a quien no organiza la comunidad.
- [x] Reubicar los cuatro pasos actuales de «Organizo una comunidad»: ficha al día, temáticas y público, enlaces vivos y publicación de eventos.
- [x] Conservar la explicación de cómo esos datos ayudan al descubrimiento con IA, el significado de la revisión humana y la aclaración de que no se necesita saber Git.
- [x] Conservar los enlaces y explicaciones de Open Tech Events, su lector y eventos.wiki, así como las vías de consulta por Telegram, GitHub y lista de correo.
- [x] Explicar el flujo de propuesta y revisión sin afirmar que enviar una propuesta publica automáticamente los cambios.
- [x] Dar acceso al formulario y mantener su asistencia actual con IA para preparar los datos.

#### Otra cosa

- [x] Abrir el selector de ayuda existente y conservar sus opciones y canales. No crear un recorrido paralelo con enlaces distintos.

#### Construir con los datos (implementada; pendiente de revisión del usuario)

- [x] Añadir una sexta entrada principal «Construir con los datos», para crear un directorio, un agregador de eventos, un bot o un análisis puntual. Reutilizar el contenido de «Construyo con los datos»; conservar también el acceso discreto «Descargar y reutilizar los datos» del pie hacia el mismo detalle.
- [x] Conservar los ficheros descargables: JSON, CSV, GeoJSON, esquema, taxonomías de temáticas y públicos en ambos idiomas, `llms.txt` y `llms-full.txt`.
- [x] Conservar la licencia CC BY 4.0, los requisitos de atribución y el acceso a la documentación de datos.
- [x] Reubicar los ejemplos actuales de shell, JavaScript, Python y lectura de feeds OTE, junto con sus notas sobre el esquema y la interpretación de los datos.
- [x] Conservar el prompt «Poner al día a tu agente», las instrucciones completas para agentes y los enlaces a `llms.txt`, `AGENTS.md` y `robots.txt`, incluida la explicación de que no hace falta MCP.
- [x] Mantener accesibles las reglas comunes que acompañan a los prompts, las advertencias sobre datos sin revisar y los enlaces de contexto y roadmap existentes.

### Registro de la fase 2 — primera entrada

- Menú con cinco objetivos. «Encontrar mi comunidad» abre una vista con «Con el directorio» y «Con ayuda de IA»; no cambia filtros al entrar. Las explicaciones de los siete tipos de comunidad se despliegan a petición.
- Acciones conectadas al buscador, panel de filtros y vista de mapa existentes. El buscador y el panel reciben el foco al cerrar la guía; se conservan los criterios activos.
- Prompts `tribe` y `types` reutilizados íntegros, con reglas interpoladas, copia, fallback de descarga y enlaces de roadmap. El resto del contenido sigue accesible en el modal anterior mientras se revisan sus recorridos: «Aportar» abre su pestaña de asistencia, «Dinamizo» y «Mejorar» la de organización, y el enlace del pie la de reutilización. Es una transición, no la implementación final de esas entradas.
- «Otra cosa» ya conecta con el selector de ayuda existente. No se han duplicado sus canales.
- Validación de esta entrada: 490 tests correctos, lint de componentes y pruebas modificados correcto y build de producción correcto. Comprobaciones en navegador en español e inglés a 390 y 1440 px: menú, regreso, pestañas y foco con teclado, copia exacta de los dos prompts, buscador, filtros, acceso al contenido conservado y selector de ayuda. La acción de mapa se comprueba por su vista, URL y conservación de filtros; la validación visual completa del mapa queda para la fase 5.
- Feedback de lectura aplicado: los cinco bloques del recorrido usan un acordeón con iconos y resúmenes visibles. Solo «Busca por afinidad» empieza abierto, y abrir otro bloque cierra el anterior; también se pueden cerrar todos. Los filtros se separan visualmente dentro de su panel y los tipos mantienen su despliegue secundario. El contenido se conserva íntegro. Este patrón servirá de referencia para los siguientes recorridos, pendiente de revisión del usuario.
- Segunda revisión de contenido aplicada: tres bloques (búsqueda, filtros y mapa), capturas reales de búsqueda con «mad» y panel de filtros en ambos idiomas, ampliables. Se retiran los bloques obvios de resultados y ficha por petición del usuario. Los tipos se explican mediante tooltips reutilizados del sistema existente, dentro del panel de filtros; el recorrido conserva solo tres viñetas. El texto del mapa se contrasta con `visibleCommunities` y la actualización al detener la navegación. Capturas generadas a 960 px (buscador) y 1280 px (filtros), con densidad doble, guardadas como WebP en `public/images/guide/`.
- Revisión de «Con ayuda de IA» aplicada para un público técnico: búsqueda semántica o entrevista con un agente; selector de diez recursos publicados con URL de producción seleccionable y botón de copia; introducción breve a los dos prompts ilustrativos. Se retiran de esta pestaña las instrucciones básicas de descarga/adjunto y las referencias de roadmap, por petición del usuario. Se añade separación de 1rem antes de los prompts. Los textos completos de los prompts y sus reglas no cambian.
- Ajuste posterior de IA: separar el párrafo de datos tanto del anterior como del selector; reducir el selector a cinco recursos (índice, Markdown y comunidades en JSON, CSV y GeoJSON), con nombres descriptivos en vez de rutas. Los prompts españoles omiten la licencia y enlazan solo los catálogos del idioma de la interfaz. La licencia sigue accesible en reutilización. Las reglas advierten de que filtrar por localización textual exige coincidencia exacta y no permite inferir proximidad. «Descubrir tipos de comunidades» compara dinámicas e ilustra posibilidades que pueden pasar inadvertidas, sin asignar un tipo ni descartar otros por perfil. La revisión equivalente en inglés queda pendiente para el cierre.
- Cierre: el usuario aprueba y da por terminada «Encontrar mi comunidad». Aprendizajes y estado final guardados en `docs/handoff-mejoras-ui.md`. Continuar con «Aportar a una comunidad» en otra sesión y parar de nuevo al terminar esa entrada.

### Registro de la fase 2 — Aportar a una comunidad

- Implementada solo en español; pendiente de revisión del usuario. Se para aquí, sin avanzar a «Dinamizo una comunidad».
- Dos bloques de acordeón reutilizados: «Encuentra dónde aportar» (abierto inicialmente) y «Afina y explora». El segundo ilustra el panel con la captura española existente, ampliable, entre frase y CTA.
- Selector con las siete formas de aportar y ayuda a petición mediante el `InfoTooltip` existente, con las descripciones del panel. Sustituye los siete bloques explicativos por ayuda centrada en la opción elegida. Entrar en el recorrido o cambiar la selección no aplica filtros.
- El CTA sustituye solo `openTo` mediante `setFilters`, conservando los demás criterios. Los valores de una misma faceta se combinan con OR: añadir una opción a las anteriores ampliaría resultados y no cumpliría el propósito del CTA. Se explica la sustitución antes de salir y se abre/enfoca el panel de filtros.
- Las opciones sin disponibilidad declarada siguen siendo consultables para descubrir posibilidades; el CTA se desactiva y se explica la ausencia de información. La disponibilidad se consulta sobre todo el directorio visible, como en el panel, no solo en los resultados filtrados.
- Se distingue disponibilidad declarada de convocatoria urgente, C4P o plaza garantizada; se invita a consultar la ficha y contactar. Ausencia del dato significa sin información, no rechazo.
- Pestaña de IA con selector de datos compartido y los prompts `speaker` y `volunteer` completos. Se corrigen las inferencias de frecuencia, necesidad de ayuda y periodicidad de C4P basadas en el tipo; se mantienen reglas, canales, entrevista previa y límites geográficos. No se crean prompts adicionales.
- Retirada la derivación provisional de «Aportar» a «Asisto a comunidades». El resto del modal anterior continúa accesible.
- Cambio de alcance solicitado: se planifica una sexta entrada «Construir con los datos», para directorios, agregadores de eventos, bots y análisis puntuales. Reutilizará «Construyo con los datos» y compartirá destino con el enlace del pie. Su implementación sigue pendiente.
- Validación: 495 tests correctos, lint de componentes y pruebas modificados correcto y build de producción correcto. Revisión en español a 1440 y 390 px de acordeones, captura ampliable, selectores, espaciado y prompts. Comprobados los siete caminos de aportación, opciones sin disponibilidad, copia exacta con URLs/reglas interpoladas, teclado, cierre, regreso y foco. El CTA conserva temática, idioma y estado y sustituye solo la disponibilidad; cambiar el selector o entrar no modifica filtros. La revisión visual integral del mapa sigue en la fase 5.
- Pausa para revisión del usuario; no se ha implementado «Dinamizo una comunidad» ni la entrada nueva de reutilización.

### Revisión de Aportar contra los acuerdos activos

- Releídos `AGENTS.md` y los criterios iniciales del handoff. Solo se revisa la entrada actual, en español; se conserva la entrada aprobada y no se generan traducciones ni capturas inglesas.
- Pendiente corregido: las descripciones de aportaciones pasan del párrafo permanente al tooltip reutilizado del panel, actualizado según la opción elegida. Escape cierra primero esa ayuda y después el modal; se añade una prueba de navegador para este comportamiento.
- Se abrevian el aviso de sustitución de filtros, las notas de disponibilidad y la introducción de IA. Se conserva la información relevante y se elimina la instrucción obvia de consultar una ficha.
- La selección interactiva permite descubrir las siete posibilidades sin explicar una pantalla adicional. Para orientar sobre los controles del directorio se mantiene frase breve → captura española real ampliable del panel → acciones. Los dos acordeones separan elección y exploración; solo el primero empieza abierto.
- Se mantienen cinco formatos descriptivos con URL de producción aparte, prompts ilustrativos completos y reglas de coincidencia exacta de ubicación, ausencia de datos y disponibilidad no inferida. No se añaden licencia, roadmap ni instrucciones básicas al recorrido de IA.
- Validación de esta revisión: 495 tests Vitest y la nueva prueba de navegador correctos; lint de los componentes y pruebas modificados correcto; build de producción correcto. Comprobadas visualmente ambas pestañas a 1440 y 390 px, márgenes reales, captura ampliable, cinco formatos, reglas/URLs de los prompts, selección sin efectos y sustitución de disponibilidad conservando filtros. Escape cierra el tooltip sin cerrar el modal.
- Parar para revisión antes de otra entrada. El plan se conserva.

### Revisión de «¿Cómo quieres aportar?» — acciones y acordeón

- El selector se sustituye por siete acciones visibles en un acordeón: dar una charla, ayudar a dinamizar, ayudar/mentorizar, voluntariado, ofrecer espacios, colaborar desde otra comunidad y patrocinio. Solo se abre una acción cada vez, también se puede cerrar; abrirla no aplica filtros. Las aclaraciones siguen en el tooltip existente.
- Retirado por petición del usuario el aviso sobre conservación/sustitución de filtros. El comportamiento se mantiene: el CTA sustituye únicamente `openTo` y conserva el contexto de búsqueda.
- Las notas de disponibilidad se agrupan en un bloque «Ten en cuenta», con icono, fondo y borde lateral para distinguirlas de las instrucciones.
- «Abrir filtros» y «Explorar el mapa» comparten estilo de botón. La limitación de cobertura deja de mostrarse como párrafo y pasa al tooltip del propio botón de mapa, accesible con ratón y foco. Se reutiliza `InfoTooltip`, añadiéndole una acción opcional al pulsar sin alterar sus usos anteriores.
- Validación: 495 tests correctos y lint de los archivos modificados correcto. Pruebas de navegador a 1440 y 390 px: siete acciones y apertura exclusiva, sin cambios de filtros al abrirlas; sustitución de disponibilidad conservando temática/idioma; notas diferenciadas y espaciado; tooltip de aportación y Escape; tooltip del mapa con ratón y navegación al mapa desde el propio botón. Build de producción correcto.
- Solo español. Se conserva la captura real ampliable de filtros y la entrada aprobada. Se para de nuevo para revisión antes de avanzar.

### Revisión de «¿Cómo quieres aportar?» — chips y cobertura del dato

- Los siete bloques internos pasan a chips consecutivos con el prefijo «Ver comunidades en las que pueda aportar:». Etiquetas: «Dando una charla», «Ayudando a dinamizar la comunidad», «Mentorizando a otras personas», «Echando una mano como voluntario/a», «Ofreciéndoles espacio para los encuentros», «Buscando sinergias con mi comunidad» y «Apoyando económicamente o en especie».
- La nota diferenciada pasa antes de los chips. Explica que `openTo` es nuevo y está poco cumplimentado: para las demás comunidades desconocemos su disponibilidad, sin implicar rechazo. Declararlo no garantiza convocatoria, C4P ni plaza; se anima a contactar para ofrecerse a participar.
- Cada chip incluye un contador. Los recuentos respetan los demás filtros e ignoran la selección previa de `openTo`, de modo que coinciden con el resultado al pulsar. Se cuentan solo declaraciones explícitas, una vez por comunidad, sin fichas ocultas ni disponibilidad inferida. Los chips con cero resultados quedan desactivados.
- Pulsar un chip aplica directamente la aportación elegida, conservando los demás filtros y enfocando el panel existente. Entrar en el recorrido sigue sin modificar filtros. Se mantienen las descripciones en tooltips y el botón de mapa con su aclaración contextual.
- Validación: 497 tests correctos, lint de los archivos modificados correcto y dos pruebas de navegador a 1440 y 390 px correctas. Verificados los siete chips, ceros desactivados, nota previa y espaciado, lectura sin desbordamiento, tooltip/Escape, coincidencia del contador con el resultado real, conservación de filtros y acceso al mapa. Build de producción correcto.
- Solo español, sin cambios en la entrada aprobada, prompts ni formatos de IA. Se conserva el plan y se para para revisión.

### Ajuste de textos del menú y sexta entrada

- «Encontrar mi comunidad» pasa a «Descubrir comunidades», también en el título del recorrido. Se conserva su implementación aprobada.
- «Dinamizo una comunidad» pasa a «Descubrir a otras personas que dinamizan comunidades», con la descripción solicitada del ecosistema tech.
- «Mejorar el directorio» pasa a «Mejorar este directorio (open data)», con «Añadir una comunidad o mejorar la ficha de una existente».
- Añadida «Construir con los datos», con descripción de directorios, agregadores de eventos, bots y análisis puntuales. Abre la pestaña existente «Construyo con los datos», igual que el enlace del pie; la revisión específica de ese contenido sigue pendiente. No se avanza en los recorridos de organización y mejora.
- Cambios solo en español; no se actualizan traducciones inglesas.
- Validación: 497 tests, lint de los archivos modificados y build correctos. Menú revisado a 1440 y 390 px sin desbordamiento; comprobados el nuevo título de descubrimiento, la sexta entrada, las descargas y ejemplos conservados, el destino compartido con el pie, regreso al menú y Escape.

### Nota de público y datos abiertos en el menú

- Añadida una nota breve bajo «Qué puedes hacer aquí» para asistentes, ponentes, personas que dinamizan comunidades y quienes crean herramientas o análisis. Se indica que los datos son **open data**, en negrita.
- Se retira «(open data)» de «Mejorar este directorio», al quedar explicado en la introducción común.
- Por petición expresa del usuario, no se vuelven a ejecutar tests tras este ajuste de texto. La última validación previa sigue siendo de 497 tests, lint y build correctos; este último ajuste se revisa con lint y comprobación del diff.
- El usuario solicita hacer commit del trabajo de UI de esta sesión. Los documentos locales de contactos, invitaciones y automatización quedan fuera.

### Descubrir a otras personas que dinamizan comunidades

- Se continúa tras la confirmación del usuario de que «Aportar» está revisada y tiene commit. No se reabre esa entrada.
- El usuario corrige la primera propuesta: «Conectar» debe integrar el contenido completo de Community Builders, reutilizando su lógica; no corresponden aquí la puesta en marcha de una comunidad ni el enlace de mantenimiento. Se retiran estos dos bloques. Los prompts de puesta en marcha quedan donde estaban.
- Dos acordeones: Community Builders (abierto) y colaboraciones. `CommunityBuildersContent` comparte cabecera, pestañas, perfiles, historias, incorporación y contactos con el modal original. Pestañas accesibles con flechas y Escape cierra primero la ayuda.
- Captura real española ampliable para filtros. Nota de cobertura antes de acciones, contador contextual, ceros desactivados y acceso a filtros sin cambiar criterios.
- Se reubica el prompt de sinergias con reglas y URLs completas. Selector de datos compartido, sin añadir formatos ni traducciones inglesas. Se evitan canales archivados y contactos inventados.
- Validación de esta entrada: **498 tests Vitest y cuatro pruebas de navegador correctos**, lint de los archivos modificados y build de producción correctos. Revisado en español a 1440 y 390 px: contenido compartido, cuatro pestañas con teclado, perfiles y filtro por persona, historias, incorporación y contactos, ausencia de los bloques retirados, captura de filtros, ceros desactivados, contador con colaboración de prueba, conservación de criterios, copia exacta de sinergias/URL, Escape y retorno de foco. El modal original también se verifica. El usuario aprueba el resultado y solicita commit.
- El usuario aprueba la entrada y solicita commit. Conservar el plan y no avanzar a la siguiente entrada en esta sesión. Las decisiones de este registro prevalecen sobre el mapa inicial de reubicación.

### Cierre de implementación de la fase 2 — Mejora y construcción

- El usuario autoriza completar juntas las dos entradas pendientes y parar para revisión, sin avanzar a las fases 3–5.
- «Mejorar este directorio» tiene recorrido propio: búsqueda previa/alta o edición, cuatro aspectos de mantenimiento, asistencia con IA y ayuda. Se reutilizan la captura de búsqueda y los canales de consulta existentes; se añaden capturas reales españolas del aviso de revisión y del acceso a IA en el formulario. Las acciones abren el buscador o el formulario existente. Entrar o desplegar no modifica filtros ni abre herramientas.
- Se explica la revisión humana sin garantía de vigencia, la posibilidad de aportar sin organizar la comunidad y el flujo de propuesta sin publicación automática ni necesidad de Git. Los cuatro pasos conservan ficha, temáticas/público, canales archivados y eventos; Open Tech Events, su lector y eventos.wiki permanecen enlazados.
- «Construir con los datos» tiene tres acordeones: datos, código y agentes. El menú y «Descargar y reutilizar los datos» comparten esta vista. Selector compartido de cinco formatos con URL copiable; todas las descargas anteriores (incluidos esquema y catálogos ES/EN), licencia/atribución y documentación siguen disponibles.
- Código y recursos compartidos con el modal anterior, sin duplicar lógica. Los ejemplos de temática incluyen generalistas y excluyen fichas ocultas; el agregador tolera feeds caídos. Instrucciones de agentes: facetas generalistas diferenciadas, fichas ocultas excluidas y ubicación sin proximidad inferida. Licencia en reutilización y sin catálogos bilingües dentro de las instrucciones.
- El prompt `onboarding` conserva sus reglas interpoladas. «Más consultas con IA y contexto del proyecto» mantiene accesible el modal anterior: los otros siete prompts, los contenidos de puesta en marcha retirados del recorrido de dinamización por el usuario y los enlaces de contexto/roadmap. No se modifica inglés ni ninguna entrada aprobada.
- Los recursos de datos y código son el apoyo visual de construcción: no se inventa una captura para un recorrido conceptual. La asistencia del formulario sí lleva captura real ampliable. Se marcan como decorativos los iconos del modal anterior para que no interfieran en los nombres accesibles de las acciones.
- Validación final y pausa de revisión: se registran en `docs/handoff-mejoras-ui.md`. La implementación de fase 2 queda lista para revisión del usuario; no equivale a su aprobación. Conservar este plan.

### Mapa de reubicación del contenido actual

Inventario inicial basado en `src/components/OpenDataModal/OpenDataModal.jsx`, los textos de `src/i18n/locales/es.json` y el modal de Community Builders. Usarlo para verificar que no desaparece contenido durante la reorganización.

| Origen actual | Destino en la nueva estructura |
| --- | --- |
| «Asisto a comunidades»: explicación de búsqueda y prompts `tribe` / `types` | Encontrar mi comunidad → controles del directorio / ayuda de IA. |
| «Asisto a comunidades»: prompts `speaker` / `volunteer` | Aportar a una comunidad → charlas / voluntariado y ayuda de IA. |
| «Organizo una comunidad»: los cuatro pasos, aclaraciones y enlaces OTE | Mejorar el directorio → mantener mi ficha y publicar eventos. Acceso contextual desde Dinamizo una comunidad. |
| «Organizo una comunidad»: prompt `synergies` | Dinamizo una comunidad → colaborar con otra comunidad. |
| «Quiero montar una»: prompts `umbrella` / `gaps`, advertencias y ayuda | Dinamizo una comunidad → apartado secundario «Quiero montar una comunidad». |
| «Construyo con los datos»: descargas, prompt `onboarding`, código e instrucciones de agentes | Construir con los datos, también accesible desde el pie «Descargar y reutilizar los datos». Instrucciones y prompts relevantes también accesibles desde cada objetivo. |
| Cabecera y pie de «Datos abiertos + IA»: licencia, documentación y contribución | Licencia y documentación en reutilización; contribución en Mejorar el directorio. |
| Notas, reglas de prompts y enlaces de roadmap de «Datos abiertos + IA» | Junto al contenido relacionado; no eliminarlos como consecuencia de la redistribución. |
| Modal actual de Community Builders | Se conserva íntegro; accesos desde Dinamizo una comunidad, Sobre el proyecto y final del flujo de propuesta. |
| Selector flotante de soporte | Se conserva; Otra cosa abre el selector existente. |
| Asistencia con IA del formulario de alta/edición | Se conserva en el formulario; se explica su utilidad desde Mejorar el directorio. |

- [x] Inventario contrastado en español: los ocho prompts, los cuatro pasos, descargas, ejemplos, instrucciones, notas y enlaces de contexto siguen accesibles. Se conservan los textos ingleses existentes; su revisión integral se aplaza a la fase 5 por el acuerdo de trabajar solo en español.

Contexto: issue [#299 — Explicar a quién va dirigido este directorio](https://github.com/ComBuildersES/communities-directory/issues/299) y filtros de colaboración añadidos en el commit `7b8dc682a7b87b8a4961fa10a3cbc06a92fc9c5c`.

## Fase 3. Añadir y mantener comunidades

- [x] Listado: colocar una tarjeta diferenciada al principio del grid, dirigida principalmente a quienes organizan.
- [x] Incluir CTA «Añadir mi comunidad» y orientación para encontrar y revisar una ficha existente.
- [x] Mantener la posibilidad de que cualquier persona sugiera mejoras, especialmente en fichas nunca revisadas.
- [x] Probar un brillo sutil y espaciado en el borde, respetando la preferencia de movimiento reducido.
- [x] Mapa: colocar un botón «Añadir comunidad» sobre el mapa, separado de sus controles de navegación.
- [x] Mantener también este recorrido dentro del nuevo modal.
- [x] Revisar el CTA existente al final del listado para evitar duplicaciones innecesarias.

Nota visual: se propuso una animación sutil de sombreado o borde. El brillo suave y espaciado es el punto de partida para probar; no se ha acordado un borde arcoíris definitivo.

## Fase 4. Invitación a Community Builders

- [x] Añadir acceso desde «Descubrir a otras personas que dinamizan comunidades» en el nuevo modal.
- [x] Añadir la invitación en «Sobre el proyecto», después del párrafo del registro de cambios y antes del bloque «¿De dónde salen estos datos?».
- [x] Añadir la invitación al terminar de crear o editar una comunidad.
- [x] Reutilizar el modal actual de Community Builders.
- [x] Explicar con claridad que la invitación sirve para conectar con otras personas que dinamizan comunidades.

### Matiz pendiente

- [x] Determinar el momento concreto de la invitación final: el formulario prepara una propuesta que se envía por una vía externa. No dar a entender que la comunidad ya se ha publicado o actualizado.

## Fase 5. Validación y cierre

- [x] Revisar escritorio y móvil, tanto en listado como en mapa.
- [x] Comprobar navegación con teclado, foco y cierre de modales.
- [x] Al terminar las demás fases, completar y revisar los textos en inglés a partir de la interfaz española acordada.
- [x] Verificar filtros y enlaces desde los nuevos recorridos.
- [x] Añadir pruebas de comportamiento pertinentes y de cualquier bug corregido.
- [x] Ejecutar tests, lint y build.
- [ ] Revisar el resultado con el usuario.
- [ ] Borrar este fichero temporal al terminar.


### Último ajuste de revisión de fase 2

El usuario pide que ninguno de los cinco recorridos abra la primera sección automáticamente. Todos los acordeones comienzan cerrados; las expectativas de las pruebas se actualizan sin ejecutarlas, por petición expresa. Se hace commit del trabajo de UI y se conserva este plan para continuar las fases pendientes. Sin push ni despliegue.


## Cierre de implementación — fases 3–5 y traducciones

Petición del usuario del 13 de noviembre de 2026: terminar todo lo pendiente, incluido el inglés aplazado de la fase 2. Esta petición sustituye las pausas por entrada y las restricciones temporales de idioma de los registros anteriores. No implica commit, push ni despliegue.

- **Listado:** una tarjeta propia al principio del grid, con «Añadir mi comunidad», búsqueda de una ficha existente y apertura a mejoras por cualquier persona. Ocupa una fila independiente para no estirar las tarjetas de comunidades. Se elimina el CTA duplicado al final. Se conserva el acceso con cero resultados. Brillo sutil cada ocho segundos, desactivado con movimiento reducido.
- **Mapa:** «Añadir una comunidad» sobre el mapa, separado de la búsqueda, leyenda y atribución; se conserva el formulario y la selección de comunidades existentes. Verificado con datos y clusters cargados, además del estado inicial.
- **Community Builders:** se conserva el diseño y comportamiento original del botón en «Sobre el proyecto», después del registro de cambios y antes del origen de los datos. La invitación nueva aparece al abrir una propuesta externa desde alta o edición y reutiliza el modal original completo.
- **Momento de la invitación:** abrir GitHub o preparar el correo, con formulario válido. La aplicación no puede saber si se ha enviado la propuesta externa; el aviso exige completar allí el envío y explica que los cambios solo se publican tras revisión. No se presenta un éxito de publicación. No se invita al solicitar una baja ni antes de preparar una propuesta válida.
- **Inglés:** todas las claves de los cinco recorridos, selector de formatos, chips/contadores, notas, capturas, ayuda e invitaciones. Se revisan los ocho prompts, las reglas y las instrucciones copiables, incluidos los límites de ubicación, disponibilidad y tipos. Sin licencia en los prompts ni catálogos bilingües duplicados. Los comentarios de código y el catálogo de etiquetas del ejemplo JS siguen el idioma. Nuevas capturas inglesas reales del aviso de revisión y la asistencia del formulario; se reutilizan búsqueda/filtros ya existentes.
- **Accesibilidad y responsive:** revisión a 1440, 390 y 320 px según el recorrido; sin desbordamiento del listado ni del mapa. Acordeones inicialmente cerrados, apertura exclusiva, teclado, tooltips/Escape, vuelta de foco, separación del botón de mapa y movimiento reducido. El icono decorativo de «Sobre el proyecto» deja de alterar su nombre accesible.
- **Validación:** 511 pruebas Vitest correctas; 16 casos de navegador verificados entre las suites de aportación, organización y cierre. Se prueban filtros, recuentos, copias exactas, catálogos del idioma, alta/edición/correo y navegación sin enviar propuestas. Lint de los componentes nuevos, traducción y pruebas modificadas correcto; el lint global sigue con errores previos ajenos (scripts/configuración, props y variables sin uso). Build de producción correcto, con avisos previos de imágenes del dataset y tamaño de chunks de ArcGIS.

Se conserva este plan **solo para la revisión final conjunta** y su posterior eliminación. No se ha hecho commit, push ni despliegue. Los documentos locales de contactos, invitaciones y n8n permanecen intactos.


### Ajustes de la revisión final

- Restaurado el diseño original de «¿Dinamizas una comunidad tech?» en «Sobre el proyecto», sin introducir allí la tarjeta de invitación del formulario.
- Tarjeta del listado: pregunta para quienes dinamizan o participan, utilidad de los metadatos y búsqueda/revisión/alta. «Pendientes de revisión» aplica ese filtro manteniendo los demás criterios.
- Tarjeta cerrable, con preferencia persistente en localStorage. Cerrada, se convierte en «Mejorar el directorio», antes de «Qué puedes hacer aquí»; permite reabrirla y volver al listado desde el mapa conservando filtros. Teclado y foco comprobados, también tras recargar.
- Botón de alta del mapa arriba a la izquierda; en mapas estrechos se separa verticalmente del buscador.
- Validación actualizada: 513 tests correctos, lint específico y pruebas de navegador de los nuevos comportamientos, incluyendo 320 px. Se conservan los errores previos del lint global y el plan hasta la revisión conjunta.


### Revisión del 14 de noviembre — tira y panel de contribución

- Se continúa sobre los cambios del otro agente: tira y panel separados. La tira pierde los recuentos, reparte texto/acción entre extremos y tiene un cierre visible con clave propia y caducidad de 30 días. Cerrar una pieza no silencia la otra.
- La variante filtrada explica primero la posible falta de etiquetas y ofrece búsqueda por nombre; el alta secundaria aclara que falta «en el directorio». Traducciones ES/EN actualizadas.
- Panel con dos columnas desde 900 px, nota inferior a todo el ancho y botón azul con texto blanco mediante clase propia. No se cambia el resto de botones.
- Posición mediante `resolveCtaPanelPlacement`: al final con ≤24 resultados o tras la ficha 24 con más resultados. Siempre hay un solo panel; el intercalado ocupa toda la fila.
- Store generalizado en `createDismissStore(key)`. `CLAUDE.md` registra el motivo del umbral y las claves separadas.
- 532 tests y siete pruebas de navegador correctos; lint específico correcto, con los problemas previos de lint global aún fuera de alcance. Comprobación visual de escritorio y móvil, cierres y recargas independientes, umbral, búsqueda por nombre y contraste. Build de producción correcto (59 s), con avisos previos del dataset y chunks de ArcGIS.


### Ajuste de filas completas y acciones del panel — 14 de noviembre

- Se sustituye el corte fijo de 24 fichas por la siguiente fila completa, según las columnas calculadas del grid. Con 13 columnas son 26 fichas; con 14 son 28. Si no quedan más fichas, el panel permanece al final.
- Recalcular mediante `ResizeObserver` y resize de ventana, también ante cambios del ancho del contenedor. Una sola instancia del panel, sin huecos añadidos en la fila anterior.
- Acciones de escritorio apiladas y alineadas a la derecha, próximas a «Ahora no». Móvil conservado.
- 544 tests y cinco pruebas de navegador correctos, con redimensionado entre 320 y 1900 px y cambios de ancho del contenedor. Lint específico correcto con el error previo de props en `CommunitiesList.jsx` aún fuera de alcance. Build de producción correcto (1 min 10 s). `CLAUDE.md` actualizado con la nueva política.


### Simplificación de la invitación — 14 de noviembre

- Se retira la tira: repetía la búsqueda del buscador y del panel. Una sola invitación integrada en el listado.
- Dos botones visibles apilados: «Añadir una comunidad» principal y «Buscar mi comunidad» secundario con borde, del mismo ancho. Se mantiene esa etiqueta porque la acción abre el buscador, no la revisión de una ficha directamente.
- Texto actualizado sobre datos incompletos o desactualizados que pueden no aparecer en búsquedas; «Estos datos son abiertos» en negrita. Inglés y `CLAUDE.md` coherentes.
- Se eliminan estado/estilos/traducciones exclusivos de la tira. Persistencia y reapertura del panel, filas completas y demás recorridos conservados.
- 543 tests y cinco pruebas de navegador correctos; lint específico correcto, con el error previo de props fuera de alcance. Build de producción correcto (1 min 4 s). El plan sigue pendiente de revisión final conjunta.


### Espaciado del panel — 14 de noviembre

Por petición del usuario, margen superior e inferior iguales: `1rem`. Comprobado en navegador a 1900 y 390 px: la separación real respecto a las tarjetas es idéntica arriba y abajo (23,19 px y 22,39 px, respectivamente, incluyendo el gap del grid). Cambio exclusivo de CSS, sin repetir tests ni build.


### Introducción del menú y commit — 14 de noviembre

Por petición del usuario, la introducción queda en «Asistentes, ponentes, personas que dinamizan comunidades y quienes crean herramientas pueden aprovechar este directorio.». Se retira el añadido HTML «open data» y se ajusta inglés. El usuario solicita commit del trabajo de UI pendiente; se excluyen los documentos locales de contactos, invitaciones y n8n. El changelog lo genera el hook del repositorio; no se edita a mano. No se solicita push ni despliegue. El plan se conserva para la revisión final conjunta.
