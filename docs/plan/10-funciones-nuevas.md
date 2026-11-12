# Funciones nuevas: qué hay hoy y qué espera al servidor

Pedido del dueño del proyecto el 2026-11-12: reserva para otro día, viaje habitual, cierre del viaje del conductor, encomiendas, lista de espera, compartir el viaje con una persona de confianza, objetos olvidados, rol operador, posiciones reales y notificaciones push. Las ideas de taxi quedaron fuera: Andén es para interlocales.

Regla de siempre: lo que hoy se guarda en el teléfono pasa a Supabase cuando exista el servidor, sin cambiar las pantallas (ver `07-roles-y-supabase.md`). Cada función dice qué parte es real y cuál es de muestra.

## ya está en la app

| Función | Cómo funciona hoy | Qué falta con servidor |
| --- | --- | --- |
| **Reservar para otro día** | "Hoy" y seis días más. Horarios trae un selector de día; Viajar ofrece "Reservar para otro día". La muestra trae seis salidas diarias por sentido. El detalle, los asientos y el boleto dicen la fecha. | Los horarios reales de cada cooperativa, feriados y salidas especiales. |
| **Mi viaje habitual** | Se guarda desde un boleto ("Guardar como mi viaje habitual"). Viajar muestra la tarjeta con la próxima salida que coincide en trayecto, día de la semana y hora (margen de 45 minutos). | Aviso automático antes de la salida habitual y sincronizar entre teléfonos. |
| **Cierre del viaje (conductor)** | "Terminar viaje" muestra el resumen del cobro: cuántos pagaron, cobrado, por cobrar y quién no pagó. Al confirmar el viaje queda cerrado y de solo lectura. La lista de viajes marca los cerrados. | Que el cierre llegue a la cooperativa y que el conductor vea los boletos de otros teléfonos. |
| **Lista de espera** | En una salida llena el botón pide "Avisarme si se libera". Cuando la salida tiene asientos, aparece un aviso en la pantalla de avisos. | Detectar la liberación en tiempo real y mandar una notificación push. Con los datos de muestra los asientos no se liberan solos. |
| **Persona de confianza** | Se guarda un contacto (teléfono de Nicaragua) y el botón del boleto abre Mensajes con el viaje ya escrito: destino, hora, llegada estimada, placa y chofer, sin el código del boleto. | Un enlace para seguir el viaje en vivo, que necesita las posiciones reales. |
| **Objetos olvidados** | En un boleto cuya salida ya pasó se describe el objeto y queda guardado en el teléfono. | Avisar al conductor y a la cooperativa, y devolver una respuesta. |
| **Encomiendas** | Una solicitud con trayecto, quién envía, quién recibe, teléfono, descripción y tamaño. Queda con un código `ENC-XXXXXX` y el estado "solicitada". No se cobra nada. | Tarifa, confirmación de la cooperativa, entrega y seguimiento. La tarifa de encomiendas no está en el marco del MTI: hay que consultarla antes de mostrar un precio. |

## espera al servidor y a decisiones

### posiciones reales y notificaciones push

Ya está planeado en `07-roles-y-supabase.md`: el conductor transmite en primer plano y el pasajero ve el avance sobre la carretera. Falta Supabase Realtime y, para los avisos con la app cerrada, notificaciones push (hoy solo hay recordatorios locales). Las push necesitan la entitlement de notificaciones de Apple, que hoy se quita al compilar con la cuenta gratuita.

### rol operador

El tercer rol previsto: personal de la cooperativa o de la terminal. Alcance propuesto, en este orden:

1. Dar de alta conductores y asignar chofer y unidad a cada viaje.
2. Ver la ocupación de cada salida y la flota en vivo.
3. Ver los cierres de viaje de los conductores y el ingreso por día.
4. Atender los reportes de objetos olvidados y los de choferes.
5. Confirmar o rechazar encomiendas.

Pregunta abierta: si el panel es una pantalla dentro de la app o una página web aparte. Un panel de escritorio es lo normal para quien trabaja en una oficina; hay que decidirlo antes de construir.

### compartir el viaje en vivo con una persona de confianza

Hoy es un mensaje de texto. Para que la persona vea el avance hace falta un enlace con las posiciones del viaje y una página que lo muestre sin instalar la app. Reglas: el enlace caduca al terminar el viaje y no revela el código del boleto ni datos del pasajero.

## decisiones tomadas

- El taxi interlocal sigue siendo un servicio del MTI y no se quitó; solo se descartó la idea "faltan N para salir".
- Los días siguientes de la muestra usan seis salidas fijas por sentido (5:30, 7:00, 9:30, 12:00, 15:00 y 17:30). Son datos de muestra, no horarios reales.
- Las listas "de hoy" (Viajar, Horarios, Buscador, tarjetas de corredor y la lista del conductor) muestran solo el día elegido; quien busca un viaje por su id ve todos los días y todas las terminales.
- Un viaje habitual es una salida parecida a la que la persona hizo: mismo trayecto, mismo día de la semana y hora dentro de 45 minutos.
- Un viaje cerrado no se puede cambiar, ni los pagos.
- Los reportes y las solicitudes dicen con claridad que hoy solo quedan en el teléfono.
