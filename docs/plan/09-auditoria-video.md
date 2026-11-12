# Auditoría 2026-11-12 (2): lo que se ve en el iPhone

Defectos encontrados en el video de la app corriendo en el iPhone 15 Pro Max, más la causa en el código cuando se pudo confirmar. Está escrita para que un agente la ejecute tarea por tarea sin investigar.

## reglas para quien ejecute esta lista

Valen las mismas reglas que en `docs/plan/08-auditoria.md` (sección "reglas para quien ejecute esta lista"): leé `AGENTS.md`, un commit por cosa, verificación después de cada commit y al final de cada tarea, sin push, sin dependencias nuevas, sin inventar que viste algo en el iPhone.

Además:

- Los textos nuevos van en `src/textos/es.ts`, con voseo y sin emojis.
- Si cambiás un texto que una prueba busca, actualizá la prueba en el mismo commit.
- Hacé las tareas en el orden de esta lista: las primeras son fallos, las últimas son pulido.

---

## fallos

### T-140 · los viajes que no salen de Managua dan "No encontramos este viaje"

**Lo que se ve.** El conductor abre su viaje "Boaco → Managua" y la pantalla queda en blanco con "No encontramos este viaje." Lo mismo le pasa al pasajero si en Horarios elige la terminal de Boaco o Juigalpa y toca una salida.

**Causa confirmada.** `src/datos/detalle.ts`, función `armarDetalle`, línea con `armarSalidas(datos, ahora).find(...)`. `armarSalidas` sin tercer argumento solo arma las salidas de `ter_may` (Mercado Mayoreo), así que un viaje que sale de Boaco o Juigalpa nunca aparece. `src/datos/rutas.ts` tiene la misma llamada.

**Cómo arreglarlo.**
1. En `armarDetalle`, pasá la terminal de origen de la ruta: `armarSalidas(datos, ahora, ruta.origenId)`. La `ruta` ya se busca unas líneas antes; mové la búsqueda de `salida` después de comprobar que `ruta` existe.
2. Revisá `src/datos/rutas.ts`: si arma el detalle de un corredor que puede salir de Boaco o Juigalpa, aplicá el mismo arreglo. Si no, dejalo.
3. Prueba en `src/datos/detalle.test.ts`: con un viaje de `rutaId === 'rut_boa_may'` (buscalo en `crearMuestra(AHORA).viajes`), `armarDetalle` no devuelve `null` y su `origenCiudad` es `'Boaco'`.
4. Prueba en `src/pantallas/ConductorViaje.test.tsx`: con un viaje de vuelta del chofer de la sesión, la pantalla muestra "Iniciar viaje" y no "No encontramos este viaje.".

**Hecho cuando.** Las dos pruebas pasan y fallan si se quita el tercer argumento.

**Commits.** `fix: el detalle encuentra los viajes que salen de Boaco y Juigalpa`; `test: ...`.

---

### T-141 · las pantallas de "no encontrado" no tienen salida

**Lo que se ve.** "No encontramos este viaje." ocupa la pantalla sin flecha para volver.

**Archivos.** `src/pantallas/DetalleViaje.tsx`, `ConductorViaje.tsx`, `VerBoleto.tsx`, `PerfilChofer.tsx`. Cada una tiene un `return` temprano con un `View` centrado y un solo `Text`.

**Cómo arreglarlo.** En cada una, agregá arriba del texto la `CabeceraPantalla` con `alVolver` y un título corto (`t('detalle.titulo')` o el que ya use la pantalla; si no hay, creá una clave). El texto queda debajo. Respetá el relleno superior con `useSafeAreaInsets`, como en el resto de la pantalla.

**Hecho cuando.** En las cuatro pantallas, con un id que no existe, hay un botón "Volver" que llama a `alVolver`. Una prueba por pantalla.

---

### T-142 · la terminal de Boaco se llama "Terminal de Buses de Managua"

**Lo que se ve.** En Horarios, al elegir Boaco, la tarjeta dice "BOA · Terminal de Buses de Managua · Boaco".

