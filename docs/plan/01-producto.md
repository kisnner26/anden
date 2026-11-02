# 01 · producto

Andén: app móvil (iOS y Android) para viajar en buses interurbanos e interlocales en Nicaragua. Reservar asiento, comprar el boleto, ver horarios y rutas, saber quién maneja y dónde viene el bus.

Nombre de marca con tilde (Andén). En código, rutas, paquetes y bundle id va sin tilde: `anden`.

## el problema

Hoy el viaje interlocal se resuelve llegando a la terminal y preguntando: no se sabe a qué hora sale el próximo, si va lleno, de qué andén sale ni quién maneja. Se paga en efectivo, sin comprobante, y si el bus se atrasa nadie avisa.

## a quién sirve

| persona | qué necesita |
|---|---|
| pasajero frecuente (trabaja en Managua, vive en Masaya, Granada, Jinotepe) | ver la próxima salida en segundos, comprar sin hacer fila, boleto offline |
| viajero ocasional (León, Estelí, Matagalpa, Rivas, San Carlos) | comparar horarios y tipos de bus, elegir asiento, saber duración y paradas |
| quien manda a un familiar | comprar el boleto para otra persona y seguir el bus en vivo |
| chofer y cooperativa (fase posterior) | ver su viaje asignado, validar boletos por código, reportar atrasos |

## funciones de la v1

Todo lo de esta tabla entra en la primera versión publicable. El orden de construcción está en `04-tareas.md`.

| área | función | detalle |
|---|---|---|
| buscar | buscador de viaje | origen, destino, fecha, número de pasajeros; rutas frecuentes y recientes arriba |
| buscar | resultados | lista de salidas con hora, duración, tipo de bus (expreso, interlocal, ordinario), precio en C$, asientos libres, calificación del chofer |
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

- **Precio:** tarifa base de la ruta por tramo × multiplicador del tipo de bus (ordinario 1.0, interlocal 1.2, expreso 1.5). Redondeo al córdoba entero hacia arriba. Niños menores de 3 años en brazos no pagan ni ocupan asiento. Moneda única: córdoba (C$). El tramo va de una parada a otra de la ruta; el tramo completo cuesta exactamente `tarifaBase` y uno parcial se prorratea por los minutos entre sus paradas: `tarifaBase × minutosDelTramo / duracionMin`. Se aplica el multiplicador del bus, se redondea hacia arriba una sola vez al córdoba entero y el total es ese precio por los pasajeros que pagan.
- **Retención de asiento:** 10 minutos desde que se elige. Un asiento retenido o vendido no se puede elegir. Una retención vencida cuenta como libre. Máximo 6 asientos por compra.
- **Venta:** cierra 15 minutos antes de la salida. Después, el viaje aparece pero con "venta cerrada".
- **Cancelación:** más de 24 h antes, reembolso del 100 %; entre 24 h y 2 h, 50 %; menos de 2 h, sin reembolso. Cambiar a otra salida de la misma ruta es gratis una vez si faltan más de 2 h.
- **Estados del viaje:** programado → abordando (desde 20 min antes) → en ruta → llegó. Desvíos: atrasado (con minutos), cancelado.
- **Código del boleto:** 8 caracteres de un alfabeto sin ambiguos (sin 0, O, 1, I, L), el último es dígito de control. Se puede validar sin conexión.
- **Calificación del chofer:** promedio de las últimas 200 calificaciones; se muestra con un decimal y solo si tiene al menos 5.

## datos de muestra

Mientras no exista backend, la app corre con datos semilla realistas de Nicaragua: terminales (UCA, Mercado Roberto Huembes, Mercado Mayoreo, Mercado Israel Lewites, y las de Masaya, Granada, León, Estelí, Matagalpa, Jinotepe, Rivas, Chinandega, Juigalpa, San Carlos), rutas entre ellas, buses, choferes con nombres inventados y horarios. Los precios son de muestra y así se rotulan en el código (`// datos de muestra`). Las fotos de choferes son ilustraciones o retratos generados neutrales; nunca fotos de personas reales sin permiso.

## métricas de éxito de la v1

- de abrir la app a ver la próxima salida de una ruta frecuente: menos de 3 s y 1 toque.
- de buscar a tener boleto: menos de 90 s.
- boleto visible en modo avión.
- ninguna pantalla con contraste de texto por debajo de AA.
