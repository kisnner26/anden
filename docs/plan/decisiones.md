# decisiones

Registro de decisiones tomadas durante el desarrollo. Una por entrada, la más reciente arriba. Las preguntas abiertas van marcadas como **abierta** hasta que el dueño del proyecto responda.

| fecha | tarea | decisión | por qué |
|---|---|---|---|
| 2026-11-03 | T-105 | terminales del corredor: Mercado Mayoreo, Managua (12.13413, -86.19330; OSM 528862794), Terminal de Buses de Managua, Boaco (12.46901, -85.65587; OSM 405153082) y Terminal Mayales, Juigalpa (12.09172, -85.36106; OSM 209135788) | coordenadas y nombres contrastados en OpenStreetMap mediante GeoView/Mapcarta; Mercado Mayoreo figura además como terminal para Boaco y Chontales en COMMEMA |
| 2026-11-03 | producto | la primera operación se limita a Boaco–Managua y Juigalpa–Managua, en ambos sentidos; ubicación automática se controla desde configuración y la reserva terminada vuelve a la navegación principal con Boletos activo | decisión explícita del dueño tras probar la app en iphone; reduce el alcance y elimina controles y recorridos confusos |
| 2026-11-03 | T-089 | las coordenadas de terminales y las rutas de regreso a Managua son datos de muestra | sirven para proponer un origen y mostrar el flujo completo mientras no exista una fuente operativa verificada |
| 2026-11-02 | producto | se permite elegir foto solo desde la galería y pedir ubicación solo en primer plano tras una acción explícita; la cámara, el micrófono, la ubicación en segundo plano y las notificaciones remotas siguen fuera | decisión explícita del dueño: el perfil puede personalizarse y el origen puede sugerirse sin conservar ni enviar ubicación; la cuenta gratuita de Apple solo usará notificaciones locales |
| 2026-11-02 | T-016 | **resuelta por el orquestador, el dueño puede vetarla**: `Boleto.cambioUsado`, `puedeCambiar` con objeto de parámetros y errores tipados, y `RepositorioBoletos.cambiar` recibe además el asiento nuevo (cambia un contrato público de `packages/datos`, todavía sin implementar). Pregunta original: firma, resultado y persistencia de uso para `puedeCambiar(...)` | `Boleto` no registra un cambio usado y el tablero omite los parámetros y errores esperados; decidirlo alteraría un contrato público |
| 2026-11-02 | T-015 | **resuelta**: `FiltroBusqueda`, `DatosViajes` y `ResultadoViaje` definidos en el tablero; la calificación del chofer queda para T-022. Pregunta original: las formas públicas de `FiltroBusqueda`, `datos` y `ResultadoViaje` para `buscarViajes` | el tablero especifica la regla pero no las estructuras de entrada ni salida; inventarlas cambiaría un contrato público del dominio |
| 2026-11-02 | T-014 | **resuelta**: `estadoViaje` recibe la ruta y la llegada es la salida real más la duración (regla en `01-producto.md`). Pregunta original: cómo `estadoViaje(viaje, ahora)` conoce la llegada | `Viaje` no tiene duración ni llegada y la firma no recibe `Ruta`, por lo que no puede distinguir “en ruta” de “llegó” |
| 2026-11-02 | T-013 | **resuelta**: la entrada es `Ocupacion[]`, una fila por asiento como la tabla `ocupaciones`, y T-013 pasa a depender de T-014 por `ventaAbierta`. Pregunta original: el tipo de entrada `ocupaciones` y la forma de representar ventas | `estadoAsientos(config, ocupaciones, ahora)` y `puedeRetener(...)` se piden sin contrato para diferenciar una `Retencion` de un asiento vendido ni sus datos de viaje |
| 2026-11-02 | T-012 | **resuelta**: `Tramo` son índices de `ruta.paradas` y el parcial se prorratea por minutos (regla en `01-producto.md`). Pregunta original: la representación de `tramo` y el prorrateo de la tarifa parcial | el plan pide `calcularPrecio(ruta, tramo, tipoBus, pasajeros)` y probar un tramo parcial, pero `Ruta` no define el tramo ni la regla de reparto de su tarifa base |
| 2026-11-02 | plan | nombre Andén, bundle `com.kisnner.anden` | nombre corto, propio del viaje en bus; un solo App ID por el límite de la cuenta gratuita de Apple |
| 2026-11-02 | plan | Expo + Supabase, datos en memoria primero | la app se puede construir y probar completa antes de tener backend |
| 2026-11-02 | T-066 | **abierta**: pasarela de pago real | Stripe no opera en Nicaragua; hay que elegir una que sí |
| 2026-11-02 | T-010 | `Retencion` lleva `id` y `Boleto` lleva `duenoId` | el contrato usa `liberar(retencionId)`, `comprar(retencionId, ...)` y `misBoletos(duenoId)`, que no se pueden cumplir sin esos campos |
| 2026-11-02 | T-010 | fechas y horas como texto ISO 8601 con desfase; los esquemas lo exigen | el viaje sale en hora de Managua (-06:00) y el servidor puede devolver UTC; ambas se aceptan |
| 2026-11-02 | T-011 | preferenciales = asientos de las dos primeras filas con asientos (coaster: 1 a 5); ventana = columnas de los bordes; el resto pasillo | el plano de la coaster del mockup aprobado marca 1 a 5 como preferenciales y "primera fila" daría solo el asiento 1 junto al chofer |
| 2026-11-02 | T-006a | el titular usa Archivo Narrow Bold de forma provisional | `@expo-google-fonts/archivo` solo trae el ancho normal; el corte ExtraCondensed del mockup se trae como archivo local en T-006b |
| 2026-11-02 | marco MTI | el precio es la tarifa oficial del MTI y los servicios son ordinario, expreso y taxi-interlocal; sin multiplicadores ni prorrateo (ver `05-marco-mti.md`) | la Ley 524 y la RM 051-2017 fijan la tarifa por ruta y servicio y sancionan cobrar distinto |
| 2026-11-02 | marco MTI | **abierta**: conseguir el anexo vigente de tarifas del MTI | la RM 051-2017 es la última confirmada y sus precios están en un anexo aparte; sin él todo precio es de muestra (T-077) |
| 2026-11-02 | marco MTI | **abierta**: cómo cobra la app sin alterar el pasaje | cobrar de más o de menos sobre la tarifa autorizada es sancionable; una comisión tendría que ir aparte o la pagaría la cooperativa, y eso lo decide el dueño del proyecto |
| 2026-11-02 | marco MTI | **abierta**: validar reembolsos, cambio de salida, retención, cierre de venta y niños en brazos | son reglas mías sin respaldo normativo; se validan con el MTI, una cooperativa o un abogado de transporte |
| 2026-11-02 | marco MTI | **abierta**: si el servicio ordinario asigna asientos y se compra por adelantado | hoy el pasaje se paga al abordar; puede que solo el expreso sea reservable |
| 2026-11-02 | ui-v2 | las primeras pantallas leen datos de muestra locales (`apps/movil/src/datos/muestra.ts`) detrás de hooks (`useSalidas`, `useMapaAsientos`, `useSeleccionAsientos`) que usan las funciones del dominio | la fase 2 (contrato, semilla, repositorio en memoria y proveedor, T-020 a T-024) todavía no existe; los hooks conservan la forma para que T-024 cambie solo su origen |
| 2026-11-02 | ui-v2 | `src/datos/formato.ts` formatea la hora en 12 horas de forma provisional | T-018 lo moverá al dominio con sus pruebas es-NI |
| 2026-11-02 | T-083 | pago en efectivo: se paga la tarifa exacta al abordar y la reserva no cobra nada; los boletos se guardan en el teléfono | el pasaje se paga al abordar hoy y la pasarela real sigue abierta (T-066); reembolso y retención siguen de muestra |
| 2026-11-02 | T-080 | `puedeRetener` solo deja renovar una retención propia, no un asiento vendido | un asiento vendido a la misma persona se podía volver a reservar |
| 2026-11-02 | T-085 | la placa se muestra en el taxi interlocal y en el detalle del viaje; las rutas se arman desde los datos de muestra (`armarRutas`) | el MTI identifica cada unidad por su placa; el mapa de rutas queda para después |
| 2026-11-03 | permisos | la app puede pedir la ubicación en primer plano solo cuando la persona la activa, sin guardarla ni enviarla, y puede elegir fotos de la galería; la cámara y el micrófono siguen prohibidos | decisión del dueño del proyecto; sustituye la regla anterior de no usar ubicación |
| 2026-11-03 | notificaciones | las notificaciones son locales (recordatorios y avisos del viaje); no hay push remotas | la cuenta gratuita de Apple no firma esa capacidad |