**Causa confirmada.** `src/datos/muestra.ts`, `TERMINALES`, la entrada de `ter_boa` tiene `nombre: 'Terminal de Buses de Managua'`.

**Cómo arreglarlo.** Cambialo a `'Terminal de Buses de Boaco'`. Buscá con `grep -rn "Terminal de Buses de Managua" apps/movil/src` y arreglá las pruebas que lo esperen.

**Commit.** `fix: la terminal de Boaco tenía el nombre de una de Managua`.

---

### T-143 · la duración y los kilómetros no coinciden entre pantallas

**Lo que se ve.** El detalle del viaje dice "Duración 1 h 40 min · 90 km". El mapa del mismo corredor dice "82.9 km de carretera". El conductor ve "Llegás en 100 min" con el trazo real de 79 min.

**Causa.** `src/datos/muestra.ts` define `RECORRIDOS` con `boa: 90 km / 100 min` y `jui: 139 km / 150 min`, mientras que `src/datos/trazos.ts` trae la carretera real: Boaco 82,9 km / 79 min y Juigalpa 133,5 km / 125 min.

**Cómo arreglarlo.** La fuente de verdad es el trazo. En `muestra.ts`, tomá `distanciaKm` y `duracionMin` de `TRAZOS` (importalo de `./trazos`) en lugar de escribirlos a mano. Si alguna prueba espera 90, 100, 139 o 150, actualizala con los valores del trazo en el mismo commit; no los escribas a mano en la prueba, importalos de `TRAZOS`.

**Hecho cuando.** `grep -rn "duracionMin: 100\|distanciaKm: 90" apps/movil/src` no devuelve nada y todo pasa.

---

### T-144 · "Cómo llegar" abre Apple Maps con coordenadas en vez del nombre

**Lo que se ve.** Apple Maps muestra el destino como "12.134130,-86.193300".

**Archivo.** `src/datos/mapas.ts`, `urlIndicacionesAppleMaps`. Hoy manda `daddr=lat,lng&q=nombre`, y con `daddr` Maps ignora el nombre.

**Cómo arreglarlo.** Apple Maps muestra el nombre si el destino es el texto y las coordenadas van aparte. Usá `daddr=${encodeURIComponent(nombre)}` junto con `ll=${lat},${lng}` y `dirflg=d`, y quitá `q`. Actualizá la prueba de `src/datos/mapas.test.ts` para que espere esa URL.

**Advertencia.** Esto no se puede comprobar sin un iPhone: Apple Maps puede resolver el nombre a otro lugar. Decilo al terminar, para que el dueño lo pruebe; si falla, se vuelve atrás.

---

### T-145 · el boleto vencido sigue diciendo "Pagás al abordar"

**Lo que se ve.** En un boleto con "Estado: Salida vencida" sigue apareciendo el bloque "Pagás al abordar C$ 85 · Llevá el monto exacto.", aunque ya no se puede abordar.

**Archivo.** `src/pantallas/VerBoleto.tsx`.

**Cómo arreglarlo.** Mostrá el bloque de pago solo si `puedeOperar` (estado vigente). La línea suelta "Reglas de muestra" también: dejala solo cuando el boleto está vigente.

**Hecho cuando.** Prueba: boleto cancelado o vencido no muestra "Pagás al abordar".

---

### T-146 · los avisos se repiten

**Lo que se ve.** En Avisos aparece tres veces "Tu bus a Juigalpa sale en 26 min" y dos veces "Tu bus a Boaco sale en 38 min".

**Causa.** `src/datos/avisos.ts`, `avisosDeBoletos`, crea un aviso por boleto. Si la persona compró varios asientos del mismo viaje, sale un aviso por asiento.

