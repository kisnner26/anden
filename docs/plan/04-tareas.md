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

### T-009 · servicios del MTI
- depende de: T-010 · zona: `packages/dominio`, `apps/movil/src/textos` · raíz: no · estado: hecha
- hacer: reemplazar `TIPOS_BUS` y el valor `interlocal` por `TIPOS_SERVICIO = ['ordinario', 'expreso', 'taxi-interlocal']` y `TipoServicio`, con su esquema; `Bus.tipo` pasa a `Bus.servicio`; `FiltroBusqueda.tipos` pasa a `servicios`; actualizar T-016 (`servicioActual`/`servicioNuevo`) y los textos visibles ("Interlocal" pasa a "Taxi interlocal"). Marco en `05-marco-mti.md`.
- hecho cuando: `grep -ri interlocal` solo encuentra `taxi-interlocal` y su texto; pruebas, `pnpm verificar` y `expo export` en verde.
- commits: un `refactor:` por tipo, esquema y consumidor, y un `docs:` de cierre.

### T-012b · precio oficial del MTI
- depende de: T-009 · zona: `packages/dominio` · raíz: no · estado: hecha
- hacer: tipo `Tarifa` y `Tarifario = Tarifa[]` con esquema (ver `03-arquitectura.md`) y `precioOficial(tarifario, rutaId, servicio, tramo, pasajeros)` que devuelve `Resultado<{ unitario: number; total: number }, 'sin-tarifa-autorizada' | 'tramo-invalido' | 'sin-pasajeros'>`. Busca la tarifa exacta del tramo y no calcula nada: sin multiplicadores, prorrateo ni redondeo. Retirar de T-012 los multiplicadores, `minutosDelTramo` y `tarifaBase` de `Ruta`, y migrar a `precioOficial` lo que usaba `calcularPrecio`. Los menores en brazos siguen gratis como regla de muestra.
- hecho cuando: pruebas de tarifa exacta de un tramo completo y de uno intermedio, ruta o servicio sin tarifa, tramo inválido, menores en brazos y sin pasajeros; `rg -i multiplicador packages` sin resultados.
- commits: un `feat:` por tipo, esquema y función, un `refactor:` por cada consumidor migrado y un `docs:` de cierre.

### T-004b · dirección visual v2
- depende de: T-004 · zona: `mockups/` · raíz: no · estado: hecha
- hacer: el dueño pidió una interfaz más visual y menos genérica, con la referencia de una app de mascotas (portada con nombre gigante detrás del personaje, bloques blandos, bloque negro con el personaje saliéndose, barra con píldora negra). `mockups/identidad-v2.html` propone un claro cálido con bloques tipo arcilla, un bus de personaje ilustrado y el tablero dentro de un bloque negro; `mockups/icono.html` es el ícono.
- hecho cuando: el dueño lo aprueba. Si lo aprueba, `02-diseno.md` se reescribe para esta dirección antes de construir nada más de interfaz (T-005 a T-007 y la fase 3 se reajustan). **Hasta entonces nadie construye componentes nuevos ni pantallas.**
- commits: `feat: mockup v2 con bloques blandos y bus de personaje` · `feat: ícono de la app con el bus de personaje` · `docs: capturas v2`

## reajuste a la dirección visual v2

La v2 está aprobada y escrita en `02-diseno.md`. Estas tareas llevan lo ya construido a esa dirección. Toda tarea de componentes (T-033 a T-039) y de pantallas (T-040 en adelante) depende además de T-005b y T-031b.

### T-005b · tema v2
- depende de: T-004b · zona: `apps/movil/src/tema/` · raíz: no · estado: hecha
- hacer: `colores.ts` con la paleta clara y oscura de `02-diseno.md` (claves nuevas `fondoProfundo`, `barroClaro`, `barroOscuro`, `bloqueNegro`, `ambarProfundo`, `ambarTexto`, `ambarTitular` y las del relieve), manteniendo la prueba de paridad entre modos y la de hexadecimales; `useTema` con modo automático (oscuro de 18:00 a 06:00, claro el resto) y preferencia guardada; sombras de relieve en `tema/`; ajustar los consumidores existentes (vitrina, etiqueta, tarjeta, botón, chip).
- hecho cuando: `pnpm verificar` en verde, la vitrina muestra la paleta nueva en ambos modos y los pares de texto declarados en `02-diseno.md` cumplen AA en una prueba.
- commits: un `feat:` por grupo de tokens, un `test:` por caso, un `refactor:` por consumidor ajustado.

### T-031b · Autobus, Bloque, BloqueNegro y Loseta
- depende de: T-005b · zona: `apps/movil/src/componentes/` · raíz: no · estado: hecha
- hacer: `Autobus` (símbolo `bus` del mockup con `react-native-svg`, letrero configurable), `Bloque` (con variante hundido), `BloqueNegro` y `Loseta`, todos con relieve del tema, accesibles y con su prueba y su entrada en la vitrina. Prohibido usar librerías de íconos.
- hecho cuando: la vitrina los muestra y se parecen a `mockups/capturas/v2/`.
- commits: un `feat:` por componente y por estado, un `test:` por caso.

### T-032b · botones y chips v2
- depende de: T-031b · zona: `apps/movil/src/componentes/Boton`, `Chip` · raíz: no · estado: hecha
- hacer: llevar `Boton` y `Chip` a la v2: principal ámbar en píldora con círculo negro y flecha, secundario de barro, chip activo negro; conservar estados, háptica y pruebas.
- hecho cuando: `pnpm verificar` en verde y la vitrina muestra los controles como en las capturas v2.
- commits: un `refactor:` por componente y variante.

