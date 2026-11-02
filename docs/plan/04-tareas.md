# 04 · tareas

Tablero único del proyecto. No hay tareas asignadas a nadie: cualquier agente toma cualquier tarea **libre** cuyas dependencias estén **hechas**, siguiendo `AGENTS.md`.

Cada tarea dice qué hacer, dónde, cuándo está hecha y qué commits se esperan. Los commits sugeridos son una guía mínima: si el trabajo real da más pasos, son más commits; nunca menos de uno por idea.

**Estados:** `libre` → (tomada: se ve en el candado, no aquí) → `hecha`. Al terminar, el último commit de la tarea cambia su estado aquí a `hecha` (`docs: cerrar T-xxx`). Si una tarea resulta muy grande, se parte en `T-xxxa`, `T-xxxb` en un commit `docs:` antes de empezar.

**Raíz:** las tareas marcadas `raíz: sí` tocan archivos compartidos (`package.json` de raíz o de un paquete, `pnpm-lock.yaml`, `app.json`/`app.config.ts`, CI, `tsconfig` base). Solo una a la vez: requieren el candado `raiz` además del de la tarea.

## fase 0 · cimientos

### T-000 · monorepo y app vacía
- depende de: nada · zona: raíz · raíz: sí · estado: hecha
- hacer: `pnpm` workspaces con `apps/movil` (Expo con Expo Router y TypeScript, versión estable vigente), `packages/dominio` y `packages/datos` vacíos con `package.json` (`@anden/dominio`, `@anden/datos`). bundle id `com.kisnner.anden`, esquema `anden`. Anotar versiones en la tabla de `03-arquitectura.md`.
- hecho cuando: `pnpm install` limpio; la app abre en iOS y Android en compilación de desarrollo mostrando una pantalla con el texto "Andén".
- commits: `chore: crear workspace de pnpm` · `chore: agregar app expo con expo router` · `chore: agregar paquetes dominio y datos` · `docs: fijar versiones del stack`

### T-001 · calidad del código
- depende de: T-000 · zona: raíz · raíz: sí · estado: hecha
- hacer: TypeScript estricto (`strict`, `noUncheckedIndexedAccess`) con `tsconfig` base; ESLint y Prettier compartidos; script `pnpm verificar` que corre tipos, lint y pruebas de todo.
- hecho cuando: `pnpm verificar` pasa en verde.
- commits: `chore: configurar typescript estricto` · `chore: configurar eslint y prettier` · `chore: agregar script verificar`

### T-002 · pruebas en paquetes y app
- depende de: T-001 · zona: raíz · raíz: sí · estado: hecha
- hacer: Vitest en `dominio` y `datos` con una prueba de humo cada uno; Jest + React Native Testing Library en `movil` con una prueba de render de la pantalla inicial.
- hecho cuando: las tres pruebas de humo corren dentro de `pnpm verificar`.
- commits: `chore: configurar vitest en paquetes` · `chore: configurar jest en la app`

### T-003 · integración continua
- depende de: T-002 · zona: `.github/` · raíz: sí · estado: hecha
- hacer: GitHub Actions que corre `pnpm verificar` en cada push y PR, con caché de pnpm.
- hecho cuando: el flujo es válido (`actionlint` si está disponible) y corre los mismos comandos que local.
- commits: `chore: agregar ci con verificar`

### T-004 · mockup de identidad
- depende de: nada · zona: `mockups/` · raíz: no · estado: hecha
- hacer: un HTML estático (`mockups/identidad.html`) con 4 pantallas a tamaño de teléfono siguiendo `02-diseno.md`: Viajar, Horarios (tablero), Elegí tu asiento, Tu boleto. Fuentes reales, colores del plan, textos reales con voseo. Captura PNG de cada pantalla en `mockups/capturas/`.
- hecho cuando: el dueño del proyecto lo aprueba. **Bloquea toda la fase 3.** Si pide cambios, se ajusta `02-diseno.md` en su propio commit.
- commits: `feat: mockup de inicio y tablero` · `feat: mockup de asientos y boleto` · `docs: capturas del mockup`

