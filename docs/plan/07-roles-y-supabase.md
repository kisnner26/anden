# Roles, login y seguimiento con Supabase

Pedido del dueño del proyecto: la app tiene que separar a quien viaja de quien maneja. El conductor comparte su ubicación para que el pasajero vea el avance real de la unidad, y marca quién pagó en efectivo. Esto requiere un login. Todo esto va a terminar en Supabase; mientras no exista el backend, la app corre con servicios locales que cumplen las mismas interfaces.

## roles

| Rol | Quién es | Qué puede hacer |
| --- | --- | --- |
| `pasajero` | Cualquier persona que viaja | Buscar, reservar, ver su boleto, ver la unidad en vivo, opinar y reportar. Puede usar la app sin cuenta ("invitado"); la cuenta sirve para recuperar boletos en otro teléfono. |
| `conductor` | Chofer de una cooperativa | Ver sus viajes del día, iniciar y terminar un viaje, compartir su ubicación mientras el viaje está activo, ver la lista de pasajeros de su viaje y marcar quién pagó en efectivo. |
| `operador` (tercero, no se construye todavía) | Personal de la cooperativa o de la terminal | Asignar chofer y unidad a un viaje, ver toda la flota en vivo, validar abordajes, resolver reportes y dar de alta conductores. |

Un solo login. El rol sale del perfil de la cuenta, no de lo que la persona elija en pantalla: un pasajero no puede "entrar como conductor".

## cómo se crea cada cuenta

- **Pasajero:** se registra solo (teléfono o correo). Sigue funcionando sin cuenta con los datos en el teléfono.
- **Conductor:** no se registra solo. La cooperativa lo da de alta (más adelante, el `operador`) y le entrega sus credenciales. Así nadie puede hacerse pasar por conductor de una unidad.
- **Mientras no hay backend:** el modo conductor se prueba con los choferes de muestra y un PIN de muestra. Es solo para desarrollo y la pantalla lo dice.

## ubicación del conductor

Es el dato más sensible del sistema. Reglas:

1. Solo se comparte durante un viaje activo que el propio conductor inició. Termina al finalizar el viaje o al cerrar sesión.
2. Solo en primer plano en la primera versión (la pantalla del viaje abierta y sin apagarse). Seguir con la app en segundo plano necesita el permiso "Siempre" de iOS y una justificación aparte; queda para una segunda etapa.
3. Mientras se comparte, la pantalla del conductor lo dice de forma permanente, con un botón para detenerlo.
4. El pasajero ve la posición de la unidad y la hora estimada, nunca el teléfono ni el nombre de usuario del conductor más allá de su perfil público (nombre y calificación).
5. Las posiciones se guardan con vencimiento corto (24 horas) y solo las lee quien tiene boleto de ese viaje o es `operador`.
6. Si el conductor niega el permiso, puede manejar igual: el viaje se marca "sin seguimiento" y los pasajeros ven el horario, no un bus falso.

El progreso (kilómetros recorridos, porcentaje y minutos restantes) se calcula en el teléfono del pasajero proyectando la posición sobre el trazo de carretera de la ruta (`trazos.ts`). El conductor solo envía latitud, longitud, velocidad y hora.

## pago en efectivo

El pasajero paga al subir. El conductor ve la lista de boletos de su viaje y marca cada uno como `pagado_efectivo`. Queda registrado quién lo marcó y cuándo. El pasajero ve en su boleto que ya figura como pagado. Un boleto marcado por error se puede revertir mientras el viaje está activo.

## modelo en Supabase

Tablas nuevas o ampliadas (nombres definitivos al crear las migraciones):

- `perfiles(id uuid pk = auth.users.id, rol text check in ('pasajero','conductor','operador'), nombre, telefono, cooperativa_id)`.
- `choferes(id pk, perfil_id fk perfiles, cooperativa_id, licencia_verificada, ...)`: ya existe como concepto; se enlaza al perfil.
- `viajes(..., chofer_id, estado)`: estado `programado | activo | terminado | cancelado`; `activo` lo pone el conductor al iniciar.
- `posiciones_bus(viaje_id, lat, lng, velocidad, registrada_en)`: una fila por actualización, con vencimiento.
- `boletos(..., pago_estado text default 'pendiente', pagado_por uuid, pagado_en timestamptz)`.

Seguridad por filas (RLS), en palabras:

- Un pasajero lee y escribe solo sus boletos y sus opiniones.
- Un conductor lee los boletos y actualiza solo `pago_estado` de los viajes cuyo `chofer_id` es el suyo, y escribe posiciones solo de su viaje activo.
- Un pasajero lee posiciones solo de viajes donde tiene boleto vigente.
- Quien no es `operador` no puede cambiar `perfiles.rol`; el rol se asigna con la clave de servicio, nunca desde la app.

Tiempo real: Supabase Realtime. Las posiciones salen por un canal por viaje (`viaje:{id}`). Hay que decidir al implementar si se usa Broadcast (sin escribir cada punto en la base) o cambios de Postgres; la recomendación es Broadcast para el flujo en vivo y una fila cada tantos segundos para el historial.

Autenticación: Supabase Auth. El pasajero con teléfono (código por SMS, que tiene costo y necesita un proveedor) o correo; el conductor con correo y contraseña dados por la cooperativa. La sesión se guarda en el llavero del teléfono. Hay que validar con la documentación vigente de Supabase antes de elegir; este documento no fija versiones.

## capas en la app

Para que el cambio a Supabase no toque las pantallas, todo pasa por interfaces pequeñas:

- `ServicioSesion`: iniciar sesión, cerrar sesión, sesión actual con su rol.
- `ServicioTransmision`: iniciar y detener la transmisión de un viaje, y observar la última posición de un viaje.
- `ServicioPagos`: marcar y revertir el pago en efectivo de un boleto, y leer su estado.

Hoy cada una tiene una implementación local (en memoria y AsyncStorage). Cuando exista Supabase se agrega la segunda implementación y se pasan las mismas pruebas de contrato. Estas interfaces viven en la app hasta que `packages/datos` tenga su contrato real; entonces se mueven allí sin cambiar a quien las usa.

## etapas

1. Sesión con rol, login y modo conductor con servicios locales (esta etapa).
2. Supabase: autenticación, perfiles y RLS.
3. Posiciones en tiempo real con Realtime y seguimiento en segundo plano.
4. Rol `operador`.

## preguntas abiertas

- Cómo identifica la cooperativa a sus conductores al darlos de alta (correo, teléfono o cédula).
- Si el pasajero invitado puede ver el seguimiento o solo quien tiene cuenta.
- Si se permite al conductor marcar pago a quien no tiene boleto en la app (pasajero que sube sin reservar).
