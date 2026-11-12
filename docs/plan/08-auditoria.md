# Auditoría 2026-11-12: tareas para corregir

Lista de defectos encontrados al revisar el código de `apps/movil` en la rama `t/mejora-ux-1`. Está escrita para que un agente la ejecute tarea por tarea sin tener que investigar: cada una dice qué está mal, dónde, cómo arreglarlo y cómo saber que quedó.

## reglas para quien ejecute esta lista

1. Leé `AGENTS.md` antes de empezar. Valen todas sus reglas: commits atómicos en español y minúsculas, sin atribución de IA, sin emojis, sin `git add -A`, nada de push.
2. Trabajá en el worktree `anden-wt/instalar`, rama `t/mejora-ux-1`. No cambies de rama.
3. Hacé las tareas en el orden de esta lista. Una tarea termina con todos sus commits hechos y la verificación en verde; recién ahí pasás a la siguiente.
4. Verificación después de cada commit, desde `apps/movil`:
   ```sh
   npx tsc --noEmit && npx expo lint && npx jest
   ```
   Al terminar cada tarea, desde la raíz del worktree:
   ```sh
   pnpm verificar
   pnpm -F movil exec expo export --platform ios --output-dir /tmp/exp-ios
   pnpm -F movil exec expo export --platform android --output-dir /tmp/exp-and
   ```
   Si `pnpm verificar` se queja de `apps/movil/expo-env.d.ts`, no lo toques: ya está en `.prettierignore`.
5. Si `tsc` dice que una ruta como `/conductor` no existe, los tipos de rutas están viejos: corré `npx expo start --web --port 8099` unos 30 segundos y cortalo; eso los regenera.
6. Ningún color, tamaño de letra, duración ni texto visible fuera de `src/tema/` y `src/textos/es.ts`.
7. Si una tarea pide algo que no podés comprobar sin un iPhone, hacé solo la parte de código y decilo al terminar. No inventes que lo viste.
8. Al terminar todo, marcá cada tarea `hecha` en `docs/plan/04-tareas.md` en un commit `docs:` y respondé con la lista de commits y lo que no pudiste verificar.

---

## T-131 · botones dentro de botones en tarjetas de corredor y filas de salida

**Problema.** `TarjetaCorredor` es un `Pressable` que contiene a `BotonFavorito` (otro `Pressable`). `FilaSalida` es un `Pressable` que contiene a `BotonRecordatorio`. En la web aparece el error `<button> cannot contain a nested <button>`, y en iPhone con VoiceOver la estrella y la campana quedan dentro del elemento accesible de la tarjeta y cuesta llegar a ellas.

**Archivos.** `src/componentes/TarjetaCorredor/TarjetaCorredor.tsx`, `src/componentes/FilaSalida/FilaSalida.tsx`.

**Cómo arreglarlo.**
1. En cada componente, el contenedor exterior pasa a ser un `View` con el mismo aspecto (el `Bloque`).
2. Dentro, el contenido principal (textos, hora, ícono) va en un `Pressable` con `style={{ flex: 1 }}` que conserva `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` y `onPress` que hoy tiene el exterior.
3. La estrella o la campana quedan como hermanas de ese `Pressable`, dentro de la misma fila, no dentro de él.
4. No cambies las etiquetas accesibles: las pruebas existentes las buscan por nombre.

**Hecho cuando.** Ningún `Pressable` contiene otro en esos dos componentes; las pruebas de `TarjetaCorredor`, `FilaSalida`, `Rutas`, `Horarios` y `Viajar` pasan sin cambiar sus expectativas; y en la vista web (`npx expo start --web`) ya no aparece el error de botón anidado en Rutas ni en Horarios.

**Commits.** `fix: la estrella del corredor deja de estar dentro del botón de la tarjeta`; `fix: la campana de la salida deja de estar dentro del botón de la fila`.

---

## T-132 · Boton y Hoja ignoran el modo de uso al reducir movimiento