### T-005 · tema
- depende de: T-002, T-004 · zona: `apps/movil/src/tema/` · raíz: no · estado: hecha
- hacer: `colores.ts` (oscuro y claro), `tipografia.ts`, `espacios.ts`, `movimiento.ts`, y un hook `useTema()` que sigue el modo del sistema con preferencia guardada.
- hecho cuando: prueba que verifica que ambos modos tienen las mismas claves; ningún hex fuera de `colores.ts` (regla de lint o prueba que lo busque).
- commits: `feat: tokens de color oscuro y claro` · `feat: escala tipográfica` · `feat: espacios y duraciones` · `feat: hook usetema con preferencia guardada`

### T-006a · fuentes y pantalla de carga
- depende de: T-005 · zona: `apps/movil` · raíz: sí · estado: hecha
- hacer: cargar Archivo, Archivo Narrow y JetBrains Mono con `@expo-google-fonts`; la pantalla de carga espera las fuentes. Titular provisional en Archivo Narrow Bold porque `@expo-google-fonts/archivo` solo trae el ancho normal.
- hecho cuando: la app empaqueta en iOS y Android (`expo export`), carga las fuentes antes de mostrar la pantalla y la pantalla inicial usa Archivo Narrow y JetBrains Mono.
- commits: `chore: agregar fuentes archivo y jetbrains mono` · `feat: esperar fuentes antes de mostrar la app`

### T-006b · titular en Archivo ExtraCondensed
- depende de: T-006a · zona: `apps/movil/assets/fuentes/`, `apps/movil/src/tema/` · raíz: sí · estado: hecha
- hacer: el mockup aprobado usa Archivo ExtraCondensed 800 (display) y Condensed 700 (título). Incluir esos dos cortes estáticos con licencia OFL como archivos locales en `apps/movil/assets/fuentes/`, cargarlos con `expo-font` y apuntar `display` y `titulo` de `tipografia.ts` a ellos en lugar de Archivo Narrow.
- hecho cuando: el titular de la pantalla inicial se ve tan condensado como en `mockups/capturas/viajar.png`, en iOS y Android.
- commits: `chore: agregar cortes condensados de archivo` · `feat: cargar cortes condensados` · `refactor: titulares con archivo condensado`

### T-007 · textos
- depende de: T-000 · zona: `apps/movil/src/textos/` · raíz: no · estado: hecha
- hacer: `es.ts` tipado (objeto anidado por pantalla) y helper `t('viajar.titulo')` con autocompletado de claves.
- hecho cuando: una clave inexistente falla en `tsc`.
- commits: `feat: catalogo de textos en español`

### T-008 · pruebas fuera del directorio de rutas
- depende de: T-002 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: Expo Router trata todo archivo de `apps/movil/app/` como una pantalla, así que `app/index.test.tsx` rompe el empaquetado (Metro no resuelve `@testing-library/react-native`). Mover la prueba a `apps/movil/pruebas/` y agregar una prueba que falle si aparece un `*.test.*` dentro de `app/`.
- hecho cuando: `npx expo export --platform android` y `--platform ios` empaquetan sin error y `pnpm verificar` sigue en verde.
- commits: `fix: sacar la prueba del directorio de rutas` · `test: ningún archivo de prueba dentro de app` · `docs: regla de pruebas fuera de app`

## fase 1 · dominio (TypeScript puro)

Todas en `packages/dominio`, raíz: no. Cada regla viene con sus pruebas en el mismo commit (las reglas están en `01-producto.md`).

### T-010 · tipos, esquemas y resultado
- depende de: T-002 · estado: hecha
- hacer: tipos de `03-arquitectura.md` en `tipos.ts`, esquemas Zod en `esquemas.ts`, tipo `Resultado` con helpers `ok()` y `error()`.
- hecho cuando: pruebas que validan un objeto correcto e incorrecto de cada esquema.
- commits: `feat: tipo resultado` · `feat: tipos del dominio` · `feat: esquemas zod del dominio`

