# Arquitectura de la API propia

## Idea central

Supabase se queda como base: PostgreSQL, cuentas y tiempo real. Encima se agrega un servicio propio, `apps/api`, que pasa a ser la única puerta de entrada de la app y de los paneles. La app deja de hablar con tablas y funciones sueltas y habla con una API versionada y documentada.

Los modelos se entrenan fuera de producción (Python) y se exportan a ONNX; la API los ejecuta dentro del mismo proceso. Así no hace falta un servicio de Python en producción y la tesis conserva un solo servicio que operar.

## Capas

```
app móvil / panel de la cooperativa / página de viaje compartido
              |  HTTPS, JSON, /v1
        apps/api  (Node, TypeScript, Fastify)
   rutas -> servicios -> reglas del dominio (packages/dominio) -> repositorios
              |                         |
      Supabase (Postgres, Auth,    modelos ONNX
        Realtime, Storage)          (ocupación, llegada)
```

Reglas:
- Las reglas de negocio siguen en `packages/dominio` y se comparten con la app; la API no las reescribe.
- Los repositorios son la única parte que conoce Supabase; así se puede cambiar de base de datos sin tocar las rutas.
- Validación de entrada y salida con esquemas (zod) que también generan el contrato OpenAPI.

## Recursos y endpoints (v1)

| Recurso | Operaciones principales |
| --- | --- |
| Salidas y viajes | listar por terminal y día, detalle, publicar (conductor), cancelar, iniciar |
| Reservas y boletos | reservar con control de concurrencia, validar QR, marcar abordaje, cancelar |
| Asientos | mapa de ocupación, retención temporal |
| Encomiendas | solicitar, aceptar, cambiar estado |
| Telemetría | recibir posiciones del conductor, consultar última posición |
| Compartidos | crear enlace, ver viaje compartido |
| Opiniones | crear, listar por chofer |
| Predicciones | ocupación esperada de una salida, llegada estimada, probabilidad de que se llene |
| Cuentas y perfil | sesión, perfil, contacto de confianza |
| Salud | `/salud` y `/metricas` para observabilidad |

## Seguridad

- Autenticación con los tokens de Supabase, verificados en la API; roles pasajero, conductor y cooperativa.
- Autorización por recurso (cada quien ve lo suyo); las políticas de la base de datos siguen como segunda barrera.
- Límite de peticiones por cuenta y por IP, validación estricta, cabeceras de seguridad, registros sin datos personales.
- Secretos fuera del repositorio.

## Calidad y operación

- Pruebas unitarias, de integración contra una base de datos de prueba y de contrato contra el esquema OpenAPI.
- Pruebas de carga (k6) con objetivos de latencia definidos en el protocolo.
- Registros estructurados, métricas y trazas; tablero de salud.
- Despliegue en contenedor, con migraciones versionadas y compatibilidad hacia atrás (la app instalada no se rompe cuando cambia la API).

## Datos para los modelos

- Tabla de eventos de telemetría (posición, velocidad, tiempo, viaje) con retención definida.
- Tabla de ocupación por salida en el tiempo (cuántos asientos hay a 24 h, 12 h, 6 h, 1 h de la salida), que es el dato que alimenta la predicción de ocupación.
- Historial de salidas reales (hora planificada, hora real, duración del trayecto).
- Todo con identificadores seudónimos y sin teléfono, cédula ni nombre.

## Migración gradual

1. Crear `apps/api` con salud, autenticación y un primer recurso de solo lectura (salidas).
2. Mover a la API las operaciones con reglas delicadas: reservas, validación de boleto, telemetría.
3. Apuntar la app a la API detrás de un interruptor, recurso por recurso.
4. Retirar el acceso directo de la app a las tablas cuando todo pase por la API.

## Primeros pasos concretos

1. Esqueleto de `apps/api` con Fastify, zod, OpenAPI y pruebas.
2. Esquema SQL de telemetría y de ocupación en el tiempo.
3. Simulador de demanda y de viajes que llene esas tablas.
4. Notebook de baselines (promedio histórico, estacional ingenuo, gradiente boosting).
