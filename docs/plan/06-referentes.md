# Referentes: qué copiamos de InDrive, Uber y las apps de buses

Análisis de producto hecho con fuentes públicas (fichas de las tiendas, páginas de seguridad y notas de prensa de cada empresa). No se desarmó ninguna aplicación ni se usó código de terceros: se comparan flujos y se decide cuáles sirven para el transporte interlocal de Boaco, Managua y Juigalpa.

Las notas de prensa son material de las propias empresas; los detalles pueden variar por país. La tienda de cada app es la referencia final.

## qué hacen ellos y dónde estamos

| Patrón | Quién lo usa | En Andén |
| --- | --- | --- |
| Compartir el viaje con una persona de confianza | Uber (Share My Trip), InDrive | Hecho: "Compartir datos del viaje" en el boleto, sin el código de abordaje |
| Verificar placa, modelo y chofer antes de subir | Uber | Hecho: tarjeta "Verificá antes de subir" en el boleto vigente |
| Perfil del chofer con nota y opiniones | Uber, InDrive, redBus | Hecho: perfil, opiniones ligadas a un viaje hecho y reporte |
| Repetir un viaje anterior | Uber | Hecho: "Reservar otra salida a {destino}" en un boleto que ya no está vigente |
| Elegir asiento en un plano | redBus | Hecho desde el inicio |
| Seguimiento de la unidad | Uber, InDrive, redBus | Parcial: mapa con la carretera real y un bus de ejemplo; falta la posición real, que necesita servidor y datos de las unidades |
| Recordatorios antes de la salida | redBus | Hecho: automático para boletos y a pedido para cualquier salida |
| Filtros por hora, tipo de servicio y punto de abordaje | redBus | Parcial: filtros por servicio y próximas; el punto de abordaje es único por terminal |
| Favoritos y rutas frecuentes | Uber, InDrive | Hecho: estrella en los corredores y filtro "Mis rutas" |

## qué no copiamos y por qué

- **Negociar el precio (InDrive).** La tarifa del interlocal la fija el MTI (ver `05-marco-mti.md`); un pasajero no puede ofrecer menos ni un chofer cobrar más. Lo que sí se puede mostrar es cuánto cuesta y que es la tarifa oficial.
- **Código PIN para iniciar el viaje (Uber).** Andén ya entrega un código de abordaje y un QR por boleto, que cumplen esa función en el abordaje.
- **Botón de emergencia (InDrive, Uber).** Queda abierto. Hace falta verificar los números de emergencia vigentes en Nicaragua con una fuente oficial antes de ponerlos en pantalla; un número equivocado en una emergencia es peor que ninguno.
- **Chat y llamadas dentro de la app.** Requieren servidor.
- **Grabación de audio y detección de paradas inusuales (Uber).** Requieren permisos y servicios en segundo plano que no se justifican para un viaje de una a dos horas con ruta fija.

## lo que sigue, en orden

1. Posiciones reales de las unidades (servidor y acuerdo con las cooperativas).
2. Botón de emergencia, cuando se confirmen los números oficiales.
3. Punto de abordaje elegible si una cooperativa tiene más de una parada por terminal.

## fuentes consultadas

- Notas de prensa y blogs sobre InDrive (negociación de tarifa, calificaciones, compartir viaje, SOS).
- Páginas de seguridad de Uber (PIN, Share My Trip, verificación de chofer).
- Notas de prensa de redBus y guías de producto de apps de buses (seguimiento, plano de asientos, puntos de abordaje, recordatorios).