### T-011 · configuraciones de asientos
- depende de: T-010 · estado: hecha
- hacer: matrices `micro15`, `coaster26`, `bus45` en `configuraciones.ts` y `asientosDe(config)` que devuelve la lista numerada con tipo (ventana, pasillo, preferencial).
- hecho cuando: cada configuración tiene exactamente su número de asientos, numeración sin huecos, preferenciales en la primera fila.
- commits: `feat: configuraciones de asientos por tipo de bus`

### T-012 · precio
- depende de: T-010 · estado: hecha
- hacer: tipo `Tramo = { desde: number; hasta: number }` con su esquema (índices de `ruta.paradas`, `desde < hasta`, dentro de rango), `minutosDelTramo(ruta, tramo)` y `calcularPrecio(ruta, tramo, tipoBus, pasajeros)` que devuelve `Resultado<{ unitario: number; total: number }, 'tramo-invalido' | 'sin-pasajeros'>`. `pasajeros` es `Pasajero[]`: los menores en brazos no pagan y si no queda ninguno que pague es `sin-pasajeros`. La regla de prorrateo está en `01-producto.md`.
- hecho cuando: pruebas de multiplicadores, redondeo hacia arriba una sola vez, menores en brazos gratis, tramo completo igual a `tarifaBase`, tramo parcial por minutos y los dos errores.
- commits: `feat: calcular precio por tramo y tipo de bus`

### T-013 · disponibilidad y retención
- depende de: T-011, T-014 · estado: libre
- hacer: tipo `Ocupacion` con su esquema (ver `03-arquitectura.md`; el esquema exige `expira` si está retenido y `boletoId` si está vendido); `estadoAsientos(config, ocupaciones, ahora)` que devuelve `{ numero, estado: 'libre' | 'retenido' | 'vendido', duenoId? }[]` y trata la retención vencida como libre; y `puedeRetener(viaje, config, ocupaciones, asientos, duenoId, ahora)` que devuelve `Resultado<void, 'sin-asientos' | 'maximo-6' | 'asiento-inexistente' | 'asiento-ocupado' | 'venta-cerrada'>`. Un asiento retenido por el mismo dueño se puede volver a retener (renueva); uno de otro dueño o vendido, no. Usa `ventaAbierta` de T-014.
- hecho cuando: pruebas de choque (dos dueños, mismo asiento), renovación por el mismo dueño, retención vencida, más de 6, asiento inexistente, viaje cancelado y venta cerrada.
- commits: `feat: estado de asientos con retenciones vencidas` · `feat: validar retencion de asientos`

### T-014 · horarios y estado del viaje
- depende de: T-010 · estado: hecha
- hacer: `estadoViaje(viaje, ruta, ahora)` (programado, abordando, en ruta, llegó, atrasado, cancelado; recibe la ruta porque la llegada depende de su duración), `llegadaEstimada(viaje, ruta, parada)` y `ventaAbierta(viaje, ahora)`. Las reglas y su orden de precedencia están en `01-producto.md`.
- hecho cuando: pruebas en los bordes exactos (20 min, 15 min, salida real con atraso, llegada) y de la precedencia (un viaje cancelado nunca aparece como en ruta ni con la venta abierta).
- commits: `feat: estado del viaje segun la hora` · `feat: llegada estimada por parada` · `feat: cierre de venta`

### T-015 · búsqueda
- depende de: T-012, T-014 · estado: libre
- hacer: `buscarViajes(filtro, datos, ahora)` que filtra por origen/destino (incluye paradas intermedias), fecha, asientos libres suficientes, y ordena por salida; filtros por tipo de bus y franja horaria.
- hecho cuando: pruebas con una semilla pequeña de 3 rutas.
- commits: `feat: buscar viajes por origen y destino` · `feat: filtros de tipo y franja horaria`

### T-016 · cancelación y cambio
- depende de: T-014 · estado: libre
- hacer: `politicaCancelacion(boleto, viaje, ahora)` → porcentaje y monto; `puedeCambiar(...)`.
- hecho cuando: pruebas en 24 h y 2 h exactas, cambio ya usado.
- commits: `feat: reembolso segun anticipacion` · `feat: regla de cambio de salida`