**Problema.** `src/componentes/Boton/Boton.tsx` define su propia función `useMovimientoReducido` (cerca de la línea 195) que solo lee `AccessibilityInfo`, y tapa a la del tema. `src/componentes/Hoja/Hoja.tsx` hace lo mismo con un `useState` y `AccessibilityInfo.isReduceMotionEnabled`. Por eso, en los modos Sencillo y Rápido, el botón y la hoja siguen animándose.

**Cómo arreglarlo.**
1. En `Boton.tsx`, borrá la función local `useMovimientoReducido` y su `useEffect`, e importá `useMovimientoReducido` desde `@/tema/useMovimientoReducido`. Quitá los imports que queden sin uso (`AccessibilityInfo`, `useState` si ya no se usa).
2. En `Hoja.tsx`, reemplazá el estado `reducirMovimiento` y su `useEffect` por `const reducirMovimiento = useMovimientoReducido();` del tema.
3. Agregá una prueba a cada uno: dentro de `ProveedorModoUso` con el modo guardado como `'rapido'` en `AsyncStorage` bajo la clave `CLAVE_MODO_USO` de `src/tema/modoUso.ts`, el componente no llama a la animación. Copiá el patrón de las pruebas que ya usan `useReducedMotion` mockeado.

**Hecho cuando.** `grep -rn "isReduceMotionEnabled" apps/movil/src` no devuelve nada fuera de pruebas, y las pruebas nuevas pasan.

**Commits.** `fix: el botón respeta el modo de uso al reducir movimiento`; `fix: la hoja respeta el modo de uso al reducir movimiento`; uno `test:` por cada prueba.

---

## T-130 · tamaños de letra escritos a mano (ya está en el tablero)

**Problema.** 21 estilos escriben `fontSize` con un número dentro de `StyleSheet.create`. No escalan en el modo Sencillo y rompen la regla de dejar los tamaños en `src/tema`.

**Lista exacta** (de `grep -rn "fontSize: [0-9]" src --include='*.tsx' | grep -v test`):

| Archivo | Tamaños |
| --- | --- |
| `componentes/CabeceraPantalla/CabeceraPantalla.tsx` | 46 |
| `componentes/FilaBoleto/FilaBoleto.tsx` | 18 |
| `componentes/LineaRuta/LineaRuta.tsx` | 16 |
| `componentes/OpcionSeleccion/OpcionSeleccion.tsx` | 18 |
| `componentes/TalonBoleto/TalonBoleto.tsx` | 22, 26, 52 |
| `pantallas/Asientos.tsx` | 46 |
| `pantallas/Avisos.tsx` | 18 |
| `pantallas/Boletos.tsx` | 20, 42, 46 |
| `pantallas/Buscador.tsx` | 20 |
| `pantallas/DetalleViaje.tsx` | 18 |
| `pantallas/Pago.tsx` | 32 |
| `pantallas/Pasajeros.tsx` | 18 |
| `pantallas/PerfilChofer.tsx` | 16, 34, 44 |
| `pantallas/Portada.tsx` | 19 |

**Cómo arreglarlo.**
1. En `src/tema/tipografia.ts` agregá tokens nuevos con `escalable({...})`, igual que los existentes, uno por cada combinación repetida de familia, tamaño e interlínea. Nombres sugeridos: `nombreFila` (Archivo_600SemiBold 18/22), `titularCondensado` (ArchivoExtraCondensed_800ExtraBold 46), `destinoBoleto` (52), `codigoBoleto` (JetBrainsMono 26), `casillaBoleto` (JetBrainsMono 22), `cifraGrande` (44), `cifraMedia` (32/34), `lema` (19/26), `texto16`. Si un tamaño se parece a uno que ya existe (`dato`, `datoGrande`, `subtitulo`, `display`), usá el existente en vez de crear otro.
2. **Clave:** un `StyleSheet.create` se evalúa una sola vez al cargar el archivo, así que no escala aunque use el token. El token se aplica en el arreglo de estilos del render: `style={[tipografia.nombreFila, { color }]}`, y en el `StyleSheet` dejá solo lo que no es letra (márgenes, alineación).
3. Una pantalla o componente por commit.

