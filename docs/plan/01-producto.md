# 01 · producto

Andén: app móvil (iOS y Android) para viajar en buses interurbanos e interlocales en Nicaragua. Reservar asiento, comprar el boleto, ver horarios y rutas, saber quién maneja y dónde viene el bus.

Nombre de marca con tilde (Andén). En código, rutas, paquetes y bundle id va sin tilde: `anden`.

## el problema

Hoy el viaje interlocal se resuelve llegando a la terminal y preguntando: no se sabe a qué hora sale el próximo, si va lleno, de qué andén sale ni quién maneja. Se paga en efectivo, sin comprobante, y si el bus se atrasa nadie avisa.

## a quién sirve

| persona | qué necesita |
|---|---|
| pasajero frecuente (trabaja en Managua, vive en Boaco o Juigalpa) | ver la próxima salida en segundos, comprar sin hacer fila, boleto offline |
| viajero ocasional (Boaco, Juigalpa) | comparar horarios y tipos de bus, elegir asiento, saber duración y paradas |
| quien manda a un familiar | comprar el boleto para otra persona y seguir el bus en vivo |
| chofer y cooperativa (fase posterior) | ver su viaje asignado, validar boletos por código, reportar atrasos |

## corredor inicial

La primera operación pública se limita a taxis interlocales entre **Boaco y Managua** y entre **Juigalpa y Managua**, en ambos sentidos. No se muestran otros destinos como si estuvieran disponibles. La terminal exacta en Managua, los horarios, las coordenadas, las unidades y las tarifas quedan como datos de muestra hasta verificarlos con la cooperativa y el MTI.

## funciones de la v1

Todo lo de esta tabla entra en la primera versión publicable. El orden de construcción está en `04-tareas.md`.

| área | función | detalle |
|---|---|---|
| buscar | buscador de viaje | origen, destino, fecha, número de pasajeros; rutas frecuentes y recientes arriba |
| buscar | resultados | lista de salidas con hora, duración, servicio (ordinario, expreso o taxi interlocal), precio en C$, asientos libres, calificación del chofer |
| horarios | tablero de salidas | por terminal, al estilo tablero de andén: próximas salidas, andén, estado (a tiempo, abordando, atrasado, salió) |
| horarios | horario por ruta | todas las salidas del día de una ruta, con primera y última |
| rutas | mapa de rutas | todas las rutas sobre un mapa oscuro; tocar una muestra paradas, distancia y duración |
| rutas | detalle de ruta | línea de recorrido con paradas, tiempos entre paradas, terminales de origen y destino |
| asientos | mapa del bus | plano del bus según su configuración (microbús 15, coaster 26, bus 45), asientos libres, retenidos y vendidos |
| asientos | retención | al elegir un asiento queda retenido 10 minutos; si no se paga, se libera solo |
| compra | pasajeros | nombre y, opcional, cédula; pasajeros guardados para reusar |
| compra | pago | interfaz de pago con proveedor simulado en la v1; la pasarela real se decide aparte (Stripe no opera en Nicaragua) |
| boleto | boleto digital | talón con código de 8 caracteres y QR para que lo lea el lector de la cooperativa; funciona sin conexión |
| boleto | mis boletos | próximos y pasados, con cuenta regresiva a la salida y andén |
| boleto | cancelar o cambiar | según política de la ruta (ver reglas abajo) |
| choferes | perfil del chofer | foto, nombre, años manejando, calificación, viajes realizados, licencia verificada, bus que maneja |
| choferes | calificar el viaje | estrellas de 1 a 5 y etiquetas cortas (puntual, manejo seguro, amable, limpio); una vez por boleto |
| en vivo | seguimiento del bus | posición del bus en el mapa y hora estimada de llegada a cada parada |
| avisos | notificaciones | recordatorio 30 min antes, cambio de andén, atraso, viaje cancelado |
| cuenta | acceso | número de teléfono con código por SMS; se puede buscar y ver horarios sin cuenta |
| cuenta | perfil | datos, pasajeros guardados, historial, idioma, tema |
| ayuda | soporte | preguntas frecuentes, equipaje permitido, reportar un problema del viaje |