### T-017 · código de boleto
- depende de: T-010 · estado: hecha
- hacer: `generarCodigo(aleatorio)` y `codigoValido(codigo)` con alfabeto sin ambiguos y dígito de control.
- hecho cuando: pruebas de validez, un carácter alterado falla, generador inyectable para pruebas deterministas.
- commits: `feat: codigo de boleto con digito de control`

### T-018 · formato es-NI
- depende de: T-010 · estado: libre
- hacer: `formatoCordobas(n)`, `formatoHora(fecha)` (12 h, "a. m."), `formatoDuracion(min)`, `formatoFechaCorta`, `enmascararCedula`.
- hecho cuando: pruebas con zona horaria `America/Managua` fija.
- commits: `feat: formato de moneda y horas` · `feat: enmascarar cedula`

### T-019 · calificaciones
- depende de: T-010 · estado: libre
- hacer: `promedioChofer(calificaciones)` (últimas 200, un decimal, nulo con menos de 5) y `puedeCalificar(boleto, existentes)`.
- hecho cuando: pruebas de límites.
- commits: `feat: promedio de calificaciones del chofer`

## fase 2 · datos

Todas en `packages/datos` salvo T-024 y T-025.

### T-020 · contrato
- depende de: T-010 · raíz: no · estado: libre
- hacer: interfaces de `03-arquitectura.md` en `contrato.ts` y suite de pruebas de contrato reutilizable `probarContrato(crear)`.
- hecho cuando: la suite compila y se puede llamar con cualquier implementación.
- commits: `feat: contrato de repositorios` · `test: suite de contrato reutilizable`

### T-021 · semilla de Nicaragua
- depende de: T-010 · raíz: no · estado: libre
- hacer: terminales, rutas con paradas, buses, choferes (nombres inventados, sin fotos reales), viajes generados para 14 días desde una fecha base. Validados con los esquemas Zod. Rotular `// datos de muestra`.
- hecho cuando: prueba que toda la semilla pasa los esquemas y que cada ruta tiene al menos 6 salidas diarias.
- commits: `feat: terminales y rutas de muestra` · `feat: buses y choferes de muestra` · `feat: generador de salidas de muestra`

### T-022 · repositorio en memoria
- depende de: T-020, T-021, T-013, T-015, T-016, T-017 · raíz: no · estado: libre
- hacer: implementación en memoria de todos los repositorios usando las reglas del dominio; latencia simulada configurable (por defecto 250 ms); simulador de posición del bus.
- hecho cuando: pasa la suite de contrato completa.
- commits: un `feat:` por repositorio (terminales, rutas, viajes, asientos, boletos, choferes, calificaciones, posiciones) · `feat: simulador de posicion del bus`

### T-023 · pago simulado
- depende de: T-020 · raíz: no · estado: libre
- hacer: `PagoSimulado` según `03-arquitectura.md`.
- hecho cuando: pruebas de aprobado, rechazado con la tarjeta de prueba y referencia duplicada.
- commits: `feat: proveedor de pago simulado`

### T-024 · proveedor y hooks en la app
- depende de: T-022, T-023, T-000 · zona: `apps/movil/src/datos/` · raíz: sí (agrega TanStack Query) · estado: libre
- hacer: `proveedor.ts` que elige implementación por `EXPO_PUBLIC_DATOS`; `QueryClient` con persistencia; hooks `useBuscarViajes`, `useViaje`, `useSalidas`, `useMapaAsientos`, `useRetener`, `useComprar`, `useMisBoletos`, `useChofer`, `useRutas`, `usePosicionBus`.
- hecho cuando: prueba de cada hook contra el repositorio en memoria.
- commits: `chore: agregar tanstack query` · `feat: proveedor de datos por entorno` · un `feat:` por grupo de hooks

### T-025 · almacenamiento offline
- depende de: T-024 · zona: `apps/movil/src/estado/` · raíz: sí (agrega MMKV y Zustand) · estado: libre
- hacer: store de boletos persistido en MMKV, store de rutas frecuentes y recientes, store del flujo de compra (viaje, asientos, retención, pasajeros) que se limpia al terminar o vencer.
- hecho cuando: pruebas de persistencia y de limpieza al vencer la retención.
- commits: `chore: agregar mmkv y zustand` · `feat: boletos guardados sin conexion` · `feat: rutas frecuentes y recientes` · `feat: estado del flujo de compra`

