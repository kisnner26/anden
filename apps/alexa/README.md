# Andén en Alexa

Habilidad para preguntarle a Alexa por las salidas: "Alexa, pregúntale a Andén cuál es el próximo bus a Boaco".

Entiende cuatro pedidos (próximo bus, precio, asientos y ayuda) entre Managua, Boaco y Juigalpa, y contesta con las
salidas reales de la API (`GET /v1/salidas?destino=`). No inventa horarios ni precios: si no hay dato, lo dice.

## Qué hay y qué falta

Está hecho y probado: la lógica (`habilidad.mjs`), la entrada de Lambda con sus comprobaciones (`lambda.mjs`), el modelo
de interacción en español de México (`modelo/es-MX.json`) y el manifiesto (`skill.json`).

**No está publicada ni probada en un dispositivo Alexa.** Para publicarla hace falta, de tu lado:

1. Una cuenta de Amazon Developer y crear la habilidad (consola de Alexa o `ask` CLI) con este modelo y manifiesto.
2. Desplegar `habilidad.mjs` y `lambda.mjs` en AWS Lambda (Node 20 o más nuevo, sin dependencias) o en una habilidad
   alojada por Alexa, con estas variables de entorno:
   - `ANDEN_API`: la dirección pública de la API de Andén (hoy no hay una desplegada).
   - `ALEXA_SKILL_ID`: el id de la habilidad; sin él la Lambda rechaza todo pedido.
3. Reemplazar `REEMPLAZAR_POR_EL_ARN_DE_LA_LAMBDA` en `skill.json` con el ARN de la función.

Alexa pide que la habilidad verifique que el pedido sea suyo y reciente: `lambda.mjs` ya lo hace (id de la habilidad y
tolerancia de 150 segundos).

## Pruebas

```sh
pnpm --filter @anden/alexa test
```