| 2026-11-03 | T-103 | el corredor inicial son Boaco–Managua y Juigalpa–Managua (departamentos reales), no Wácwala ni Chagüilpa; coordenadas de muestra: Boaco 12.4719, -85.6590; Juigalpa 12.1064, -85.3647 | el dueño corrigió los nombres que Codex había tomado del plan |

## 2026-11-12 · T-114 · la ubicación para llegar la pide Apple Maps

Decisión: para llegar a la terminal, Viajar abre Apple Maps con un enlace de indicaciones (`daddr`, nombre y modo en auto). Apple Maps pide la ubicación por su cuenta y la app no la lee, no la guarda ni la envía. La búsqueda de la terminal más cercana sigue siendo opcional y solo en primer plano desde Ajustes.
Por qué: integra la experiencia en el ecosistema de Apple sin ampliar el uso de la ubicación ni sumar un mapa propio. Un mapa embebido de MapKit exigiría una dependencia nativa nueva y queda como tarea futura si se pide.


## 2026-11-12 · mejora-ux · cuenta local, Face ID, mascota, opiniones y mapa simulado

Pedido explícito del dueño del proyecto: que la app se sienta completa como una app de transporte por demanda, con más funciones, animación, sonido y uso del hardware del iPhone.

Decisión 1 (cuenta): la "cuenta" es local. Nombre, apellido y teléfono se guardan en el perfil del teléfono; no hay correo, contraseña ni servidor. Se ofrece al terminar la portada y se puede omitir.
Por qué: no existe backend. Cuando exista, la cuenta local migra a una cuenta real sin cambiar las pantallas.

