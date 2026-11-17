# Andén

Reservá tu asiento, seguí tu bus en el mapa y hablá con tu chofer. App móvil para iOS y Android para los buses interlocales de Nicaragua: Managua, Boaco y Juigalpa.

<p align="center">
  <a href="docs/media/teaser-anden.mp4">
    <img src="docs/media/teaser-poster.jpg" alt="Teaser de Andén: ver el video" width="300">
  </a>
  <br>
  <sub>Teaser de 30 s grabado en un iPhone. Tocá la imagen para verlo.</sub>
</p>

## Para el pasajero

Preguntá por horarios y tarifas, reservá asiento y llevá tu boleto con QR. Cuando el chofer sale, seguís el bus en el mapa con la hora estimada de llegada.

<table>
  <tr>
    <td align="center"><img src="docs/media/capturas/pasajero-01-bienvenida.jpg" width="190" alt="Bienvenida"><br><sub>Bienvenida</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-02-inicio.jpg" width="190" alt="Inicio"><br><sub>Inicio</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-03-asistente.jpg" width="190" alt="Preguntale a Andén"><br><sub>Preguntale a Andén</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-04-ruta-en-mapa.jpg" width="190" alt="Ruta en el mapa"><br><sub>Ruta en el mapa</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/media/capturas/pasajero-05-detalle-del-viaje.jpg" width="190" alt="Detalle del viaje"><br><sub>Detalle del viaje</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-06-elegir-asiento.jpg" width="190" alt="Elegir asiento"><br><sub>Elegir asiento</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-07-boleto-con-qr.jpg" width="190" alt="Boleto con QR"><br><sub>Boleto con QR</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-08-pasaporte.jpg" width="190" alt="Pasaporte de viajes"><br><sub>Pasaporte de viajes</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/media/capturas/pasajero-10-viaje-en-curso.jpg" width="190" alt="Viaje en curso"><br><sub>Viaje en curso</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-11-calificar-al-chofer.jpg" width="190" alt="Calificar al chofer"><br><sub>Calificar al chofer</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-12-seguridad.jpg" width="190" alt="Seguridad"><br><sub>Seguridad</sub></td>
    <td align="center"><img src="docs/media/capturas/pasajero-13-encomienda.jpg" width="190" alt="Encomienda"><br><sub>Encomienda</sub></td>
  </tr>
</table>

## Para el conductor

Publicá tus viajes, escaneá el boleto de quien sube, compartí tu ubicación mientras manejás y cerrá el viaje con lo cobrado.

<table>
  <tr>
    <td align="center"><img src="docs/media/capturas/conductor-01-inicio.jpg" width="190" alt="Inicio con el resumen del día"><br><sub>Inicio con el resumen del día</sub></td>
    <td align="center"><img src="docs/media/capturas/conductor-02-buen-viaje.jpg" width="190" alt="Salida del viaje"><br><sub>Salida del viaje</sub></td>
    <td align="center"><img src="docs/media/capturas/conductor-03-mapa-en-vivo.jpg" width="190" alt="Mapa en vivo"><br><sub>Mapa en vivo</sub></td>
    <td align="center"><img src="docs/media/capturas/conductor-04-pasajeros-a-bordo.jpg" width="190" alt="Pasajeros a bordo"><br><sub>Pasajeros a bordo</sub></td>
    <td align="center"><img src="docs/media/capturas/conductor-05-ganancias.jpg" width="190" alt="Ganancias"><br><sub>Ganancias</sub></td>
  </tr>
</table>

## Paneles web

- **Cooperativa** (`apps/cooperativa`): viajes, conductores, solicitudes, finanzas, alertas de seguridad y una sección para preguntarle a Claude Code sobre la operación.
- **Red del asistente** (`apps/entrenador`): un laboratorio local para ver, entrenar y probar la red neuronal que contesta en el teléfono cuando no hay Apple Intelligence ni Gemini.

<p align="center">
  <img src="docs/media/paneles/entrenador-01-resumen.png" alt="Panel de la red neuronal del asistente" width="720">
</p>

## Qué incluye

- **Reservas:** horarios por terminal, elegir asiento, pago al abordar, boletos con QR, reserva en grupo y transferir un boleto.
- **Viaje en curso:** mapa con el recorrido, hora estimada de llegada, la unidad y su placa, quién conduce, chat con el chofer (solo mientras el viaje va en camino), seguridad y calificación.
- **Asistente:** usa la IA del teléfono y, si no hay, una red neuronal propia con 13 intenciones y un 84 % de acierto medido con plantillas que nunca vio.
- **Seguridad:** detección de choques con aviso a un contacto de confianza y llamada a emergencias.
- **Conductor:** publicar y retirar viajes, pasajeros a bordo con escaneo, cierre con cobros, encomiendas y resumen del día.
- **Extras:** pasaporte de viajes, Andén Plus, modo simple con botones grandes y app para Apple Watch.