**Cómo arreglarlo.**
1. Agrupá por `salida.viajeId`: un aviso por viaje y tipo. El `id` pasa a ser `${viajeId}:${tipo}` y `boletoId` queda como el del primer boleto del grupo.
2. Ojo: los `leidos` guardados usan los ids viejos (`bol_...:pronto`). Está bien perderlos: los avisos vuelven a aparecer como no leídos una vez. No hace falta migración.
3. Revisá `src/datos/ProveedorAvisos.tsx`: los recordatorios programados siguen siendo por boleto; no los toques.
4. Pruebas en `src/datos/avisos.test.ts`: dos boletos del mismo viaje dan un solo aviso.

---

### T-147 · Rutas: el detalle del corredor se titula "Rutas"

**Lo que se ve.** Al abrir "Boaco → Managua", el titular de la pantalla es "Rutas." y el corredor va debajo como texto grande.

**Archivo.** `src/pantallas/DetalleRuta.tsx`.

**Cómo arreglarlo.** El titular de `CabeceraPantalla` pasa a ser el corredor (`${origen} → ${destino}`) y se quita la línea duplicada de abajo. Conservá el rol `header` que la prueba busca con `name: 'Boaco → Managua'`.

---

## pulido

### T-148 · la barra de pestañas casi no se lee

**Lo que se ve.** Los nombres de las pestañas son muy chicos y el color de la pestaña activa (`colores.ambarTexto`, marrón oscuro) no contrasta con el cristal.

**Archivo.** `app/(pestanas)/_layout.tsx`.

**Cómo arreglarlo.** Cambiá `tintColor` a `colores.ambar`. Revisá en `node_modules/expo-router/build/native-tabs/types.d.ts` si existe `labelStyle` con `fontSize` y, si existe, poné el de `tipografia.pequeno`. No cambies los íconos.

**Advertencia.** Solo se ve en un iPhone. Decilo al terminar.

---

### T-149 · Horarios mezcla filtros que se suman con filtros que se excluyen

**Lo que se ve.** En la misma fila de chips están "Mis rutas" y "Próximas" (se prenden y apagan, se pueden combinar) y "Todos / Ordinario / Expreso / Taxi" (uno a la vez). Con "Mis rutas", "Próximas" y "Ordinario" prendidos a la vez no se entiende qué se está viendo.

**Archivo.** `src/pantallas/Horarios.tsx`.

**Cómo arreglarlo.** Dos filas separadas: la primera con "Mis rutas" y "Próximas", la segunda con el servicio. Una etiqueta chica arriba de cada fila (`tipografia.etiqueta`): "Mostrar" y "Servicio". Textos nuevos en `horarios`.

---

### T-150 · el pie de asientos repite "Elegí al menos un asiento"

**Lo que se ve.** Sin asiento elegido, el pie dice arriba "ELEGÍ AL MENOS UN ASIENTO", después "C$ 0" y abajo otra vez "Elegí al menos un asiento".

**Archivo.** `src/pantallas/Asientos.tsx`, el contenido de `PieReserva`.

**Cómo arreglarlo.** Sin asientos: etiqueta "Total", monto "C$ 0" y una sola línea "Elegí al menos un asiento". Con asientos queda como está.

---

### T-151 · en la leyenda de asientos, "Libre" y "Vendido" se ven iguales

**Lo que se ve.** Los dos cuadritos de la leyenda son grises claros casi idénticos.

**Archivos.** `src/pantallas/Asientos.tsx` (la leyenda) y `src/componentes/MapaAsientos/MapaAsientos.tsx` (cómo se dibuja un asiento vendido).

**Cómo arreglarlo.** Que la leyenda use exactamente el mismo estilo que el asiento del mapa: el vendido con `colores.barroOscuro` y el número en `tintaSuave`, el libre como `Bloque`. Si aun así se parecen, dibujá el vendido con una raya diagonal o con el número tachado (`textDecorationLine: 'line-through'`), en los dos lugares.

---

### T-152 · la salida en el boleto se corta en dos líneas raras

**Lo que se ve.** En la casilla "SALE" del pase dice "jue 12 nov, 1:45" en una línea y "p. m." en otra.

**Archivo.** `src/componentes/TalonBoleto/TalonBoleto.tsx`, la casilla de salida.