Decisión 2 (Face ID): bloqueo opcional con `expo-local-authentication`. Se pide al abrir y al volver tras 60 segundos fuera. Si el teléfono no tiene biometría configurada, el bloqueo no se activa, para no dejar a nadie sin sus boletos. El código del teléfono queda como respaldo del sistema.

Decisión 3 (mascota): la mascota es el bus de personaje de la marca. Saluda en Viajar por franja del día y se apaga en Configuración. Viene encendida.

Decisión 4 (opiniones y reportes): se guardan solo en el teléfono y cualquiera puede opinar. Queda abierto atarlas al boleto usado (`puedeCalificar`) cuando exista servidor, y cambiar entonces el texto "solo califican quienes ya hicieron el viaje" de `chofer.nota`.

Decisión 5 (mapa): el detalle del corredor lleva un mapa de Apple Maps con `react-native-maps`, sin clave ni permisos extra. El bus que se ve es una simulación que da vueltas al recorrido según el reloj, y la pantalla lo dice ("Simulación" y una nota). El trazo une las terminales en línea recta, no sigue la carretera. Reemplaza la nota de T-114 de dejar el mapa embebido para después.
Por qué: el dueño lo pidió. La simulación nunca se presenta como posición real de una unidad; eso espera datos operativos y un servidor.

Decisión 6 (modos de uso): tres modos en Configuración. Completo (todo igual), Sencillo (letra 25 % más grande, sin animaciones) y Rápido (sin animaciones ni mascota). La escala se aplica desde los tokens de tipografía, sin tocar cada pantalla. Respetan además "reducir movimiento" del sistema.

Decisión 7 (opiniones atadas al boleto): se opina con un boleto no cancelado de un viaje del chofer que ya salió, una vez por boleto, y la opinión queda marcada "Viajó con este chofer". Se usa la hora de salida en vez del estado `usado` porque ese estado lo marca la terminal y todavía no hay servidor. Cuando exista, pasa a `puedeCalificar`. La nota del chofer suma las opiniones de este teléfono a la base. Sustituye lo abierto en la decisión 4.

Decisión 8 (favoritos y disponibilidad): los corredores se marcan con estrella y se guardan en el teléfono. "Pocos asientos" son cinco o menos. La tarjeta de corredor muestra la próxima salida de los datos de muestra, no horas escritas a mano.

Decisión 9 (carretera real en el mapa): el trazo de Managua a Boaco (82,9 km) y a Juigalpa (133,5 km) sale de OpenStreetMap vía OSRM, se consultó una sola vez con `herramientas/generar-trazos.py` y vive en `src/datos/trazos.ts`; la app no consulta nada en línea. El bus ejemplo sigue ese camino y su ciclo dura lo que dura el viaje por carretera. Sigue marcado "Simulación" y el detalle cita la fuente (licencia ODbL). Reemplaza la línea recta de la decisión 5.

Preguntas abiertas: reemplazar la simulación del bus por posiciones reales y mover opiniones, favoritos y cuenta a un servidor.
