# Plan temporal de mejoras de UI/UX

Estado: fase 1 revisada. «Encontrar mi comunidad» (primera entrada de la fase 2) terminada y aprobada por el usuario. Próxima sesión: «Aportar a una comunidad».

Continuidad y aprendizajes: [handoff de las mejoras de UI](handoff-mejoras-ui.md).

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

- [x] Mostrar las cinco entradas iniciales de la tabla.
- [ ] Al elegir una, mostrar una explicación breve antes de las acciones disponibles.
- [x] Permitir volver al menú inicial.

| Entrada | Posibilidades |
| --- | --- |
| Encontrar mi comunidad | Buscar por afinidad o ubicación. |
| Aportar a una comunidad | Proponer charlas, participar como coorganizador, ayudar con voluntariado o mentoría, ofrecer patrocinio o espacios. |
| Dinamizo una comunidad | Conectar con Community Builders o encontrar otras comunidades abiertas a colaborar. |
| Mejorar el directorio | Añadir una comunidad o encontrar su ficha para corregirla. |
| Otra cosa | Abrir el selector de ayuda existente (`support-fab-chooser` / `support-fab-choice`). |

- [ ] Integrar las posibilidades actuales de IA y reutilización de datos en los recorridos donde resulten útiles.
- [x] Añadir al pie un acceso discreto a «Descargar y reutilizar los datos».
- [x] Explicar que «Abiertas a» indica disponibilidad declarada, sin implicar una convocatoria vigente.
- [ ] Conectar las acciones con los filtros o interfaces existentes que correspondan.

### Qué ocurre al pulsar una entrada

Cada entrada abre una vista de detalle dentro del modal. Primero explica cómo lograr ese objetivo con los controles del directorio; después ofrece acciones para usarlos y, cuando corresponda, alternativas con IA. No aplicar filtros ni abrir herramientas automáticamente al pulsar la entrada inicial.

- [x] Usar una lista de bloques breves cuando el contenido sea corto.
- [x] Usar pestañas para separar contenido extenso, por ejemplo «Con el directorio» y «Con ayuda de IA», según la cantidad de contenido de cada recorrido. La estructura exacta se decidirá al maquetar, manteniendo los contenidos descritos aquí.
- [ ] Mantener las explicaciones visibles antes de los CTA y permitir volver a las cinco entradas.
- [ ] Conservar los prompts copiables y las instrucciones existentes: reubicarlos por objetivo, sin perder contenido al retirar el botón «Datos abiertos + IA» de la cabecera.

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

- [ ] Explicar las siete disponibilidades: ponentes, personas coorganizadoras, voluntariado, mentoría, patrocinio, espacios y colaboraciones entre comunidades.
- [ ] Explicar cómo combinar «Abierta a…» con temática, formato, idioma y exploración del mapa.
- [ ] Explicar cómo abrir la ficha y contactar: disponibilidad declarada no equivale a una oferta urgente, un C4P abierto ni una plaza garantizada. Ausencia del dato significa sin información, no rechazo.
- [ ] Separar charlas, voluntariado, mentoría y apoyo con patrocinio o espacios en bloques breves o pestañas si el contenido lo requiere.
- [ ] Reubicar los prompts completos «Dónde dar una charla» y «Echar una mano», incluidos los límites sobre C4Ps y la necesidad de confirmar la disponibilidad con la comunidad.
- [ ] Ofrecer acciones para ver comunidades con la disponibilidad elegida y copiar los prompts correspondientes. No presentar como existentes prompts específicos de mentoría, patrocinio o espacios que aún no se han creado.

#### Dinamizo una comunidad