### T-074b · ícono y arranque v2
- depende de: T-031b · zona: `apps/movil/assets`, `apps/movil/app.json` · raíz: sí · estado: hecha
- hacer: reemplazar el ícono "boleto-bus" de T-074 por `mockups/capturas/v2/icono.png` (bus de personaje sobre fondo oscuro con brillo ámbar) y regenerar el adaptativo, el monocromo y el de la pantalla de arranque; la pantalla de arranque pasa a ser la portada ("ANDÉN" y el bus). Mantener las pruebas de dimensiones y transparencia.
- hecho cuando: `expo prebuild` y las exportaciones de Android e iOS pasan, y el ícono nuevo se ve en el teléfono.
- commits: un `feat:` por activo y un `test:` por validación.

## flujos de reserva y consulta

Pedidos por el dueño tras probar la app en su iPhone (2 de noviembre de 2026): pagar en efectivo, ver horarios, choferes con su información, unidades con su placa y una interfaz más pulida. Se hacen sobre datos de muestra, detrás de los mismos hooks que usará T-024.

### T-080 · apariencia y arreglos visuales
- depende de: T-031b · zona: `apps/movil/src/tema`, `apps/movil/src/componentes` · raíz: no · estado: hecha
- hacer: tema claro por defecto con selector automático, claro y oscuro persistente y compartido por toda la app (proveedor de tema); arreglar lo visto en el teléfono: bloques hundidos en oscuro, la palabra PUERTA partida, el botón de acción con el círculo sobre el texto y las muestras de la leyenda.
- hecho cuando: `pnpm verificar` en verde y las capturas de la v2 coinciden en claro y en oscuro.

### T-081 · choferes, placas y calificaciones
- depende de: T-010 · zona: `packages/dominio`, `apps/movil/src/datos` · raíz: no · estado: hecha
- hacer: `promedioChofer(calificaciones)` y `puedeCalificar` del dominio (T-019), datos de muestra con una placa por unidad, choferes con su cooperativa y calificaciones, y hooks para leerlos.
- hecho cuando: pruebas del promedio con el mínimo de 5 calificaciones y las últimas 200.

### T-082 · detalle del viaje y perfil del chofer
- depende de: T-081 · zona: `apps/movil/src/pantallas`, `apps/movil/app` · raíz: no · estado: hecha
- hacer: detalle del viaje (hora, duración, servicio, unidad con su placa y cooperativa, chofer, paradas, tarifa de muestra y "Elegir asiento") y perfil del chofer (iniciales en un avatar propio, años manejando, viajes, licencia verificada, unidad, calificación y etiquetas).
- hecho cuando: se llega desde la fila de salida y desde el tablero, y ambas pantallas tienen sus pruebas.

### T-083 · reservar con pago en efectivo
- depende de: T-082, T-017 · zona: `apps/movil/src/pantallas`, `apps/movil/src/datos`, `apps/movil/app` · raíz: sí (agrega un generador de QR) · estado: hecha
- hacer: pasajeros por asiento (nombre y si es menor en brazos), elección de pago con "Efectivo al abordar" activo y "Tarjeta o transferencia" marcado como próximamente, confirmación con el código del boleto y el QR, y el boleto guardado en el teléfono. El efectivo se paga al subir y por el monto exacto de la tarifa oficial (`05-marco-mti.md`). La reserva no cobra nada ni calcula precios en pantalla.
- hecho cuando: de elegir asiento a ver el boleto con código y QR sin conexión, con pruebas del flujo.

### T-084 · Mis boletos y Tu boleto
- depende de: T-083 · zona: `apps/movil/src/pantallas`, `apps/movil/app` · raíz: no · estado: hecha
- hacer: lista de boletos guardados (próximos y pasados), boleto con talón, cuenta regresiva a la salida y cancelar la reserva.
- hecho cuando: un boleto reservado aparece en la pestaña Boletos al reabrir la app.

### T-085 · Rutas y buscar destino
- depende de: T-082 · zona: `apps/movil/src/pantallas`, `apps/movil/app` · raíz: no · estado: hecha
- hacer: pestaña Rutas con las rutas de la terminal (kilómetros, duración, servicios y tarifa de muestra), detalle de ruta con sus paradas y salidas, y buscar destino desde el inicio con resultados.
- hecho cuando: se puede ir del inicio a un destino y a sus salidas.

## fase 1 · dominio (TypeScript puro)

Todas en `packages/dominio`, raíz: no. Cada regla viene con sus pruebas en el mismo commit (las reglas están en `01-producto.md`).

### T-086 · perfil y configuración del usuario
- depende de: T-085 · zona: `apps/movil`, `packages/dominio` · raíz: sí (dependencias nativas) · estado: hecha
- hacer: validación del teléfono de Nicaragua en el dominio; perfil con foto de la galería, nombre, apellido, teléfono, correo y cédula opcionales, guardado en el teléfono; pasajeros guardados; el nombre y teléfono precargan Pasajeros.
- hecho cuando: se edita y guarda el perfil, se ve el avatar y la compra lo reusa.

### T-087 · notificaciones locales y campanita
- depende de: T-086 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: centro de avisos con leído y no leído, interruptor con permiso pedido al activar, recordatorio 30 minutos antes de la salida, avisos de andén y atraso, punto de la campana.
- hecho cuando: con permiso se programa el recordatorio y sin permiso la campana lo explica.

### T-088 · buscador de Horarios
- depende de: T-085 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: la lupa abre un buscador con recientes y rutas frecuentes que filtra por destino, servicio, franja y placa en vivo.
- hecho cuando: escribir filtra las salidas y no hay resultados con la mascota.