**Hecho cuando.** `grep -rn "fontSize: [0-9]" apps/movil/src --include='*.tsx' | grep -v test` no devuelve nada y todas las pruebas pasan. Que ningún titular se corte en modo Sencillo solo se puede ver en un iPhone: decilo al terminar.

**Commits.** `feat: tokens de tipografía para ...`; después `refactor: <componente> usa los tokens de tipografía`, uno por archivo.

---

## T-133 · espacios y radios escritos a mano

**Problema.** Hay números sueltos de diseño fuera del tema. Los más visibles:

- `pantallas/ConductorViaje.tsx` y `pantallas/ReservaConfirmada.tsx`: `paddingBottom: margenes.bottom + 220`.
- `pantallas/DetalleViaje.tsx`: `paddingBottom: 200`, `paddingTop: margenes.top + 8`, `top: -84`, `marginTop: 84`, `paddingTop: 44`, `pie: { left: 14, right: 14 }`.
- `componentes/TalonBoleto/TalonBoleto.tsx`: `borderRadius: 16` y `26`, muescas `height/width: 28`, `top: -14`.
- `componentes/LineaViaje/LineaViaje.tsx`: `height: 2`.
- `pantallas/ReservaConfirmada.tsx`: `borderRadius: 26`, `minHeight: 44`.
- `pantallas/ConductorInicio.tsx` y `ConductorViaje.tsx`: `minHeight: 44`, `borderRadius: 999`.

Para la lista completa: `grep -rnE "(padding|margin|height|width|gap|borderRadius|top|bottom|left|right)[A-Za-z]*: -?[0-9]{2,}" apps/movil/src --include='*.tsx' | grep -v test`.

**Cómo arreglarlo.**
1. Usá lo que ya existe en `src/tema/espacios.ts`: `espacios.*`, `radios.*`, `tamanosControl.toqueMinimo` (44), `disposicionPantalla.*`.
2. Para el espacio que deja el pie flotante, agregá `disposicionPantalla.espacioPie: 220` y usalo en las tres pantallas. Para `200` de `DetalleViaje`, usá `disposicionPantalla.espacioPieReserva` (ya vale 200).
3. Para `999` usá `radios.pildora`.
4. Lo que sea medida de una ilustración (por ejemplo el bus del detalle, `-84` y `84`) va a `tamanosIlustracion` con un nombre que diga qué es.
5. No cambies ningún valor: solo dónde vive. La pantalla tiene que verse igual.

**Hecho cuando.** Los archivos de la lista no tienen números de espaciado de dos cifras o más fuera de `src/tema`, y las pruebas pasan sin cambios.

**Commits.** `refactor: <archivo> toma espacios y radios del tema`, uno por archivo; antes, si agregaste tokens, un `feat:` por el token nuevo.

---

## T-134 · quitar la mascota, que ya no se usa

**Problema.** El dueño pidió sacar la tarjeta de bienvenida ("Buenos días... Piiin, piiin"). Ya no se muestra ni tiene interruptor, pero quedó todo su código y `ProveedorMascota` sigue montado en `app/_layout.tsx`. Además, los textos de los modos de uso todavía dicen "y la mascota" y "ni mascota".