## fase 3 · componentes

Requieren T-004 aprobado, T-005, T-006a, T-007. Zona: `apps/movil/src/componentes/`, raíz: no. Cada componente: archivo, prueba de render y entrada en la vitrina, como commits separados.

### T-030 · vitrina
- depende de: T-005 · estado: libre
- hacer: ruta `/vitrina` (solo en desarrollo) que lista componentes con sus variantes en ambos temas.
- commits: `feat: vitrina de componentes en desarrollo`

### T-031 · Icono, Etiqueta, Tarjeta
- depende de: T-030 · raíz: sí (agrega lucide-react-native) · estado: libre
- commits: `chore: agregar lucide` · `feat: componente icono` · `feat: componente etiqueta` · `feat: componente tarjeta`

### T-032 · Boton y Chip
- depende de: T-031 · estado: libre
- hacer: variantes y estado cargando de `02-diseno.md`; háptica ligera.
- commits: `feat: boton principal y secundario` · `feat: boton pildora con flecha` · `feat: estado cargando del boton` · `feat: componente chip`

### T-033 · BarraPestanas y Hoja
- depende de: T-031 · raíz: sí (expo-blur) · estado: libre
- hacer: barra flotante de cristal con 4 pestañas; hoja inferior con asa y gesto de cierre.
- commits: `feat: barra de pestanas de cristal` · `feat: hoja inferior arrastrable`

### T-034 · estados vacíos, error y carga
- depende de: T-032 · estado: libre
- commits: `feat: estado vacio` · `feat: estado de error con reintento` · `feat: esqueleto de carga`

### T-035 · TableroSalidas
- depende de: T-031 · estado: libre
- hacer: fila de tablero y lista; split-flap por carácter con Reanimated; respeta reducir movimiento.
- hecho cuando: en la vitrina, un botón cambia la hora y el estado y la fila gira solo en los caracteres que cambian.
- commits: `feat: fila del tablero de salidas` · `feat: animacion split-flap por caracter` · `feat: tablero sin animacion con reducir movimiento`

### T-036 · MapaAsientos
- depende de: T-031, T-011 · estado: libre
- hacer: dibuja cualquier configuración del dominio con SVG; estados libre, elegido, retenido, vendido según `02-diseno.md`; accesible (cada asiento es un botón con etiqueta "asiento 12, ventana, libre").
- commits: `feat: plano del bus desde la configuracion` · `feat: estados visuales de asiento` · `feat: seleccion y accesibilidad del mapa de asientos`

### T-037 · Talon
- depende de: T-031 · raíz: sí (QR, expo-brightness) · estado: libre
- hacer: boleto con muescas y perforación en SVG; talón que se arrastra para mostrar código y QR; brillo al máximo mientras se ve.
- commits: `feat: forma del boleto con muescas` · `feat: contenido del boleto` · `feat: talon arrastrable con codigo y qr` · `feat: subir brillo al mostrar el codigo`

### T-038 · LineaRuta
- depende de: T-031 · estado: libre
- commits: `feat: linea de ruta con paradas` · `feat: bus en vivo sobre la linea`

### T-039 · CampoLugar, TarjetaChofer, Estrellas
- depende de: T-032 · estado: libre
- commits: `feat: campo de lugar con autocompletado` · `feat: intercambiar origen y destino` · `feat: tarjeta del chofer` · `feat: control de estrellas accesible`

## fase 4 · pantallas

Zona: `apps/movil/app/` y `apps/movil/src/pantallas/`. Raíz: no, salvo que se indique. Cada pantalla: primero la estructura con datos del hook, después estados vacío/error/carga, después detalles de interacción, como commits separados.

### T-040 · navegación base
- depende de: T-033, T-024 · estado: libre
- hacer: grupo `(pestanas)` con Viajar, Horarios, Rutas, Boletos; acceso a Cuenta arriba a la derecha.
- commits: `feat: navegacion por pestanas`