### T-089 · origen por ubicación
- depende de: T-088 · zona: `apps/movil`, `packages/dominio` · raíz: no · estado: hecha
- hacer: terminal más cercana como función pura del dominio; control en Viajar que pide la ubicación en primer plano, propone el origen y deja elegir a mano; nunca guarda ni envía la ubicación.
- hecho cuando: con permiso se propone la terminal cercana y sin permiso se elige a mano.

### T-090 · Rutas rediseñada
- depende de: T-089 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: mapa esquemático con react-native-svg, filas con datos tipográficos y sellos, detalle de ruta con paradas, tiempos, tarifas de muestra y salidas del día.
- hecho cuando: se toca un destino del mapa y se abre su detalle.

### T-091 · boletos mejorados
- depende de: T-086 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: próximos y pasados, boleto próximo destacado, Tu boleto con chofer, compartir, cancelar y cambiar con reglas de muestra, estados vacío, vencido, cancelado y usado.
- hecho cuando: se ve y se opera el ciclo del boleto.

### T-092 · animación al abordar
- depende de: T-091 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: el talón se separa y un sello ámbar "abordado" se estampa con háptica; sin movimiento con reducir movimiento; validación de prueba rotulada.
- hecho cuando: validar el boleto de muestra pasa a usado con la animación.

### T-093 · pulido de ubicación, rutas, boletos y abordaje
- depende de: T-089, T-090, T-091, T-092 · zona: `apps/movil` · raíz: no · estado: hecha
- hacer: auditar y pulir los flujos de ubicación, rutas, boletos y abordaje contra el diseño v2, incluyendo estados, accesibilidad, movimiento y vitrina.
- hecho cuando: los flujos son coherentes con el diseño v2, respetan reducir movimiento y pasan pruebas, verificación y exportaciones móviles.
- auditoría 2026-11-03: el detalle de ruta es una pantalla plana, tiene textos y medidas fuera de sus catálogos; el mapa no expresa una ruta seleccionada ni garantiza áreas táctiles; los controles de origen no diferencian permiso denegado de origen confirmado; el boleto separa sus acciones sin jerarquía visual, sus estados no se integran al talón y varias zonas táctiles, tamaños y espaciados quedan fuera de tema; Perfil, Avisos, Buscador y Horarios repiten esas medidas y carecen de estados de carga o foco anunciados de forma consistente.

### T-094 · restaurar CampoLugar
- depende de: T-032 · zona: `apps/movil/src/componentes/` · raíz: no · estado: hecha
- hacer: implementar el componente `CampoLugar` que t-039 declara hecha pero no existe en el código, con selección accesible de terminal, prueba y vitrina.
- hecho cuando: Viajar puede usarlo sin valores visibles fuera del catálogo ni medidas fuera de tema.

### T-095 · validaciones y errores de formularios
- depende de: T-086 · zona: `packages/dominio`, `apps/movil/src/componentes`, `apps/movil/src/pantallas` · raíz: no · estado: hecha
- hacer: auditar acceso, perfil y pasajeros; validar en dominio nombre, teléfono nicaragüense, correo y cédula opcionales; mostrar errores junto al campo, conservar los datos al fallar y anunciar el primer error.
- hecho cuando: ningún formulario acepta valores inválidos ni falla en silencio y las pruebas cubren vacío, formato, límites, corrección y envío válido.

### T-096 · recuperar backend y cuenta real
- depende de: T-095 · zona: `supabase/`, `packages/datos/src/supabase`, `apps/movil/src/datos` · raíz: sí · estado: libre
- hacer: implementar realmente T-060 a T-065: migraciones, RLS, funciones transaccionales, repositorio Supabase y sesión por teléfono; el modo local queda como adaptador de desarrollo explícito, no como falsa cuenta.
- hecho cuando: Supabase local levanta desde cero, el contrato pasa contra él, dos cuentas no ven datos ajenos y la sesión persiste tras reiniciar la app.

### T-097 · gps robusto y privacidad
- depende de: T-095 · zona: `apps/movil/src/datos`, `apps/movil/src/pantallas`, `packages/dominio` · raíz: no · estado: libre
- hacer: distinguir permiso pendiente, denegado, ubicación desactivada, espera, éxito y error; permitir reintentar y elegir terminal manualmente; nunca guardar ni enviar la ubicación de la persona.
- hecho cuando: cada estado tiene texto y acción accesible, la terminal cercana se calcula en dominio y las pruebas simulan todos los resultados del proveedor.

### T-098 · seguimiento operativo y eta
- depende de: T-096, T-097 · zona: `packages/dominio`, `packages/datos`, `apps/movil` · raíz: no · estado: libre
- hacer: consumir posiciones autorizadas de cada unidad por viaje, mostrar última actualización, rumbo y estado de señal, dibujar el avance por la ruta y calcular eta por parada en dominio; nunca inventar movimiento cuando la señal esté vieja.
- hecho cuando: actualizaciones realtime mueven la unidad sin recargar, el eta se corrige con atraso y progreso, y existen estados sin señal, señal vieja, viaje finalizado y reconexión.

### T-099 · corredor interlocal y Rutas rediseñada
- depende de: T-090 · zona: `packages/datos`, `apps/movil/src/pantallas`, `apps/movil/src/componentes` · raíz: no · estado: hecha
- hacer: limitar la muestra visible al corredor Boaco/Juigalpa–Managua y rehacer Rutas sin el gráfico radial: dos recorridos claros, dirección, próxima unidad, estado y eta de muestra; detalle accesible y estados sin servicio.
- hecho cuando: no aparecen destinos fuera del corredor, cada elemento visual tiene significado rotulado y las capturas en iphone coinciden con la dirección v2.

