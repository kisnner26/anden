# 02 · diseño

Esta es la referencia visual. Ninguna pantalla se hace "a ojo": se usa lo que está aquí, y si falta algo se agrega aquí primero en un commit `docs:`.

## concepto: el tablero y el talón

La app toma dos objetos reales del viaje en bus y los vuelve interfaz:

1. **El tablero de andén.** Fondo carbón, letras ámbar como de LED, filas que cambian letra por letra (split-flap) cuando se actualiza una salida. Es la cara de los horarios.
2. **El boleto con talón.** Papel crema con muescas a los lados, línea perforada y un talón que se separa para mostrar el código. Es la cara de la compra.

Todo lo demás (buscador, rutas, choferes) usa la misma gramática: carbón, crema, un solo acento ámbar, titulares condensados enormes y datos en mono.

## lo que no se hace

- Listas agrupadas de iOS, celdas con chevron, ajustes con interruptores en fila larga.
- Azul de sistema, morado de "app moderna", degradados de arcoíris.
- Tarjetas blancas planas con sombra gris.
- Tipografías del sistema o Inter como fuente de marca.
- Emojis, en cualquier lugar (botones, textos, notificaciones, datos de muestra).
- Ilustraciones genéricas de personas, mapas de "pin rojo" por defecto.
- Componentes de librerías de UI con su estilo de fábrica (React Native Paper, NativeBase, Tamagui por defecto). Se construyen los propios.

## color

Modo oscuro por defecto. Los valores viven en `apps/movil/src/tema/colores.ts` y nadie escribe un hex fuera de ese archivo.

| token | oscuro | claro | uso |
|---|---|---|---|
| `fondo` | `#0E0F11` | `#F4F1EA` | fondo de pantalla |
| `superficie` | `#16181B` | `#FBF9F4` | tarjetas, hojas |
| `superficieAlta` | `#1F2226` | `#FFFFFF` | elementos sobre tarjetas |
| `linea` | `#2C3036` | `#DDD8CC` | bordes y separadores |
| `tinta` | `#F2EFE8` | `#141517` | texto principal |
| `tintaSuave` | `#A9A59C` | `#5C5A55` | texto secundario |
| `ambar` | `#FFB21E` | `#B86E00` | acento único: acción principal, selección, tablero |
| `sobreAmbar` | `#1A1205` | `#FFFFFF` | texto sobre ámbar |
| `papel` | `#F2EBDD` | `#F2EBDD` | boleto (igual en los dos modos) |
| `tintaPapel` | `#1B1A17` | `#1B1A17` | texto del boleto |
| `aTiempo` | `#5FD39A` | `#1E8A57` | estado a tiempo |
| `atrasado` | `#FF7A59` | `#C2410C` | estado atrasado |
| `cancelado` | `#FF5A6E` | `#B4233A` | estado cancelado, errores |

Reglas: el ámbar nunca es fondo de pantalla completa; un solo botón ámbar por pantalla; los estados nunca se comunican solo con color (llevan texto o forma). Todo par texto/fondo pasa AA (4.5:1 normal, 3:1 grande); la tarea T-071 lo verifica con un script.

## tipografía

Dos familias, cargadas con `@expo-google-fonts`:

- **Archivo** (incluye cortes condensados): titulares y texto. Titulares en Archivo ExtraCondensed 800, mayúsculas solo en el tablero.
- **JetBrains Mono**: horas, precios, números de asiento, códigos de boleto, andenes.

| estilo | familia | tamaño / interlínea | uso |
|---|---|---|---|
| `display` | Archivo ExtraCondensed 800 | 56 / 52 | titular de inicio, destino en el boleto |
| `titulo` | Archivo Condensed 700 | 34 / 36 | título de pantalla |
| `subtitulo` | Archivo 600 | 20 / 26 | secciones |
| `cuerpo` | Archivo 400 | 16 / 24 | texto general |
| `pequeno` | Archivo 500 | 13 / 18 | etiquetas, ayudas |
| `datoGrande` | JetBrains Mono 600 | 28 / 32 | hora de salida, precio total |
| `dato` | JetBrains Mono 500 | 15 / 20 | horas en listas, asientos, andén |
| `etiqueta` | JetBrains Mono 500 | 11 / 14, espaciado 0.08em, mayúsculas | rótulos tipo "SALIDA", "ANDÉN" |

Titular a dos tonos: la primera parte en `tinta`, la palabra clave en `ambar` ("¿Para dónde **vas**?").

## forma, espacio y movimiento

- Espaciado en múltiplos de 4: 4, 8, 12, 16, 24, 32, 48. Margen lateral de pantalla: 20.
- Radios: 4 en el tablero y botones cuadrados, 20 en tarjetas y hojas, 999 en píldoras.
- Cristal: barra de pestañas flotante y hojas inferiores con desenfoque (`expo-blur`; en iOS 26+ vidrio nativo si el SDK de Expo lo ofrece). En Android, sin desenfoque: `superficieAlta` al 94 % de opacidad.
- Duraciones: 180 ms (toques), 240 ms (cambios de estado), 320 ms (entradas de pantalla). Curva de salida suave. Con "reducir movimiento" activado, todo pasa a fundido de 120 ms y el split-flap cambia sin girar.
- Respuesta háptica ligera al elegir asiento, al confirmar pago y al separar el talón.