**Cómo arreglarlo.** Dos textos: la fecha (`formatoFechaCorta`) en `tipografia.etiqueta` y debajo la hora completa (`formatoHoraCompleta`) en `tipografia.dato`. Ajustá la prueba que busca `'lun 2 nov, 2:40 p. m.'` en un solo texto: ahora son dos.

---

### T-153 · el perfil del chofer se contradice sobre quién puede opinar

**Lo que se ve.** "Todavía nadie dejó un comentario. Podés ser la primera persona." y justo abajo "Podés opinar cuando termine un viaje con este chofer". Al final, otra vez "Solo califican quienes ya hicieron el viaje, una vez por boleto."

**Archivos.** `src/componentes/OpinionesChofer/OpinionesChofer.tsx`, `src/pantallas/PerfilChofer.tsx`, `src/textos/es.ts`.

**Cómo arreglarlo.**
1. `opiniones.vacio` pasa a decir solo "Todavía no hay comentarios." Que invite a ser la primera persona solo cuando el formulario está visible (hay boleto para opinar): usá otra clave, `opiniones.vacioInvita`.
2. Quitá de `PerfilChofer.tsx` el texto final `chofer.nota`: ya lo dice `opiniones.soloConBoleto`. Borrá la clave si queda sin uso.

---

### T-154 · los boletos pasados llenan la lista

**Lo que se ve.** En Boletos aparecen muchos boletos con "Estado: Salida vencida", uno tras otro.

**Archivo.** `src/pantallas/Boletos.tsx`.

**Cómo arreglarlo.** La sección "Pasados" muestra solo los 3 más recientes y un botón "Ver los N anteriores" que despliega el resto (estado local con `useState`). Textos nuevos en `boletos`.

---

### T-155 · las filas tocables de Configuración no parecen tocables

**Lo que se ve.** "Soy conductor" y "Abrir modo conductor" son texto plano dentro de un bloque, sin la flecha que sí tiene la fila del perfil.

**Archivo.** `src/pantallas/Ajustes.tsx`.

**Cómo arreglarlo.** Agregá a la derecha de esas filas el mismo `Icono nombre="siguiente"` que usa la fila del perfil, con la misma distribución (`flexDirection: 'row'`, texto con `flex: 1`). "Cerrar sesión" queda sin flecha.

---

### T-156 · el teclado numérico del ingreso no se puede cerrar

**Lo que se ve.** En "Ingresar", el teclado numérico del código no tiene tecla para cerrarse y tapa la nota de modo de prueba.

**Archivo.** `src/pantallas/Ingresar.tsx`.

**Cómo arreglarlo.** Envolvé el contenido en un `Pressable` sin estilo visible que llame a `Keyboard.dismiss()` al tocar fuera de los campos, con `accessible={false}`. El `ScrollView` ya tiene `keyboardShouldPersistTaps="handled"`; mantenelo.

---

### T-157 · los nombres se muestran como se escribieron, en minúsculas

**Lo que se ve.** "Hola, kisnner", "kisnner obando" en el boleto y en Configuración.

**Cómo arreglarlo.**
1. En `src/datos/perfil.ts`, agregá `nombrePropio(texto)`: primera letra de cada palabra en mayúscula, el resto como está, sin tocar partículas como "de", "del", "la" en medio del nombre.
2. Usala al **mostrar** el nombre (saludo de Viajar, Ajustes, boleto, pasajeros), no al guardar: lo que escribió la persona no se modifica.
3. Pruebas en `src/datos/perfil.test.ts`: `'kisnner obando'` da `'Kisnner Obando'`; `'maría de los ángeles'` da `'María de los Ángeles'`; un texto vacío da `''`.

---

## no hacer en esta lista

Lo mismo que en `08-auditoria.md`, más:

- No cambies la lógica del seguimiento ni de la transmisión del conductor. "0 % · Estás lejos de la ruta" en el video es correcto: el teléfono estaba en Boaco y el viaje salía de Managua.
- No toques la simulación del bus en Rutas: "Llega en 5 min" cambia con la hora y está marcada "Simulación".