### T-100 · ubicación automática en configuración
- depende de: T-097 · zona: `apps/movil/src/pantallas`, `apps/movil/src/datos` · raíz: no · estado: libre
- hacer: quitar el botón permanente de Viajar y agregar una preferencia persistente en configuración; al activarla se pide permiso y Viajar propone el origen automáticamente, con estado, desactivar y reintentar en configuración.
- hecho cuando: Viajar no muestra el botón, la preferencia sobrevive al reinicio y nunca guarda ni envía coordenadas.

### T-101 · cierre directo de reserva
- depende de: T-046, T-047 · zona: `apps/movil/app`, `apps/movil/src/pantallas` · raíz: no · estado: libre
- hacer: al confirmar, mostrar éxito breve con código y llevar a la navegación principal con Boletos activo; evitar apilar pantallas que obliguen a volver repetidamente.
- hecho cuando: una reserva confirmada aparece en Boletos, Atrás no devuelve al pago y existe acción directa para volver a Viajar.

### T-102 · respuesta sensorial opcional
- depende de: T-099, T-100, T-101 · zona: `apps/movil/src/tema`, `apps/movil/src/datos`, `apps/movil/src/componentes` · raíz: sí · estado: libre
- hacer: animaciones breves por transform y opacidad, háptica y sonidos propios cortos para confirmación, llegada de unidad y error; interruptores de sonido y háptica en configuración.
- hecho cuando: reducir movimiento elimina desplazamientos, el modo silencio no se ignora, el sonido puede apagarse y no hay animaciones continuas fuera de pantalla.

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
- reemplazada por: T-012b; no usar `calcularPrecio` ni conservar cálculos propios
- hacer: tipo `Tramo = { desde: number; hasta: number }` con su esquema (índices de `ruta.paradas`, `desde < hasta`, dentro de rango), `minutosDelTramo(ruta, tramo)` y `calcularPrecio(ruta, tramo, tipoBus, pasajeros)` que devuelve `Resultado<{ unitario: number; total: number }, 'tramo-invalido' | 'sin-pasajeros'>`. `pasajeros` es `Pasajero[]`: los menores en brazos no pagan y si no queda ninguno que pague es `sin-pasajeros`. La regla de prorrateo está en `01-producto.md`.
- hecho cuando: pruebas de multiplicadores, redondeo hacia arriba una sola vez, menores en brazos gratis, tramo completo igual a `tarifaBase`, tramo parcial por minutos y los dos errores.
- commits: `feat: calcular precio por tramo y tipo de bus`

### T-013 · disponibilidad y retención
- depende de: T-011, T-014 · estado: hecha
- hacer: tipo `Ocupacion` con su esquema (ver `03-arquitectura.md`; el esquema exige `expira` si está retenido y `boletoId` si está vendido); `estadoAsientos(config, ocupaciones, ahora)` que devuelve `{ numero, estado: 'libre' | 'retenido' | 'vendido', duenoId? }[]` y trata la retención vencida como libre; y `puedeRetener(viaje, config, ocupaciones, asientos, duenoId, ahora)` que devuelve `Resultado<void, 'sin-asientos' | 'maximo-6' | 'asiento-inexistente' | 'asiento-ocupado' | 'venta-cerrada'>`. Un asiento retenido por el mismo dueño se puede volver a retener (renueva); uno de otro dueño o vendido, no. Usa `ventaAbierta` de T-014.
- hecho cuando: pruebas de choque (dos dueños, mismo asiento), renovación por el mismo dueño, retención vencida, más de 6, asiento inexistente, viaje cancelado y venta cerrada.
- commits: `feat: estado de asientos con retenciones vencidas` · `feat: validar retencion de asientos`

### T-014 · horarios y estado del viaje
- depende de: T-010 · estado: hecha
- hacer: `estadoViaje(viaje, ruta, ahora)` (programado, abordando, en ruta, llegó, atrasado, cancelado; recibe la ruta porque la llegada depende de su duración), `llegadaEstimada(viaje, ruta, parada)` y `ventaAbierta(viaje, ahora)`. Las reglas y su orden de precedencia están en `01-producto.md`.
- hecho cuando: pruebas en los bordes exactos (20 min, 15 min, salida real con atraso, llegada) y de la precedencia (un viaje cancelado nunca aparece como en ruta ni con la venta abierta).
- commits: `feat: estado del viaje segun la hora` · `feat: llegada estimada por parada` · `feat: cierre de venta`

