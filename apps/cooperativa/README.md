# Panel de la cooperativa

Panel web de Andén para la cooperativa. Usa el mismo proyecto de Supabase que la app móvil, así que lo que publican los conductores y lo que reservan los pasajeros aparece acá al instante.

Muestra: resumen del día (cobros, pasajeros, viajes, encomiendas), solicitudes de conductor con la cédula para aprobar o rechazar, conductores, viajes (con cancelación), encomiendas y alertas de seguridad.

## Primer uso

1. En el editor de SQL de Supabase corré `supabase/pendientes-sql-editor.sql` (crea el rol `cooperativa` y sus permisos).
2. Creá una cuenta desde la app y convertila en cooperativa: `select public.hacer_cooperativa('tu.usuario');`
3. `cp .env.example .env.local` y poné la dirección y la clave pública del proyecto.
4. `pnpm --filter cooperativa dev` para verlo en local, o `pnpm --filter cooperativa build` y subí la carpeta `dist/` a cualquier hosting estático.

Solo las cuentas con rol de cooperativa pueden entrar: el servidor lo exige, no solo el panel.
