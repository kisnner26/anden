# Conectar la app a Supabase

Estado: la app está preparada; falta crear el proyecto y cargar las migraciones. Sin variables de entorno sigue con los servicios locales y todo funciona igual.

## qué ya está hecho

- `@supabase/supabase-js` instalado; el cliente vive en `src/servicios/supabase/cliente.ts` y guarda la sesión en AsyncStorage.
- Se activa solo si existen `EXPO_PUBLIC_SUPABASE_URL` (https) y `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Plantilla en `apps/movil/.env.example`; `.env` no se sube.
- `ProveedorSesion` usa `crearSesionSupabase` cuando hay cliente. El ingreso es único: quien entra escribe correo, teléfono o código; los dos últimos se convierten en un correo interno (`<codigo>@cuentas.anden.app`). El rol sale de la tabla `perfiles`, nunca de lo que la persona elige.
- `supabase/migrations/0001_perfiles_y_roles.sql`: perfiles con rol, RLS, y trigger que crea toda cuenta nueva como pasajera. Un conductor lo asigna el operador (con la llave de servicio, desde el panel o un script), nunca la app.
- `supabase/migrations/0002_pagos_y_cierres.sql`: pagos en efectivo y cierres de viaje, solo para conductores.

## pasos para activarlo

1. Crear el proyecto en supabase.com y copiar la URL y la llave anónima a `apps/movil/.env`.
2. Cargar las migraciones con la CLI (`supabase db push`) o pegándolas en el editor SQL, en orden.
3. Crear los conductores desde Authentication y ponerles `rol = 'conductor'` y `chofer_id` en `perfiles`.
4. Reiniciar Expo. Con la sesión de Supabase activa las cuentas de muestra dejan de usarse.

## qué falta

- Adaptadores de `ServicioPagos` y de cierres sobre las tablas de la migración 0002 (misma interfaz y mismas pruebas de contrato que los locales).
- Tabla y canal de posición para `ServicioTransmision` (Realtime), con borrado al terminar el viaje.
- Boletos, reservas y salidas en el servidor; hoy siguen en el teléfono y con datos de muestra.
- Registro de pasajeros con correo y confirmación.
- Probar contra un proyecto real: lo escrito está probado con un cliente falso, no contra Supabase.
