# Datos para los modelos

Define qué se guarda, para qué y cómo se transforma en el conjunto de entrenamiento. La migración que lo crea es `supabase/migrations/0020_datos_para_modelos.sql`.

## Tablas

| Tabla | Una fila es | Para qué sirve |
| --- | --- | --- |
| `ocupacion_historial` | la foto de cuántos asientos lleva vendidos una salida a 24, 12, 6, 3, 1 y 0 h de partir | objetivo y variables de la predicción de ocupación |
| `telemetria_eventos` | una posición del bus (hora, lat, lng, velocidad, precisión) | trayectorias para la predicción de llegada |
| `viajes.salio_en`, `viajes.llego_en` | las horas reales de salida y llegada | duración real del trayecto, atraso de salida |

Ninguna guarda nombre, teléfono, cédula ni código de boleto.

## Predicción de ocupación

- Unidad: una salida en un momento previo a partir (por ejemplo, 12 horas antes).
- Objetivo: asientos vendidos al partir (`horas_antes = 0`), y su versión binaria "se llena" (vendidos sobre el total del bus mayor a un umbral).
- Variables:
  - de la salida: ruta, sentido, servicio, hora, día de la semana, si es feriado o fin de quincena;
  - de la evolución: asientos vendidos a 24, 12, 6, 3 y 1 h (solo los que ya existen en el momento de predecir, para no filtrar el futuro);
  - de contexto: ocupación media de la misma ruta y franja en las últimas semanas.
- Referencias contra las que se compara: promedio histórico por ruta, día y hora; estacional ingenuo (la misma salida de la semana anterior); gradiente boosting.
- Redes candidatas: GRU o LSTM sobre la serie de fotos de ocupación, con incrustaciones de ruta y calendario; red convolucional temporal; y un perceptrón multicapa como punto intermedio.

## Predicción de llegada

- Unidad: un viaje en curso en un instante.
- Objetivo: minutos que faltan para `llego_en`.
- Variables: tramo recorrido, velocidad reciente (ventana de 5 a 15 minutos), hora del día, día de la semana, atraso de salida, ruta.
- Referencias: tiempo estático del trayecto, tiempo histórico mediano por franja horaria, gradiente boosting.
- Redes candidatas: GRU sobre la trayectoria reciente y un perceptrón con variables agregadas.

## Calidad y privacidad

- Las posiciones fuera de la ruta esperada se descartan o se recortan antes de entrenar.
- Los identificadores de viaje son los mismos que usa la app; no se cruzan con cuentas de personas en el conjunto de entrenamiento.
- Los datos simulados se marcan en una columna de origen y nunca se mezclan con los reales al evaluar.
- Cada conjunto de entrenamiento se versiona (fecha de corte, filtros y semilla) para poder repetir el experimento.

## Pendiente en la app y la API

- Que el cierre del viaje escriba `llego_en`.
- Que la API reciba las posiciones del conductor y las guarde en `telemetria_eventos`, con muestreo para no saturar.
- Programar `capturar_ocupacion()` cada 15 minutos.
