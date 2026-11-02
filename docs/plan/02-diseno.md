# 02 · diseño

Esta es la referencia visual. Ninguna pantalla se hace "a ojo": se usa lo que está aquí, y si falta algo se agrega aquí primero en un commit `docs:`.

## concepto: barro, tablero y talón

Dirección v2, aprobada el 2 de noviembre de 2026 a partir de `mockups/identidad-v2.html` (capturas en `mockups/capturas/v2/`). La v1 oscura quedó reemplazada.

La app es un objeto táctil y amable, no un panel de datos. Tres ideas la sostienen:

1. **Barro.** Fondo crema cálido y bloques blandos con relieve, como de arcilla: luz arriba a la izquierda, sombra abajo a la derecha. Todo lo que se puede tocar parece que se puede tocar.
2. **El tablero de andén**, dentro de un bloque negro. Letras ámbar como de LED con split-flap. Es la cara de los horarios y la única zona oscura grande de la pantalla.
3. **El bus de personaje.** Un bus ilustrado, redondo y con volumen, que es la mascota de la marca: aparece enorme en la portada, cruza el borde de la tarjeta del próximo viaje y está en el ícono. El boleto sigue siendo papel crema con muescas y talón.

Cada pantalla tiene una sola cosa dominante (el bus, el titular o el tablero), un solo botón ámbar y todo alineado a la cuadrícula: nada colgando de una esquina ni a medio cortar.

## lo que no se hace

- Listas agrupadas de iOS, celdas con chevron, ajustes con interruptores en fila larga.
- Azul de sistema, morado de "app moderna", degradados de arcoíris.
- Tarjetas planas con sombra gris. El relieve es siempre de luz y sombra cálidas.
- Íconos de librería (lucide, feather, SF Symbols, Material). Los íconos son ilustrados y propios (ver `Icono`).
- Elementos asimétricos o colgando: píldoras montadas en una esquina, halos borrosos, tarjetas cortadas por la barra inferior. La única pieza que cruza un borde es el bus sobre la tarjeta del próximo viaje, centrado.
- Tipografías del sistema o Inter como fuente de marca.
- Emojis, en cualquier lugar (botones, textos, notificaciones, datos de muestra).
- Ilustraciones genéricas de personas, mapas de "pin rojo" por defecto.
- Componentes de librerías de UI con su estilo de fábrica (React Native Paper, NativeBase, Tamagui por defecto). Se construyen los propios.

## color

Claro cálido de día y oscuro automático de noche (de 18:00 a 06:00, o el del sistema si la persona lo fija). Los valores viven en `apps/movil/src/tema/colores.ts` y nadie escribe un hexadecimal fuera de ese archivo.

| token | claro | oscuro | uso |
|---|---|---|---|
| `fondo` | `#F5F1E8` | `#121210` | fondo de pantalla |
| `fondoProfundo` | `#E8E1D1` | `#0B0B09` | final del degradado del fondo |
| `barroClaro` | `#F2EDE1` | `#2A2923` | inicio del degradado de un bloque blando |
| `barroOscuro` | `#E3DCCB` | `#1C1B17` | final del degradado de un bloque blando |
| `superficie` | `#EDE7DA` | `#201F1B` | hojas y paneles planos |
| `superficieAlta` | `#FBF8EF` | `#2B2A25` | píldoras y elementos sobre bloques |
| `linea` | `#D8D0BD` | `#34322B` | separadores y asientos vendidos |
| `bloqueNegro` | `#1C1B17` | `#0B0B09` | tablero, tarjeta del próximo viaje, barra de pago |
| `tinta` | `#17160F` | `#F2EFE8` | texto principal |
| `tintaSuave` | `#605B50` | `#A9A59C` | texto secundario |
| `ambar` | `#FFB21E` | `#FFB21E` | relleno del acento: botón, asiento elegido, tablero |
| `ambarProfundo` | `#F29A00` | `#E08C00` | final del degradado del ámbar |
| `ambarTexto` | `#874F00` | `#FFB21E` | texto ámbar de menos de 24 px sobre claro |
| `ambarTitular` | `#B86E00` | `#FFB21E` | titulares ámbar grandes sobre el fondo |
| `sobreAmbar` | `#1A1205` | `#1A1205` | texto sobre ámbar |
| `papel` | `#F2EBDD` | `#F2EBDD` | boleto (igual en los dos modos) |
| `tintaPapel` | `#1B1A17` | `#1B1A17` | texto del boleto |
| `aTiempo` | `#166D43` | `#5FD39A` | estado a tiempo |
| `atrasado` | `#A8360A` | `#FF7A59` | estado atrasado |
| `cancelado` | `#B4233A` | `#FF5A6E` | estado cancelado y errores |

Relieve (bloques blandos): luz `#FFFFFF` al 90 % arriba a la izquierda y sombra `#7D6941` al 20 % abajo a la derecha en claro; en oscuro luz blanca al 4 % y sombra negra al 50 %. Se definen en `tema/colores.ts` junto con el resto.

Reglas:

- El ámbar es relleno, no texto: el texto ámbar usa `ambarTexto` o `ambarTitular`. Sobre claro, `#FFB21E` solo se admite como relleno con `sobreAmbar` encima.
- Un solo botón ámbar por pantalla; el ámbar nunca es el fondo de una pantalla entera.
- Los estados nunca se comunican solo con color: llevan texto o forma.
- Todo par texto/fondo pasa AA (4.5:1 normal, 3:1 grande), también sobre `barroOscuro`. Los valores de la tabla se calcularon contra `fondo` y `barroOscuro`; los del mockup (`#8C8676` para texto suave y `#F29A00` para texto ámbar) no llegaban a AA y por eso no se usan como texto. La tarea T-071 lo verifica con un script.

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

Titular a dos tonos: la primera parte en `tinta`, la palabra clave en `ambarTitular` ("¿Para dónde **vas**?"). El nombre "ANDÉN" de la portada es un degradado gris cálido con sombra, enorme (alrededor de 150 px en ExtraCondensed 900) y queda detrás del bus.

## forma, espacio y movimiento

- Espaciado en múltiplos de 4: 4, 8, 12, 16, 24, 32, 48. Margen lateral de pantalla: 20. Todo se alinea a esos márgenes: dos bloques hermanos tienen el mismo ancho y la misma separación.
- Radios: 12 en asientos, 18 en losetas de ícono, 26 en bloques de barro, 30 en bloques negros, 56 en la carcasa del plano del bus, 999 en píldoras y botones.
- Relieve: dos sombras (luz arriba a la izquierda, sombra abajo a la derecha) más un reborde de luz de 1 px. El estado "hundido" (casilla sin elegir, asiento vendido) invierte las sombras hacia adentro. En React Native las sombras exteriores van con las propiedades de sombra; las interiores se dibujan con `react-native-svg` en un degradado.
- Barra de pestañas flotante: píldora de barro a 14 px de los bordes y a 26 del pie, con la pestaña activa en una píldora negra con ícono y nombre. Sin desenfoque.
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