### T-041 · Viajar (inicio)
- depende de: T-040, T-039, T-025 · estado: libre
- commits: `feat: titular y buscador de inicio` · `feat: selector de fecha y pasajeros` · `feat: tus rutas con proxima salida`

### T-042 · resultados
- depende de: T-041, T-034 · estado: libre
- commits: `feat: lista de salidas` · `feat: filtros de resultados` · `feat: estados de resultados vacios y error`

### T-043 · detalle del viaje
- depende de: T-042, T-038, T-039 · estado: libre
- hacer: hora, duración, bus y comodidades, chofer, línea de ruta, precio, botón "Elegí tu asiento".
- commits: `feat: detalle del viaje` · `feat: chofer y bus en el detalle`

### T-044 · elegí tu asiento
- depende de: T-043, T-036 · estado: libre
- hacer: mapa, retención al confirmar, cuenta regresiva de 10 min; al vencer, aviso y vuelta al mapa.
- commits: `feat: pantalla de seleccion de asientos` · `feat: retener asientos elegidos` · `feat: cuenta regresiva y vencimiento de retencion`

### T-045 · pasajeros
- depende de: T-044 · estado: libre
- hacer: formulario por asiento con Zod, pasajeros guardados, menor en brazos.
- commits: `feat: formulario de pasajeros` · `feat: reusar pasajeros guardados`

### T-046 · pago y confirmación
- depende de: T-045 · estado: libre
- hacer: resumen, pago simulado, error de rechazo con causa, éxito con háptica y paso a "Tu boleto".
- commits: `feat: resumen de compra` · `feat: pago con proveedor simulado` · `feat: pantalla de compra lista`

### T-047 · Boletos y Tu boleto
- depende de: T-046, T-037 · estado: libre
- hacer: lista de próximos y pasados desde el store offline; detalle con `Talon`, cuenta regresiva, agregar al calendario.
- commits: `feat: lista de mis boletos` · `feat: detalle del boleto con talon` · `feat: agregar viaje al calendario`

### T-048 · cancelar y cambiar
- depende de: T-047, T-016 · estado: libre
- commits: `feat: cancelar boleto con reembolso` · `feat: cambiar a otra salida`

### T-049 · Horarios (tablero)
- depende de: T-040, T-035 · estado: libre
- hacer: selector de terminal (la más cercana si hay permiso), tablero a pantalla completa que se refresca cada 30 s, horario completo por ruta.
- commits: `feat: tablero de salidas por terminal` · `feat: refresco del tablero` · `feat: horario del dia por ruta` · `feat: terminal mas cercana con permiso de ubicacion`

### T-050 · Rutas (mapa)
- depende de: T-040, T-038 · raíz: sí (MapLibre) · estado: libre
- hacer: mapa con estilo oscuro propio, rutas y terminales; tocar ruta abre `Hoja` con `LineaRuta`; pantalla `ruta/[id]`.
- commits: `chore: agregar maplibre` · `feat: estilo oscuro del mapa` · `feat: rutas y terminales en el mapa` · `feat: detalle de ruta`

### T-051 · seguir el bus
- depende de: T-050, T-047 · estado: libre
- commits: `feat: bus en vivo en el mapa` · `feat: llegada estimada por parada`

### T-052 · chofer y calificación
- depende de: T-043, T-019 · estado: libre
- commits: `feat: perfil del chofer` · `feat: calificar el viaje`

### T-053 · cuenta
- depende de: T-040 · estado: libre
- hacer: acceso por teléfono (en memoria: código fijo `000000`), perfil, pasajeros guardados, tema, cerrar sesión. Compra requiere cuenta; buscar y ver horarios no.
- commits: `feat: acceso por telefono` · `feat: perfil y pasajeros guardados` · `feat: preferencia de tema`

### T-054 · ayuda y avisos
- depende de: T-040 · estado: libre
- commits: `feat: preguntas frecuentes y equipaje` · `feat: reportar un problema del viaje` · `feat: lista de avisos`

