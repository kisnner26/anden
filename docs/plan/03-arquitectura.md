# 03 · arquitectura

## stack

| capa | elección | por qué |
|---|---|---|
| app | Expo (React Native) con TypeScript estricto y Expo Router | un solo código para iOS y Android, rutas por archivos |
| animación | Reanimated + Gesture Handler | split-flap, talón arrastrable, mapa de asientos a 60 fps |
| gráficos | react-native-svg | mapa de asientos, línea de ruta, muescas del boleto, QR |
| mapa | `@maplibre/maplibre-react-native` + OpenFreeMap | gratis, sin clave, estilo propio |
| estado de servidor | TanStack Query | caché, reintentos, offline |
| estado local | Zustand | flujo de compra en curso, preferencias |
| persistencia local | MMKV | boletos offline, rutas frecuentes |
| validación | Zod | esquemas compartidos entre dominio, datos y formularios |
| backend | Supabase (Postgres, Auth por teléfono, Realtime, funciones RPC) | concurrencia de asientos en SQL, tiempo real para el bus |
| pruebas | Vitest (paquetes), Jest + React Native Testing Library (app), Maestro (flujos e2e) | |
| calidad | ESLint, Prettier, `tsc --noEmit` | |
| monorepo | pnpm workspaces | dominio y datos se prueban sin levantar la app |

Las versiones exactas se fijan en T-000 con la versión estable vigente de Expo SDK (`create-expo-app@latest`) y se anotan en la tabla de abajo en el mismo commit. Nadie sube una dependencia mayor sin una tarea propia.

| paquete | versión fijada |
|---|---|
| Expo SDK | 58.0.22 |
| React Native | 0.88.1 |
| Node | 26.8.1 |
| pnpm | 12.11.2 |

La app necesita compilación de desarrollo (`expo prebuild` / `expo run:ios`, `expo run:android`), no Expo Go, porque MapLibre y MMKV son nativos.

## estructura del repositorio

```
anden/
├── apps/
│   └── movil/                  app Expo
│       ├── app/                rutas de Expo Router
│       │   ├── (pestanas)/     viajar, horarios, rutas, boletos
│       │   ├── viaje/[id]/     detalle, asientos, pasajeros, pago, listo
│       │   ├── boleto/[id].tsx
│       │   ├── chofer/[id].tsx
│       │   ├── ruta/[id].tsx
│       │   ├── cuenta/
│       │   └── vitrina.tsx     catálogo de componentes (solo desarrollo)
│       └── src/
│           ├── tema/           colores, tipografía, espacios, movimiento
│           ├── componentes/    componentes propios (02-diseno.md)
│           ├── pantallas/      lógica de presentación por pantalla
│           ├── datos/          hooks de TanStack Query sobre los repositorios
│           ├── estado/         stores de Zustand
│           ├── mapa/           estilo y capas del mapa
│           ├── textos/         es.ts
│           └── iconos/         envoltorio Icono
├── packages/
│   ├── dominio/                TypeScript puro, sin React ni red
│   │   └── src/                tipos, esquemas Zod, reglas (precio, asientos, horarios, boletos)
│   └── datos/                  repositorios: contrato + memoria + supabase
│       └── src/
│           ├── contrato.ts
│           ├── memoria/        implementación con semilla
│           ├── supabase/       implementación real
│           └── semilla/        datos de muestra de Nicaragua
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/plan/                  este plan
├── .maestro/                   flujos e2e
├── AGENTS.md                   protocolo de trabajo
└── package.json                scripts de raíz
```

## capas y dependencias

```
pantallas (app) ──> datos (hooks) ──> packages/datos (contrato) ──> packages/dominio
       │                                                                ▲
       └────────────── componentes, tema, textos ───────────────────────┘ (solo tipos)
```

- `packages/dominio` no importa nada del proyecto. Funciones puras y probadas.
- `packages/datos` solo importa `dominio`. La app nunca importa `memoria/` ni `supabase/` directo: elige la implementación en un único archivo, `apps/movil/src/datos/proveedor.ts`, según `EXPO_PUBLIC_DATOS=memoria|supabase` (por defecto `memoria`).
- Las pantallas no llaman repositorios: usan hooks de `src/datos/`.
- Los componentes no conocen datos: reciben props.

## modelo de dominio

Tipos en `packages/dominio/src/tipos.ts`, cada uno con su esquema Zod en `esquemas.ts`. Ids como texto (`ter_uca`, `rut_mga_gra`, `via_...`).

| entidad | campos principales |
|---|---|
| `Terminal` | id, nombre, ciudad, codigo (3 letras, ej. `UCA`), coordenadas, andenes |
| `Ruta` | id, origenId, destinoId, paradas (terminal o punto con minutos desde el origen), distanciaKm, duracionMin, tarifaBase |
| `Bus` | id, placa, cooperativa, tipo (`ordinario`, `interlocal`, `expreso`), configuracion (`micro15`, `coaster26`, `bus45`), comodidades |
| `Chofer` | id, nombre, fotoUrl, aniosManejando, licenciaVerificada, viajesRealizados |
| `Viaje` | id, rutaId, busId, choferId, salida (ISO), anden, estado, minutosAtraso |
| `Asiento` | numero, fila, columna, tipo (`ventana`, `pasillo`, `preferencial`) |
| `Retencion` | id, viajeId, asientos, expira (ISO), duenoId |
| `Ocupacion` | una fila por asiento ocupado de un viaje, igual que la tabla `ocupaciones`: viajeId, asiento, estado (`retenido`, `vendido`), duenoId, expira (ISO, obligatoria si está retenido) y boletoId (obligatorio si está vendido) |
| `Pasajero` | nombre, cedula opcional, esMenorEnBrazos |
| `Boleto` | id, codigo, viajeId, duenoId, asiento, pasajero, precio, estado (`vigente`, `usado`, `cancelado`, `reembolsado`), compradoEn, cambioUsado |
| `Calificacion` | boletoId, choferId, estrellas, etiquetas |
| `PosicionBus` | viajeId, coordenadas, registradaEn |