### T-015 · búsqueda
- depende de: T-012b, T-014 · estado: hecha
- aviso: un expreso solo coincide entre su primera y su última parada (terminal de salida y de destino), nunca por una parada intermedia; el ordinario sí. El precio sale de `precioOficial`, no de `calcularPrecio`.
- hacer: tipos con su esquema `FranjaHoraria` (`madrugada`, `manana`, `tarde`, `noche`), `FiltroBusqueda` `{ origenId, destinoId, fecha (AAAA-MM-DD), pasajeros, tipos?: TipoBus[], franja?: FranjaHoraria }`, `DatosViajes` `{ terminales, rutas, buses, choferes, viajes, ocupaciones }` (listas simples, sin red) y `ResultadoViaje` `{ viaje, ruta, bus, chofer, tramo, salidaOrigen (ISO), llegadaDestino (ISO), precioUnitario, asientosLibres, ventaAbierta, estado }`; y `buscarViajes(filtro, datos, ahora): ResultadoViaje[]`.
- reglas: un viaje coincide si su ruta tiene paradas de terminal con `origenId` antes de `destinoId`; el `tramo` son los índices de esas paradas. `salidaOrigen` y `llegadaDestino` se calculan con los `minutosDesdeOrigen` de esas paradas sobre la salida programada del viaje. La fecha y la franja se toman de `salidaOrigen` en hora de Managua. Se excluyen los viajes cancelados, los que ya salieron del origen (salida programada más atraso anterior a `ahora`) y los que no tienen `asientosLibres` para los pasajeros pedidos (usa `estadoAsientos` con las ocupaciones de ese viaje). Un viaje con la venta cerrada sí aparece, con `ventaAbierta: false`. El precio sale de `calcularPrecio` para un pasajero que paga. Orden: por `salidaOrigen`, y a igual hora por precio. La calificación del chofer se suma en T-022 cuando exista T-019.
- hecho cuando: pruebas con una semilla pequeña de 3 rutas que cubran parada intermedia, fecha y franja, tipo de bus, falta de asientos, viaje cancelado, viaje ya salido y venta cerrada.
- commits: `feat: buscar viajes por origen y destino` · `feat: filtros de tipo y franja horaria`

### T-016 · cancelación y cambio
- depende de: T-014 · estado: hecha
- hacer: campo `cambioUsado: boolean` en `Boleto` (tipo, esquema y pruebas que lo construyen); `politicaCancelacion(boleto, viaje, ahora)` que devuelve `Resultado<{ porcentaje: 0 | 50 | 100; monto: number }, 'boleto-no-vigente'>`; y `puedeCambiar({ boleto, viajeActual, viajeNuevo, tipoBusActual, tipoBusNuevo, ahora })` que devuelve `Resultado<void, 'boleto-no-vigente' | 'cambio-ya-usado' | 'mismo-viaje' | 'otra-ruta' | 'distinto-tipo-de-bus' | 'muy-cerca-de-la-salida' | 'viaje-nuevo-no-disponible'>`. Las reglas exactas están en `01-producto.md`; `viaje-nuevo-no-disponible` cubre el viaje cancelado y la venta cerrada (usa `ventaAbierta` de T-014).
- hecho cuando: pruebas en 24 h y 2 h exactas, justo bajo 2 h, redondeo hacia abajo del monto, boleto no vigente, y cada error de `puedeCambiar` más el caso feliz.
- commits: `feat: reembolso segun anticipacion` · `feat: regla de cambio de salida`

### T-017 · código de boleto
- depende de: T-010 · estado: hecha
- hacer: `generarCodigo(aleatorio)` y `codigoValido(codigo)` con alfabeto sin ambiguos y dígito de control.
- hecho cuando: pruebas de validez, un carácter alterado falla, generador inyectable para pruebas deterministas.
- commits: `feat: codigo de boleto con digito de control`

### T-018 · formato es-NI
- depende de: T-010 · estado: hecha
- hacer: `formatoCordobas(n)`, `formatoHora(fecha)` (12 h, "a. m."), `formatoDuracion(min)`, `formatoFechaCorta`, `enmascararCedula`.
- hecho cuando: pruebas con zona horaria `America/Managua` fija.
- commits: `feat: formato de moneda y horas` · `feat: enmascarar cedula`

### T-019 · calificaciones
- depende de: T-010 · estado: hecha
- hacer: `promedioChofer(calificaciones)` (últimas 200, un decimal, nulo con menos de 5) y `puedeCalificar(boleto, existentes)`.
- hecho cuando: pruebas de límites.
- commits: `feat: promedio de calificaciones del chofer`

## fase 2 · datos

Todas en `packages/datos` salvo T-024 y T-025.

### T-020 · contrato
- depende de: T-010 · raíz: no · estado: hecha
- hacer: interfaces de `03-arquitectura.md` en `contrato.ts` y suite de pruebas de contrato reutilizable `probarContrato(crear)`.
- hecho cuando: la suite compila y se puede llamar con cualquier implementación.
- commits: `feat: contrato de repositorios` · `test: suite de contrato reutilizable`

### T-021 · semilla de Nicaragua
- depende de: T-009, T-012b · raíz: no · estado: hecha
- aviso: las tarifas de la semilla son de muestra y tienen que cargarse como un `Tarifario` (`Tarifa[]`), con `resolucion: 'muestra'`; los expresos solo de terminal a terminal; ningún precio se presenta como oficial hasta cumplir T-077.
- hacer: terminales, rutas con paradas, buses, choferes (nombres inventados, sin fotos reales), viajes generados para 14 días desde una fecha base. Validados con los esquemas Zod. Rotular `// datos de muestra`.
- hecho cuando: prueba que toda la semilla pasa los esquemas y que cada ruta tiene al menos 6 salidas diarias.
- commits: `feat: terminales y rutas de muestra` · `feat: buses y choferes de muestra` · `feat: generador de salidas de muestra`

### T-022 · repositorio en memoria
- depende de: T-020, T-021, T-013, T-015, T-016, T-017 · raíz: no · estado: hecha
- hacer: implementación en memoria de todos los repositorios usando las reglas del dominio; latencia simulada configurable (por defecto 250 ms); simulador de posición del bus.
- hecho cuando: pasa la suite de contrato completa.
- commits: un `feat:` por repositorio (terminales, rutas, viajes, asientos, boletos, choferes, calificaciones, posiciones) · `feat: simulador de posicion del bus`

### T-023 · pago simulado
- depende de: T-020 · raíz: no · estado: hecha
- hacer: `PagoSimulado` según `03-arquitectura.md`.
- hecho cuando: pruebas de aprobado, rechazado con la tarjeta de prueba y referencia duplicada.
- commits: `feat: proveedor de pago simulado`