Fuera de la v1 (anotado para no perderlo): app del chofer, panel de la cooperativa, venta en ventanilla, programa de puntos, rutas internacionales (Tica, Transnica).

## reglas de negocio

Estas reglas viven en `packages/dominio` y tienen pruebas. Si una tarea necesita otra regla, se agrega aquí en su propio commit `docs:`.

- **Precio:** el precio de un boleto es la tarifa oficial que el MTI autoriza para esa ruta, ese tramo y ese servicio (ver `05-marco-mti.md`). Se lee de un tarifario: no hay multiplicadores, prorrateos, redondeos propios, descuentos ni recargos sobre el pasaje. Moneda única: córdoba (C$). Mientras el tarifario oficial no esté cargado, toda tarifa es de muestra y la app lo avisa en pantalla.
- **Servicios del MTI:** `ordinario`, `expreso` y `taxi-interlocal`. Un expreso va solo de su terminal de salida a la de destino, sin subir ni bajar pasajeros en el camino; el ordinario sí tiene paradas intermedias, cada una con su tarifa autorizada. Nadie viaja de pie, así que las plazas vendidas nunca superan los asientos.
- **Retención de asiento:** 10 minutos desde que se elige. Un asiento retenido o vendido no se puede elegir. Una retención vencida cuenta como libre. Máximo 6 asientos por compra. Regla de muestra, sin verificar con el MTI.
- **Venta:** cierra 15 minutos antes de la salida. Después, el viaje aparece pero con "venta cerrada". Regla de muestra, sin verificar con el MTI.
- **Cancelación:** más de 24 h antes, reembolso del 100 %; entre 24 h y 2 h (ambos extremos incluidos), 50 %; menos de 2 h, sin reembolso. El plazo se mide contra la salida programada. El monto es el precio por el porcentaje, redondeado hacia abajo al córdoba. Solo se cancela un boleto vigente. Los porcentajes de reembolso son de muestra, sin verificar con el MTI.
- **Cambio de salida:** es gratis una vez por boleto y solo si faltan más de 2 h para la salida programada del viaje actual. El viaje nuevo tiene que ser de la misma ruta, del mismo tipo de bus, distinto del actual, no estar cancelado y tener la venta abierta. El boleto cambiado queda marcado con `cambioUsado` y toma un asiento del viaje nuevo. Regla de muestra, sin verificar con el MTI.
- **Estados del viaje:** programado → abordando (desde 20 min antes) → en ruta → llegó. Desvíos: atrasado (con minutos), cancelado. La salida real es la salida programada más `minutosAtraso`; la llegada es la salida real más `duracionMin` de la ruta. Orden de precedencia: cancelado, llegó, en ruta (desde la salida real), atrasado (hay atraso y todavía no sale), abordando (20 min antes de la salida real) y programado. La venta cierra 15 min antes de la salida programada y nunca está abierta en un viaje cancelado.
- **Zona horaria:** todo el producto usa la hora de Managua, UTC−06:00 fija y sin horario de verano. Un "día" va de 00:00 a 24:00 de esa hora. Franjas para filtrar salidas: madrugada (00:00 a 05:59), mañana (06:00 a 11:59), tarde (12:00 a 17:59) y noche (18:00 a 23:59).
- **Código del boleto:** 8 caracteres de un alfabeto sin ambiguos (sin 0, O, 1, I, L), el último es dígito de control. Se puede validar sin conexión.
- **Calificación del chofer:** promedio de las últimas 200 calificaciones; se muestra con un decimal y solo si tiene al menos 5.

## datos de muestra

Mientras no exista backend, la app corre con datos semilla realistas de Nicaragua: terminales (UCA en Managua, Boaco y Juigalpa), rutas entre ellas, buses, choferes con nombres inventados y horarios. Los precios son de muestra y así se rotulan en el código (`// datos de muestra`). Las fotos de choferes son ilustraciones o retratos generados neutrales; nunca fotos de personas reales sin permiso.

## métricas de éxito de la v1

- de abrir la app a ver la próxima salida de una ruta frecuente: menos de 3 s y 1 toque.
- de buscar a tener boleto: menos de 90 s.
- boleto visible en modo avión.
- ninguna pantalla con contraste de texto por debajo de AA.
