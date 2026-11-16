# Entrenador de la red del asistente

Panel local para ver, entrenar y probar la red neuronal pequeña que contesta en la app cuando el teléfono no tiene
Apple Intelligence ni Gemini. No tiene dependencias externas: usa solo Node 22 o más nuevo y el paquete
`@anden/neuronal`.

```sh
pnpm --filter @anden/entrenador iniciar
# abre http://127.0.0.1:4777
```

## Qué hace

1. **Entrenar** con todas las frases, mostrando la pérdida y la precisión época por época.
2. **La red**: las capas, qué neuronas pesan más y qué empuja hacia cada intención.
3. **Probar** una frase y ver las cinco intenciones más probables.
4. **Dónde se confunde**: matriz de confusión y precisión por intención.
5. **Frases**: agregar o quitar las que se escriben a mano (`packages/neuronal/datos/propias.jsonl`); las de plantilla
   no se tocan desde acá.

Al terminar un entrenamiento, **Guardar este modelo en la app** reescribe
`packages/neuronal/src/modelos/intenciones.ts`. Se hace commit de ese archivo y se vuelve a compilar la app.

## Seguridad

El servidor escucha solo en `127.0.0.1` y rechaza pedidos cuyo `Host` u `Origin` no sean los suyos, así que otra página
web abierta en el mismo equipo no puede mandarle órdenes. Los cuerpos de los pedidos tienen tope de tamaño y las frases
se validan antes de guardarse.

## Límites

La precisión sobre frases de validación sale de un sorteo y se ve inflada porque las plantillas se repiten con cada
ciudad. `pnpm --filter @anden/neuronal exec node scripts/entrenar-intenciones.ts` mide aparte con plantillas completas
que la red no vio, que es la cifra honesta.