**Qué borrar.**
1. `src/componentes/MascotaBienvenida/` completo (componente, índice y prueba).
2. `src/datos/mascota.ts`, `src/datos/mascota.test.ts`, `src/datos/useMascota.ts`, `src/datos/ProveedorMascota.tsx`.
3. En `app/_layout.tsx`, el import y las etiquetas `<ProveedorMascota>` y `</ProveedorMascota>`, sin tocar el resto del árbol.
4. En `src/tema/modoUso.ts`, el campo `mostrarMascota` del tipo y de los tres modos; ajustá `src/tema/modoUso.test.ts` si lo nombra.
5. En `src/textos/es.ts`, la sección `mascota` completa. En `ajustes`, cambiá `modoCompletoDetalle` a `'Todas las animaciones y los sonidos.'` y `modoRapidoDetalle` a `'Sin adornos. Vas directo a tu viaje.'`.
6. Si `assets/sonidos/bocina.wav` solo lo usaba la mascota, no lo borres: la portada también lo usa.
7. En `docs/plan/decisiones.md` agregá una línea a la decisión 3 diciendo que la mascota se quitó a pedido del dueño el 2026-11-12.

**Hecho cuando.** `grep -rni "mascota" apps/movil/src apps/movil/app` no devuelve nada, y todo pasa.

**Commits.** `refactor: quitar el componente de la mascota`; `refactor: quitar el estado guardado de la mascota`; `refactor: los modos de uso ya no hablan de la mascota`; `docs: la mascota se quitó a pedido del dueño`.

---

## T-135 · textos sin uso en es.ts

**Problema.** Una búsqueda encontró unas 80 claves de `src/textos/es.ts` que ningún archivo nombra. Algunas sí se usan de forma dinámica, así que **no se pueden borrar a ciegas**.

**Claves que se usan armadas con una variable y NO se borran:** todo `servicios.*`, `estados.*`, `avisos.*` (se arman con `avisos.${tipo}` en `src/datos/textoAviso.ts`), `chofer.etiquetas.*`, `detalle.comodidades.*`, `opiniones.motivos.*`.