### T-024 · proveedor y hooks en la app
- depende de: T-022, T-023, T-000 · zona: `apps/movil/src/datos/` · raíz: sí (agrega TanStack Query) · estado: hecha
- hacer: `proveedor.ts` que elige implementación por `EXPO_PUBLIC_DATOS`; `QueryClient` con persistencia; hooks `useBuscarViajes`, `useViaje`, `useSalidas`, `useMapaAsientos`, `useRetener`, `useComprar`, `useMisBoletos`, `useChofer`, `useRutas`, `usePosicionBus`.
- hecho cuando: prueba de cada hook contra el repositorio en memoria.
- commits: `chore: agregar tanstack query` · `feat: proveedor de datos por entorno` · un `feat:` por grupo de hooks

### T-025 · almacenamiento offline
- depende de: T-024 · zona: `apps/movil/src/estado/` · raíz: sí (agrega MMKV y Zustand) · estado: hecha
- hacer: store de boletos persistido en MMKV, store de rutas frecuentes y recientes, store del flujo de compra (viaje, asientos, retención, pasajeros) que se limpia al terminar o vencer.
- hecho cuando: pruebas de persistencia y de limpieza al vencer la retención.
- commits: `chore: agregar mmkv y zustand` · `feat: boletos guardados sin conexion` · `feat: rutas frecuentes y recientes` · `feat: estado del flujo de compra`

## fase 3 · componentes

Requieren T-004 aprobado, T-005, T-006a, T-007. Zona: `apps/movil/src/componentes/`, raíz: no. Cada componente: archivo, prueba de render y entrada en la vitrina, como commits separados.

### T-030 · vitrina
- depende de: T-005 · estado: hecha
- hacer: ruta `/vitrina` (solo en desarrollo) que lista componentes con sus variantes en ambos temas.
- commits: `feat: vitrina de componentes en desarrollo`

### T-031 · Icono, Etiqueta, Tarjeta
- depende de: T-030 · raíz: sí (agrega `react-native-svg`) · estado: hecha
- aviso: nada de `lucide-react-native` ni de otra librería de íconos; el dueño la rechazó por genérica. Si la rama ya tiene lucide, retirarlo en su propio commit `chore:` y rehacer `Icono` con los símbolos ilustrados del mockup v2 (`mockups/identidad-v2.html`, bloque `<defs>`).
- commits: `chore: agregar react-native-svg` · `feat: símbolos de íconos ilustrados` · `feat: componente icono` · `feat: componente etiqueta` · `feat: componente tarjeta`

### T-032 · Boton y Chip
- depende de: T-031 · estado: hecha
- hacer: variantes y estado cargando de `02-diseno.md`; háptica ligera.
- commits: `feat: boton principal y secundario` · `feat: boton pildora con flecha` · `feat: estado cargando del boton` · `feat: componente chip`

### T-033 · BarraPestanas y Hoja
- depende de: T-031 · raíz: sí (expo-blur) · estado: hecha
- avance: `BarraPestanas` hecha con relieve y píldora activa; la `Hoja` inferior usa cristal cálido, cierre táctil y por arrastre, y está disponible en la vitrina. las medidas de la barra viven en tema.
- hacer: barra flotante de cristal con 4 pestañas; hoja inferior con asa y gesto de cierre.
- commits: `feat: barra de pestanas de cristal` · `feat: hoja inferior arrastrable`

### T-034 · estados vacíos, error y carga
- depende de: T-032 · estado: hecha
- commits: `feat: estado vacio` · `feat: estado de error con reintento` · `feat: esqueleto de carga`

### T-035 · TableroSalidas
- depende de: T-031 · estado: hecha
- avance: `TableroSalidas` con fichas, andén y estados con forma; cada ficha cae en su lugar al cambiar su carácter y no se anima con reducir movimiento; la vitrina tiene un botón que cambia hora y estado. No se vio en un teléfono.
- hacer: fila de tablero y lista; split-flap por carácter con Reanimated; respeta reducir movimiento.
- hecho cuando: en la vitrina, un botón cambia la hora y el estado y la fila gira solo en los caracteres que cambian.
- commits: `feat: fila del tablero de salidas` · `feat: animacion split-flap por caracter` · `feat: tablero sin animacion con reducir movimiento`

### T-036 · MapaAsientos
- depende de: T-031, T-011 · estado: hecha
- hacer: dibuja cualquier configuración del dominio con SVG; estados libre, elegido, retenido, vendido según `02-diseno.md`; accesible (cada asiento es un botón con etiqueta "asiento 12, ventana, libre").
- commits: `feat: plano del bus desde la configuracion` · `feat: estados visuales de asiento` · `feat: seleccion y accesibilidad del mapa de asientos`

### T-037 · Talon
- depende de: T-031 · raíz: sí (QR, expo-brightness) · estado: hecha
- hacer: boleto con muescas y perforación en SVG; talón que se arrastra para mostrar código y QR; brillo al máximo mientras se ve.
- commits: `feat: forma del boleto con muescas` · `feat: contenido del boleto` · `feat: talon arrastrable con codigo y qr` · `feat: subir brillo al mostrar el codigo`

### T-038 · LineaRuta
- depende de: T-031 · estado: hecha
- commits: `feat: linea de ruta con paradas` · `feat: bus en vivo sobre la linea`

### T-039 · CampoLugar, TarjetaChofer, Estrellas
- depende de: T-032 · estado: hecha
- commits: `feat: campo de lugar con autocompletado` · `feat: intercambiar origen y destino` · `feat: tarjeta del chofer` · `feat: control de estrellas accesible`