- [ ] **Conectar con otras personas que dinamizan:** explicar Community Builders y ofrecer acceso a su modal actual, conservando quiénes somos, qué hacemos, historias reales y cómo unirse.
- [ ] **Colaborar con otra comunidad:** explicar el filtro de colaboraciones y reubicar el prompt completo «Sinergias para mi comunidad», con sus propuestas de colaboración local, entre ciudades y posible reactivación.
- [ ] **Quiero montar una comunidad:** conservar como apartado secundario el contenido actual de esa pestaña, aunque no sea una sexta entrada inicial. Reubicar los prompts completos «Quién me puede acoger o apoyar» y «Huecos del ecosistema», sus advertencias y las vías de ayuda.
- [ ] **Dar visibilidad a mi comunidad:** orientar hacia «Mejorar el directorio» para mantener la ficha, las etiquetas, los enlaces y los eventos al día.

#### Mejorar el directorio

- [ ] Explicar cómo buscar primero una comunidad para evitar duplicados, solicitar su alta si falta y proponer cambios desde una ficha existente.
- [ ] Explicar los datos revisados y pendientes de revisión y permitir aportar también a quien no organiza la comunidad.
- [ ] Reubicar los cuatro pasos actuales de «Organizo una comunidad»: ficha al día, temáticas y público, enlaces vivos y publicación de eventos.
- [ ] Conservar la explicación de cómo esos datos ayudan al descubrimiento con IA, el significado de la revisión humana y la aclaración de que no se necesita saber Git.
- [ ] Conservar los enlaces y explicaciones de Open Tech Events, su lector y eventos.wiki, así como las vías de consulta por Telegram, GitHub y lista de correo.
- [ ] Explicar el flujo de propuesta y revisión sin afirmar que enviar una propuesta publica automáticamente los cambios.
- [ ] Dar acceso al formulario y mantener su asistencia actual con IA para preparar los datos.

#### Otra cosa

- [ ] Abrir el selector de ayuda existente y conservar sus opciones y canales. No crear un recorrido paralelo con enlaces distintos.

#### Acceso al pie: Descargar y reutilizar los datos

- [ ] Abrir un detalle de reutilización desde el enlace discreto del pie, sin añadir una sexta entrada principal.
- [ ] Conservar los ficheros descargables: JSON, CSV, GeoJSON, esquema, taxonomías de temáticas y públicos en ambos idiomas, `llms.txt` y `llms-full.txt`.
- [ ] Conservar la licencia CC BY 4.0, los requisitos de atribución y el acceso a la documentación de datos.
- [ ] Reubicar los ejemplos actuales de shell, JavaScript, Python y lectura de feeds OTE, junto con sus notas sobre el esquema y la interpretación de los datos.
- [ ] Conservar el prompt «Poner al día a tu agente», las instrucciones completas para agentes y los enlaces a `llms.txt`, `AGENTS.md` y `robots.txt`, incluida la explicación de que no hace falta MCP.
- [ ] Mantener accesibles las reglas comunes que acompañan a los prompts, las advertencias sobre datos sin revisar y los enlaces de contexto y roadmap existentes.

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

### Mapa de reubicación del contenido actual

Inventario inicial basado en `src/components/OpenDataModal/OpenDataModal.jsx`, los textos de `src/i18n/locales/es.json` y el modal de Community Builders. Usarlo para verificar que no desaparece contenido durante la reorganización.