Configuraciones de asiento (`micro15`, `coaster26`, `bus45`) se definen como datos en `dominio/src/configuraciones.ts`: una matriz de filas con asiento, pasillo, puerta o vacío. El `MapaAsientos` dibuja esa matriz; no hay planos dibujados a mano por pantalla.

## contrato de datos

`packages/datos/src/contrato.ts` define una interfaz por recurso. Las dos implementaciones cumplen la misma suite de pruebas de contrato (`contrato.test.ts` corre contra memoria; contra supabase en CI cuando exista base local).

```ts
interface RepositorioViajes {
  buscar(filtro: FiltroBusqueda): Promise<ResultadoViaje[]>
  obtener(id: string): Promise<DetalleViaje | null>
  salidasDeTerminal(terminalId: string, desde: Date, limite: number): Promise<SalidaTablero[]>
  observarEstado(viajeId: string, cb: (v: Viaje) => void): () => void
}

interface RepositorioAsientos {
  mapa(viajeId: string): Promise<MapaAsientosViaje>
  retener(viajeId: string, asientos: number[], duenoId: string): Promise<Resultado<Retencion, ErrorRetencion>>
  liberar(retencionId: string): Promise<void>
}

interface RepositorioBoletos {
  comprar(retencionId: string, pasajeros: Pasajero[], pago: ComprobantePago): Promise<Resultado<Boleto[], ErrorCompra>>
  misBoletos(duenoId: string): Promise<Boleto[]>
  cancelar(boletoId: string): Promise<Resultado<Reembolso, ErrorCancelacion>>
  cambiar(boletoId: string, nuevoViajeId: string): Promise<Resultado<Boleto, ErrorCambio>>
}
```

Más `RepositorioTerminales`, `RepositorioRutas`, `RepositorioChoferes`, `RepositorioCalificaciones`, `RepositorioPosiciones` y `ProveedorPago`. Los errores esperados no se lanzan: se devuelven como `Resultado` (`{ ok: true, valor } | { ok: false, error }`), definido en `dominio`.

## asientos sin doble venta

En memoria: un mapa por viaje con retenciones y ventas; antes de retener se descartan las vencidas.

En Supabase:
- tabla `ocupaciones (viaje_id, asiento, estado, expira, dueno_id, boleto_id)`.
- índice único parcial en `(viaje_id, asiento)` para `estado = 'vendido'` o retenciones no vencidas; las vencidas se borran dentro de la misma función antes de insertar.
- `retener_asientos(viaje, asientos[], dueno)` y `comprar(retencion, pasajeros, pago)` son funciones `plpgsql` con `security definer`; la app nunca escribe en `ocupaciones` directo (RLS lo impide).
- `comprar` verifica que la retención no venció, que el pago está confirmado y que la venta no cerró, todo en una transacción.

## pago

`ProveedorPago` con `iniciar(monto, referencia)` y `confirmar(intento)`. En la v1 solo existe `PagoSimulado` (aprueba siempre salvo tarjeta de prueba `4000 0000 0000 0002`, que rechaza, para probar el error). La pasarela real queda en una tarea bloqueada por decisión del dueño del proyecto.

## sin conexión

- Los boletos comprados se guardan en MMKV al confirmarse y se muestran desde ahí primero.
- El código del boleto se valida sin red con su dígito de control.
- TanStack Query persiste búsquedas y horarios recientes; la UI marca "datos de hace N min" cuando no hay red.

## seguimiento en vivo

Supabase Realtime sobre `posiciones_bus`. En memoria, un simulador avanza el bus por las paradas de la ruta según la hora de salida, para poder probar todo sin backend.

## privacidad y permisos

- Ubicación: solo "mientras se usa", y solo para sugerir la terminal más cercana. Si se niega, la app funciona igual.
- La app no usa la cámara. El QR del boleto lo lee el equipo de la cooperativa; la validación del lado de la app es por código.
- La cédula del pasajero es opcional y no se muestra completa en el boleto (últimos 4 caracteres).
- Sin analíticas de terceros en la v1.

## identificadores

- bundle id iOS y paquete Android: `com.kisnner.anden` (uno solo, fijo desde T-000; la cuenta gratuita de Apple limita los App IDs nuevos por semana).
- esquema de enlaces: `anden://`.

## comandos de raíz

Se definen en T-000 y T-001 y todos los agentes usan los mismos:

| comando | qué hace |
|---|---|
| `pnpm verificar` | tipos + lint + pruebas de todo el monorepo; es lo que corre la CI |
| `pnpm -F @anden/dominio test` | pruebas del dominio |
| `pnpm -F @anden/datos test` | pruebas de datos y contrato |
| `pnpm -F movil test` | pruebas de la app |
| `pnpm -F movil tipos` | `tsc --noEmit` de la app |
| `pnpm -F movil ios` / `android` | compilación de desarrollo |
| `pnpm e2e` | flujos de Maestro (requiere app corriendo) |