## fase 4 · pantallas

Zona: `apps/movil/app/` y `apps/movil/src/pantallas/`. Raíz: no, salvo que se indique. Cada pantalla: primero la estructura con datos del hook, después estados vacío/error/carga, después detalles de interacción, como commits separados.

### T-040 · navegación base
- depende de: T-033, T-024 · estado: hecha
- hacer: grupo `(pestanas)` con Viajar, Horarios, Rutas, Boletos; acceso a Cuenta arriba a la derecha.
- commits: `feat: navegacion por pestanas`

### T-041 · Viajar (inicio)
- depende de: T-040, T-039, T-025 · estado: hecha
- avance: portada y pantalla Viajar con próximo viaje, `CampoLugar`, fecha, pasajeros, rutas frecuentes y salidas de hoy sobre datos de muestra.
- commits: `feat: titular y buscador de inicio` · `feat: selector de fecha y pasajeros` · `feat: tus rutas con proxima salida`

### T-042 · resultados
- depende de: T-041, T-034 · estado: hecha
- commits: `feat: lista de salidas` · `feat: filtros de resultados` · `feat: estados de resultados vacios y error`

### T-043 · detalle del viaje
- depende de: T-042, T-038, T-039 · estado: hecha
- hacer: hora, duración, bus y comodidades, chofer, línea de ruta, precio, botón "Elegí tu asiento".
- commits: `feat: detalle del viaje` · `feat: chofer y bus en el detalle`

### T-044 · elegí tu asiento
- depende de: T-043, T-036 · estado: **parcial**
- avance: pantalla de asientos con el plano real, tope de seis y total con la tarifa de muestra; falta retener de verdad con el contrato de datos.
- hacer: mapa, retención al confirmar, cuenta regresiva de 10 min; al vencer, aviso y vuelta al mapa.
- commits: `feat: pantalla de seleccion de asientos` · `feat: retener asientos elegidos` · `feat: cuenta regresiva y vencimiento de retencion`

### T-045 · pasajeros
- depende de: T-044 · estado: hecha
- hacer: formulario por asiento con Zod, pasajeros guardados, menor en brazos.
- commits: `feat: formulario de pasajeros` · `feat: reusar pasajeros guardados`

### T-046 · pago y confirmación
- depende de: T-045 · estado: hecha
- hacer: resumen, pago simulado, error de rechazo con causa, éxito con háptica y paso a "Tu boleto".
- commits: `feat: resumen de compra` · `feat: pago con proveedor simulado` · `feat: pantalla de compra lista`

### T-047 · Boletos y Tu boleto
- depende de: T-046, T-037 · estado: hecha
- hacer: lista de próximos y pasados desde el store offline; detalle con `Talon`, cuenta regresiva, agregar al calendario.
- commits: `feat: lista de mis boletos` · `feat: detalle del boleto con talon` · `feat: agregar viaje al calendario`

### T-048 · cancelar y cambiar
- depende de: T-047, T-016 · estado: hecha
- commits: `feat: cancelar boleto con reembolso` · `feat: cambiar a otra salida`

### T-049 · Horarios (tablero)
- depende de: T-040, T-035 · estado: **parcial**
- avance: tablero de salidas con filtro por servicio sobre datos de muestra; faltan refresco, terminal más cercana y horario por ruta.
- hacer: selector de terminal (la más cercana si hay permiso), tablero a pantalla completa que se refresca cada 30 s, horario completo por ruta.
- commits: `feat: tablero de salidas por terminal` · `feat: refresco del tablero` · `feat: horario del dia por ruta` · `feat: terminal mas cercana con permiso de ubicacion`

### T-050 · Rutas (mapa)
- depende de: T-040, T-038 · raíz: sí (MapLibre) · estado: hecha
- hacer: mapa con estilo oscuro propio, rutas y terminales; tocar ruta abre `Hoja` con `LineaRuta`; pantalla `ruta/[id]`.
- commits: `chore: agregar maplibre` · `feat: estilo oscuro del mapa` · `feat: rutas y terminales en el mapa` · `feat: detalle de ruta`

### T-051 · seguir el bus
- depende de: T-050, T-047 · estado: hecha
- commits: `feat: bus en vivo en el mapa` · `feat: llegada estimada por parada`

### T-052 · chofer y calificación
- depende de: T-043, T-019 · estado: hecha
- commits: `feat: perfil del chofer` · `feat: calificar el viaje`

### T-053 · cuenta
- depende de: T-040 · estado: hecha
- hacer: acceso por teléfono (en memoria: código fijo `000000`), perfil, pasajeros guardados, tema, cerrar sesión. Compra requiere cuenta; buscar y ver horarios no.
- commits: `feat: acceso por telefono` · `feat: perfil y pasajeros guardados` · `feat: preferencia de tema`

### T-054 · ayuda y avisos
- depende de: T-040 · estado: hecha
- commits: `feat: preguntas frecuentes y equipaje` · `feat: reportar un problema del viaje` · `feat: lista de avisos`

### T-055 · bienvenida
- depende de: T-041 · estado: hecha
- hacer: 3 pantallas cortas la primera vez (buscar, asiento, boleto offline), saltables.
- commits: `feat: bienvenida de primera vez`

## fase 5 · backend

Zona: `supabase/` y `packages/datos/src/supabase/`.

### T-060 · esquema
- depende de: T-010 · raíz: no · estado: hecha
- commits: un `feat:` por migración (terminales y rutas, buses y choferes, viajes, ocupaciones, boletos, calificaciones, posiciones)

