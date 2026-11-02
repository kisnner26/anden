# decisiones

Registro de decisiones tomadas durante el desarrollo. Una por entrada, la más reciente arriba. Las preguntas abiertas van marcadas como **abierta** hasta que el dueño del proyecto responda.

| fecha | tarea | decisión | por qué |
|---|---|---|---|
| 2026-11-02 | T-013 | **abierta**: definir el tipo de entrada `ocupaciones` y la forma de representar ventas | `estadoAsientos(config, ocupaciones, ahora)` y `puedeRetener(...)` se piden sin contrato para diferenciar una `Retencion` de un asiento vendido ni sus datos de viaje |
| 2026-11-02 | T-012 | **abierta**: definir la representación de `tramo` y el prorrateo de la tarifa parcial | el plan pide `calcularPrecio(ruta, tramo, tipoBus, pasajeros)` y probar un tramo parcial, pero `Ruta` no define el tramo ni la regla de reparto de su tarifa base |
| 2026-11-02 | plan | nombre Andén, bundle `com.kisnner.anden` | nombre corto, propio del viaje en bus; un solo App ID por el límite de la cuenta gratuita de Apple |
| 2026-11-02 | plan | Expo + Supabase, datos en memoria primero | la app se puede construir y probar completa antes de tener backend |
| 2026-11-02 | T-066 | **abierta**: pasarela de pago real | Stripe no opera en Nicaragua; hay que elegir una que sí |
| 2026-11-02 | T-010 | `Retencion` lleva `id` y `Boleto` lleva `duenoId` | el contrato usa `liberar(retencionId)`, `comprar(retencionId, ...)` y `misBoletos(duenoId)`, que no se pueden cumplir sin esos campos |
| 2026-11-02 | T-010 | fechas y horas como texto ISO 8601 con desfase; los esquemas lo exigen | el viaje sale en hora de Managua (-06:00) y el servidor puede devolver UTC; ambas se aceptan |
| 2026-11-02 | T-011 | preferenciales = asientos de las dos primeras filas con asientos (coaster: 1 a 5); ventana = columnas de los bordes; el resto pasillo | el plano de la coaster del mockup aprobado marca 1 a 5 como preferenciales y "primera fila" daría solo el asiento 1 junto al chofer |
| 2026-11-02 | T-006a | el titular usa Archivo Narrow Bold de forma provisional | `@expo-google-fonts/archivo` solo trae el ancho normal; el corte ExtraCondensed del mockup se trae como archivo local en T-006b |