**Cómo hacerlo.**
1. Para cada clave candidata, buscá su última parte con `grep -rn "<parte>" apps/movil/src apps/movil/app` excluyendo `es.ts`. Buscá también la sección con `${` (por ejemplo `` `vitrina.${ ``).
2. Solo si no aparece en ningún lado, borrala.
3. Candidatas, a revisar una por una: `inicio.marca`, `inicio.horaMuestra`, `viajar.verBoleto`, `viajar.asientosLibres`, `viajar.origen`, `viajar.destino`, `viajar.elegirTerminal`, `viajar.intercambiarLugares`, `viajar.cuando`, `viajar.hoy`, `viajar.pasajeros`, `viajar.agregarPasajero`, `viajar.quitarPasajero`, `viajar.usarUbicacion`, `viajar.ubicacion*`, `viajar.reintentarUbicacion`, `viajar.abrirAjustes`, `horarios.ciudad`, `horarios.columna*`, `buscador.abrirViaje`, `asientos.ocupado`, `asientos.avisoPago`, `detalle.distancia`, `pago.pasajero`, `boleto.pagoAbordar`, `boleto.cambiar`, `boleto.cambioNoDisponible`, `boleto.modoPrueba`, `boleto.validar`, `conductor.volver`, `conductor.porcentaje`, `recordatorios.recordarme`, `recordatorios.activo`, `perfil.idioma`, `perfil.idiomaValor`, `rutas.verRecorrido`, `rutas.proximaUnidad`, `rutas.horarioReferencial`, `rutas.misRutas`, `rutas.otrasRutas`, `rutas.proximaSalida`, `rutas.mapaPronto`, `rutas.volver`, `vitrina.*`.
4. `vitrina.*` lo usa la pantalla `app/vitrina.tsx` a través de `src/pantallas/Vitrina.tsx`: revisalo con más cuidado y no borres nada que esa pantalla muestre.

**Hecho cuando.** Cada clave borrada tiene cero usos comprobados, y todo pasa.

**Commits.** `refactor: quitar textos sin uso de <sección>`, uno por sección.

---

## T-136 · archivo suelto en el plan

**Problema.** `docs/plan/04-tareas.md-E` es una copia vieja que dejó un `sed -i` mal usado en macOS. Está en git.

**Cómo arreglarlo.** `git rm docs/plan/04-tareas.md-E`.

**Commit.** `chore: quitar una copia vieja del tablero que dejó sed`.

---

## T-137 · el conductor no ve de dónde sale cada viaje

**Problema.** En `src/pantallas/ConductorInicio.tsx` cada fila muestra solo el destino. Un chofer que hace ida y vuelta ve dos filas "Managua" y no sabe cuál sale de Boaco y cuál de Juigalpa.

**Cómo arreglarlo.**
1. `Salida` no trae el origen. Agregá a `src/datos/salidas.ts` un campo `origen: string` (la ciudad de la terminal de origen) en `armarSalidas`, que ya busca la ruta y puede buscar la terminal con `ruta.origenId`.
2. Arreglá los lugares donde se construye un `Salida` a mano en pruebas (`grep -rn "codigoDestino:" apps/movil/src`): agregales `origen`.
3. En la fila del conductor, el título pasa a ser `` `${viaje.origen} → ${viaje.destino}` ``.
4. Prueba: con la sesión de `cho_2`, la lista muestra al menos una fila que empieza con `Boaco →` o `Juigalpa →`.

**Hecho cuando.** Ninguna fila del conductor queda ambigua y todo pasa.

**Commits.** `feat: cada salida sabe su ciudad de origen`; `feat: el conductor ve de dónde a dónde va cada viaje`; `test: ...`.

---

## T-138 · el sufijo de la hora sale en mayúsculas en la línea del viaje

**Problema.** En `src/componentes/LineaViaje/LineaViaje.tsx` el texto `` `${sufijoHora(hora)} · ${codigo}` `` usa `tipografia.etiqueta`, que tiene `textTransform: 'uppercase'`, así que se lee "P. M. · MAY". En el resto de la app la hora dice "p. m.".

**Cómo arreglarlo.** Separá el sufijo del código: el sufijo en un `Text` con `tipografia.pequeno` (sin mayúsculas) y el código en otro `Text` con `tipografia.etiqueta`, los dos en una fila. Ajustá `LineaViaje.test.tsx` y `DetalleViaje.test.tsx`, que hoy buscan `p. m. · MAY` en un solo texto.

**Commit.** `fix: la línea del viaje escribe a. m. y p. m. en minúsculas como el resto de la app`.

---

## T-139 · pruebas que faltan

Agregá una prueba por cada caso, en un commit `test:` propio:

1. `src/datos/useRecorrido.ts` no tiene prueba: con `Managua` y `Juigalpa` devuelve un trazo de más de 2 puntos y `distanciaKm` mayor que 100; con una ciudad inexistente devuelve `null`.
2. `src/datos/seguirUbicacion.ts` no tiene prueba: mockeá `expo-location` (`watchPositionAsync` que llama al callback con `coords.speed: -1`) y comprobá que la posición publicada trae `velocidadMs: null`; y que la función devuelta llama a `remove()`.
3. `src/pantallas/Rutas.tsx`: con un favorito guardado en `anden.favoritos`, ese corredor sale primero en su grupo.
4. `src/componentes/Campaneo` y `src/componentes/Rebote`: con modo Rápido no animan (mismo patrón que T-132).

**Hecho cuando.** Las cuatro pruebas existen, pasan, y cada una falla si se rompe a propósito lo que prueba.

---

## no hacer en esta lista

Estas cosas están pendientes pero necesitan una decisión del dueño, un iPhone o el servidor. No las toques:

- Subir la rama, abrir un PR o integrar a `main`.
- Conectar Supabase o agregar dependencias.
- El botón de emergencia: faltan los números oficiales de Nicaragua.
- Ocultar los datos de prueba del ingreso del conductor: siguen visibles a propósito hasta que exista el servidor.
- Seguimiento con la app en segundo plano.
- El espacio al final de cada pestaña con la barra nativa: hay que verlo en un iPhone.
- Las preguntas abiertas de `docs/plan/07-roles-y-supabase.md`.