### T-055 · bienvenida
- depende de: T-041 · estado: libre
- hacer: 3 pantallas cortas la primera vez (buscar, asiento, boleto offline), saltables.
- commits: `feat: bienvenida de primera vez`

## fase 5 · backend

Zona: `supabase/` y `packages/datos/src/supabase/`.

### T-060 · esquema
- depende de: T-010 · raíz: no · estado: libre
- commits: un `feat:` por migración (terminales y rutas, buses y choferes, viajes, ocupaciones, boletos, calificaciones, posiciones)

### T-061 · seguridad por filas
- depende de: T-060 · estado: libre
- hecho cuando: pruebas SQL (pgTAP o script) que demuestran que un usuario no ve boletos ajenos ni escribe en `ocupaciones`.
- commits: `feat: politicas rls de lectura publica` · `feat: politicas rls de boletos propios` · `test: pruebas de rls`

### T-062 · funciones de asientos y compra
- depende de: T-061 · estado: libre
- hecho cuando: prueba de concurrencia: 20 retenciones simultáneas del mismo asiento, una sola gana.
- commits: `feat: funcion retener asientos` · `feat: funcion comprar boletos` · `feat: funciones cancelar y cambiar` · `test: concurrencia de retenciones`

### T-063 · semilla SQL
- depende de: T-060, T-021 · estado: libre
- hacer: generar `seed.sql` desde la semilla de `packages/datos` con un script, para no mantener dos semillas.
- commits: `chore: script que genera seed sql` · `feat: semilla sql generada`

### T-064 · repositorio Supabase
- depende de: T-062, T-020 · raíz: sí (supabase-js) · estado: libre
- hecho cuando: la suite de contrato pasa contra Supabase local.
- commits: un `feat:` por repositorio

### T-065 · auth y realtime
- depende de: T-064 · estado: libre
- commits: `feat: acceso por sms con supabase` · `feat: estado del viaje en tiempo real` · `feat: posicion del bus en tiempo real`

### T-066 · pasarela de pago real
- depende de: decisión del dueño del proyecto · estado: **bloqueada**
- hacer: elegir pasarela que opere en Nicaragua e implementar `ProveedorPago`. No empezar sin la decisión escrita aquí.

## fase 6 · calidad y publicación

### T-070 · notificaciones
- depende de: T-047 · raíz: sí (expo-notifications) · estado: libre
- commits: `chore: agregar notificaciones` · `feat: recordatorio antes de la salida` · `feat: avisos de cambio de anden y atraso`

### T-071 · accesibilidad
- depende de: fase 4 · estado: libre
- hacer: script que verifica contraste AA de todos los pares de `colores.ts`; etiquetas de accesibilidad en todas las pantallas; texto dinámico hasta 200 % sin cortes en pantallas clave.
- commits: `test: contraste de pares de color` · un `fix:` por problema encontrado, con la causa

### T-072 · flujos e2e
- depende de: T-046, T-049 · estado: libre
- hacer: Maestro: buscar y comprar, ver boleto en modo avión, cancelar, tablero de salidas.
- commits: un `test:` por flujo

### T-073 · rendimiento
- depende de: fase 4 · estado: libre
- hecho cuando: tablero y mapa de asientos a 60 fps en un Android de gama media (o perfilado documentado), inicio en frío medido y anotado.
- commits: un `fix:` o `refactor:` por mejora, con medición antes y después en el mensaje del cuerpo

### T-074 · ícono y pantalla de arranque
- depende de: T-004 · raíz: sí · estado: libre
- commits: `feat: icono de la app` · `feat: pantalla de arranque`

### T-075 · compilaciones
- depende de: T-074, T-072 · raíz: sí · estado: libre
- hacer: configuración de EAS (o compilación local) para iOS y Android; instrucciones en el README.
- commits: `chore: configurar compilaciones de ios y android`

### T-076 · README con capturas reales
- depende de: T-075 · estado: libre
- hacer: README breve con capturas reales de la app en iOS y Android (no del mockup), cómo correrla, estructura.
- commits: `docs: capturas de la app` · `docs: readme del proyecto`