## componentes propios

Cada uno vive en `apps/movil/src/componentes/<Nombre>/` con su archivo, su prueba de render y una página en la vitrina interna (`/vitrina`, solo en desarrollo).

| componente | descripción |
|---|---|
| `Boton` | variantes: `principal` (ámbar, cuadrado, radio 4, texto `sobreAmbar`), `secundario` (borde `linea`), `pildora` (cristal con círculo-flecha a la derecha). Altura 52. Estado cargando con barra ámbar que avanza, no spinner. |
| `Tarjeta` | `superficie`, radio 20, borde 1 `linea`, sin sombra en oscuro. |
| `Etiqueta` | texto mono en mayúsculas con espaciado; opcional caja con borde. |
| `Chip` | píldora seleccionable (filtros: tipo de bus, hora). |
| `CampoLugar` | origen/destino con autocompletado de terminales y botón para intercambiar (giro de 180° al tocarlo). |
| `TableroSalidas` | filas de tablero: hora (mono ámbar), destino (condensado, mayúsculas), andén en caja, estado. Animación split-flap por carácter al cambiar un valor. |
| `LineaRuta` | recorrido vertical tipo plano de metro: línea ámbar, paradas como nodos, horas a la izquierda, bus en vivo como píldora que avanza. |
| `MapaAsientos` | plano visto desde arriba según la configuración del bus: volante, puerta, pasillo. Asientos como cuadrados redondeados con número en mono. Libre: borde `linea`. Elegido: relleno ámbar. Retenido por otro: punteado. Vendido: rayado diagonal (no solo gris). |
| `Talon` | boleto en `papel` con muescas laterales y línea perforada. Arriba: origen → destino en `display`, fecha, hora, asiento, andén. Abajo, al arrastrar el talón: código y QR, y el brillo de pantalla sube. |
| `TarjetaChofer` | foto en círculo, nombre, años, calificación con un decimal, insignia "licencia verificada". |
| `Estrellas` | calificación de 1 a 5 con trazos propios, accesible como control deslizante. |
| `BarraPestanas` | cristal flotante a 12 del borde inferior, 4 pestañas: Viajar, Horarios, Rutas, Boletos. Cuenta va arriba a la derecha en cada pantalla. |
| `Hoja` | hoja inferior de cristal con asa, para filtros, detalle de parada y confirmaciones. |
| `EstadoVacio`, `EstadoError`, `Esqueleto` | vacío con texto directo y una acción; error con causa y reintentar; carga con bloques que respiran (sin spinner). |
| `Icono` | set de íconos ilustrados propios, rellenos y con volumen, dibujados con `react-native-svg` a partir de los símbolos de `mockups/identidad-v2.html` (campana, boleto, rayo, taxi, lupa, reloj, volante, flechas y los cuatro de la barra). Prohibido usar librerías de íconos de línea como lucide, feather o los símbolos del sistema. Ninguna pantalla importa íconos directo. |

## pantallas clave

1. **Viajar (inicio).** Titular "¿Para dónde vas?" en `display`. `CampoLugar` doble, fecha en chips (Hoy, Mañana, elegir), pasajeros con − / +. Debajo, "Tus rutas" con la próxima salida de cada ruta frecuente en mini tablero. Botón principal "Buscar salidas".
2. **Resultados.** Encabezado compacto con la ruta. Filtros en chips. Cada salida es una fila ancha: hora grande en mono, duración, tipo de bus, asientos libres en barra fina, precio a la derecha, chofer con calificación.
3. **Elegí tu asiento.** `MapaAsientos` a pantalla completa, leyenda arriba, contador de retención (10:00) en mono, total abajo con botón principal.
4. **Pasajeros y pago.** Pasos numerados arriba (1 asiento · 2 pasajeros · 3 pago). Formularios en tarjetas, nunca listas de iOS.
5. **Tu boleto.** `Talon` centrado, cuenta regresiva a la salida, botones "Seguir el bus" y "Agregar al calendario".
6. **Horarios.** Selector de terminal y `TableroSalidas` a pantalla completa. Es la pantalla insignia: tiene que verse como un tablero real.
7. **Rutas.** Mapa oscuro (MapLibre) con todas las rutas en ámbar tenue; al tocar una, se ilumina y sube una `Hoja` con `LineaRuta`.
8. **Chofer.** Foto grande, datos, bus que maneja, últimas calificaciones con etiquetas.

## texto

- Español de Nicaragua con voseo: "Elegí tu asiento", "¿Para dónde vas?", "Tu bus viene a 4 minutos".
- Directo, sin signos de exclamación de relleno ni "¡Ups!". Errores con causa y salida: "No hay conexión. Tu boleto sigue disponible sin internet."
- Horas en formato de 12 h con "a. m." / "p. m.", precios como `C$ 85`.
- Todos los textos en `apps/movil/src/textos/es.ts`; ninguna pantalla escribe frases sueltas.

## mapa

Estilo base gratuito sin clave (OpenFreeMap) con una capa de estilo propia en `apps/movil/src/mapa/estilo-oscuro.json`: tierra `fondo`, calles `linea`, agua `#14202A`, etiquetas `tintaSuave`, rutas en `ambar`. Sin pines rojos: las terminales son cuadrados ámbar con el código de terminal en mono.