| Origen actual | Destino en la nueva estructura |
| --- | --- |
| «Asisto a comunidades»: explicación de búsqueda y prompts `tribe` / `types` | Encontrar mi comunidad → controles del directorio / ayuda de IA. |
| «Asisto a comunidades»: prompts `speaker` / `volunteer` | Aportar a una comunidad → charlas / voluntariado y ayuda de IA. |
| «Organizo una comunidad»: los cuatro pasos, aclaraciones y enlaces OTE | Mejorar el directorio → mantener mi ficha y publicar eventos. Acceso contextual desde Dinamizo una comunidad. |
| «Organizo una comunidad»: prompt `synergies` | Dinamizo una comunidad → colaborar con otra comunidad. |
| «Quiero montar una»: prompts `umbrella` / `gaps`, advertencias y ayuda | Dinamizo una comunidad → apartado secundario «Quiero montar una comunidad». |
| «Construyo con los datos»: descargas, prompt `onboarding`, código e instrucciones de agentes | Acceso al pie «Descargar y reutilizar los datos». Instrucciones y prompts relevantes también accesibles desde cada objetivo. |
| Cabecera y pie de «Datos abiertos + IA»: licencia, documentación y contribución | Licencia y documentación en reutilización; contribución en Mejorar el directorio. |
| Notas, reglas de prompts y enlaces de roadmap de «Datos abiertos + IA» | Junto al contenido relacionado; no eliminarlos como consecuencia de la redistribución. |
| Modal actual de Community Builders | Se conserva íntegro; accesos desde Dinamizo una comunidad, Sobre el proyecto y final del flujo de propuesta. |
| Selector flotante de soporte | Se conserva; Otra cosa abre el selector existente. |
| Asistencia con IA del formulario de alta/edición | Se conserva en el formulario; se explica su utilidad desde Mejorar el directorio. |

- [ ] Antes de dar por terminada esta fase, contrastar este inventario con la implementación y comprobar que los ocho prompts actuales, los cuatro pasos para organizadores, las descargas, los ejemplos y las instrucciones siguen accesibles en español e inglés.

Contexto: issue [#299 — Explicar a quién va dirigido este directorio](https://github.com/ComBuildersES/communities-directory/issues/299) y filtros de colaboración añadidos en el commit `7b8dc682a7b87b8a4961fa10a3cbc06a92fc9c5c`.

## Fase 3. Añadir y mantener comunidades

- [ ] Listado: colocar una tarjeta diferenciada al principio del grid, dirigida principalmente a quienes organizan.
- [ ] Incluir CTA «Añadir mi comunidad» y orientación para encontrar y revisar una ficha existente.
- [ ] Mantener la posibilidad de que cualquier persona sugiera mejoras, especialmente en fichas nunca revisadas.
- [ ] Probar un brillo sutil y espaciado en el borde, respetando la preferencia de movimiento reducido.
- [ ] Mapa: colocar un botón «Añadir comunidad» sobre el mapa, separado de sus controles de navegación.
- [ ] Mantener también este recorrido dentro del nuevo modal.
- [ ] Revisar el CTA existente al final del listado para evitar duplicaciones innecesarias.

Nota visual: se propuso una animación sutil de sombreado o borde. El brillo suave y espaciado es el punto de partida para probar; no se ha acordado un borde arcoíris definitivo.

## Fase 4. Invitación a Community Builders

- [ ] Añadir acceso desde «Dinamizo una comunidad» en el nuevo modal.
- [ ] Añadir la invitación en «Sobre el proyecto», después del párrafo del registro de cambios y antes del bloque «¿De dónde salen estos datos?».
- [ ] Añadir la invitación al terminar de crear o editar una comunidad.
- [ ] Reutilizar el modal actual de Community Builders.
- [ ] Explicar con claridad que la invitación sirve para conectar con otras personas que dinamizan comunidades.

### Matiz pendiente

- [ ] Determinar el momento concreto de la invitación final: el formulario prepara una propuesta que se envía por una vía externa. No dar a entender que la comunidad ya se ha publicado o actualizado.

## Fase 5. Validación y cierre

- [ ] Revisar escritorio y móvil, tanto en listado como en mapa.
- [ ] Comprobar navegación con teclado, foco y cierre de modales.
- [ ] Al terminar las demás fases, completar y revisar los textos en inglés a partir de la interfaz española acordada.
- [ ] Verificar filtros y enlaces desde los nuevos recorridos.
- [ ] Añadir pruebas de comportamiento pertinentes y de cualquier bug corregido.
- [ ] Ejecutar tests, lint y build.
- [ ] Revisar el resultado con el usuario.
- [ ] Borrar este fichero temporal al terminar.