### T-061 · seguridad por filas
- depende de: T-060 · estado: hecha
- hecho cuando: pruebas SQL (pgTAP o script) que demuestran que un usuario no ve boletos ajenos ni escribe en `ocupaciones`.
- commits: `feat: politicas rls de lectura publica` · `feat: politicas rls de boletos propios` · `test: pruebas de rls`

### T-062 · funciones de asientos y compra
- depende de: T-061 · estado: hecha
- hecho cuando: prueba de concurrencia: 20 retenciones simultáneas del mismo asiento, una sola gana.
- commits: `feat: funcion retener asientos` · `feat: funcion comprar boletos` · `feat: funciones cancelar y cambiar` · `test: concurrencia de retenciones`

### T-063 · semilla SQL
- depende de: T-060, T-021 · estado: hecha
- hacer: generar `seed.sql` desde la semilla de `packages/datos` con un script, para no mantener dos semillas.
- commits: `chore: script que genera seed sql` · `feat: semilla sql generada`

### T-064 · repositorio Supabase
- depende de: T-062, T-020 · raíz: sí (supabase-js) · estado: hecha
- hecho cuando: la suite de contrato pasa contra Supabase local.
- commits: un `feat:` por repositorio

### T-065 · auth y realtime
- depende de: T-064 · estado: hecha
- commits: `feat: acceso por sms con supabase` · `feat: estado del viaje en tiempo real` · `feat: posicion del bus en tiempo real`

### T-066 · pasarela de pago real
- depende de: decisión del dueño del proyecto · estado: **bloqueada**
- hacer: elegir pasarela que opere en Nicaragua e implementar `ProveedorPago`. No empezar sin la decisión escrita aquí.

## fase 6 · calidad y publicación

### T-070 · notificaciones
- depende de: T-047 · raíz: sí (expo-notifications) · estado: hecha
- commits: `chore: agregar notificaciones` · `feat: recordatorio antes de la salida` · `feat: avisos de cambio de anden y atraso`

### T-071 · accesibilidad
- depende de: fase 4 · estado: hecha
- hacer: script que verifica contraste AA de todos los pares de `colores.ts`; etiquetas de accesibilidad en todas las pantallas; texto dinámico hasta 200 % sin cortes en pantallas clave.
- commits: `test: contraste de pares de color` · un `fix:` por problema encontrado, con la causa

### T-072 · flujos e2e
- depende de: T-046, T-049 · estado: hecha
- hacer: Maestro: buscar y comprar, ver boleto en modo avión, cancelar, tablero de salidas.
- commits: un `test:` por flujo

### T-073 · rendimiento
- depende de: fase 4 · estado: hecha
- hecho cuando: tablero y mapa de asientos a 60 fps en un Android de gama media (o perfilado documentado), inicio en frío medido y anotado.
- commits: un `fix:` o `refactor:` por mejora, con medición antes y después en el mensaje del cuerpo

### T-074 · ícono y pantalla de arranque
- depende de: T-004 · raíz: sí · estado: hecha
- commits: `feat: icono de la app` · `feat: pantalla de arranque`

### T-075 · compilaciones
- depende de: T-074, T-072 · raíz: sí · estado: hecha
- hacer: configuración de EAS (o compilación local) para iOS y Android; instrucciones en el README.
- commits: `chore: configurar compilaciones de ios y android`

### T-076 · README con capturas reales
- depende de: T-075 · estado: hecha
- hacer: README breve con capturas reales de la app en iOS y Android (no del mockup), cómo correrla, estructura.
- commits: `docs: capturas de la app` · `docs: readme del proyecto`

## fase 7 · marco del MTI

### T-077 · tarifario oficial del MTI
- depende de: decisión del dueño del proyecto · estado: **bloqueada**
- hacer: conseguir el anexo vigente de la resolución de tarifas del MTI (la última confirmada es la RM 051-2017; el anexo es aparte, de 19 folios) y convertirlo en `Tarifa[]`. Cargarlo en la semilla y en `supabase/seed`, marcar `TARIFARIO_OFICIAL = true` y quitar el aviso de T-078. No empezar sin el anexo.

### T-078 · aviso de tarifas de muestra
- depende de: T-041 · estado: hecha
- hacer: mientras `TARIFARIO_OFICIAL` sea `false`, mostrar "tarifas de muestra, no oficiales" en el buscador, en los resultados, en el pago y en el boleto.
- hecho cuando: el aviso aparece en las cuatro pantallas y desaparece con la constante en `true`.
- commits: `feat: constante del tarifario oficial` · un `feat:` por pantalla · `test:` de visibilidad

### T-103 · corregir nombres del corredor
- depende de: T-099 · zona: `docs/plan`, `apps/movil/src/datos` · raíz: no · estado: hecha
- hacer: reemplazar Wácwala y Chagüilpa por Boaco y Juigalpa, ambos con Managua y en los dos sentidos.
- hecho cuando: ningún texto, id ni prueba nombra los destinos erróneos y `pnpm verificar` pasa.

### T-104 · todo el sistema solo con boaco y juigalpa
- depende de: T-103 · zona: `apps/movil/src/datos`, `apps/movil/src/pantallas`, `docs/plan` · raíz: no · estado: hecha
- hacer: dejar en los datos de muestra únicamente las terminales Boaco, Juigalpa y la de Managua, con sus rutas en ambos sentidos, salidas, tarifas y boletos; que Viajar, Horarios, Rutas, Boletos y Buscador solo muestren esos destinos.
- hecho cuando: ninguna pantalla ni dato de muestra nombra otro destino y `pnpm verificar` pasa.
