# Puente de Claude Code

Deja que el panel de la cooperativa use **Claude Code de tu Mac, con tu suscripción**. El panel le manda la pregunta
y un resumen numérico de la operación; el puente se la pasa a `claude -p` y devuelve el texto.

```sh
pnpm --filter @anden/puente-claude iniciar
```

Muestra una dirección (por ejemplo `http://127.0.0.1:4780`) y un **código de emparejamiento**. En el panel de la
cooperativa: Asistente > escribir los dos > Conectar. La conexión dura lo que la pestaña esté abierta.

## Seguridad

- Solo atiende a equipos de la red local (10.x, 172.16 a 31, 192.168.x, enlace local); cualquier otra dirección recibe 403.
- Todo pedido lleva el código como `Authorization: Bearer`, comparado en tiempo constante. El código se crea la
  primera vez en `~/.anden/puente.json` (permisos 600) y en el panel queda solo en la pestaña abierta.
- Claude corre **sin herramientas** (`--tools ""`) y sin guardar sesión: solo puede contestar texto, no leer ni
  tocar archivos de la Mac.
- Una pregunta a la vez, 20 por minuto, textos con tope de tamaño y 90 segundos de espera.
- Es HTTP sin cifrar dentro de tu red: úsalo en tu casa u oficina, no en redes públicas.

Necesita Claude Code instalado y con la sesión iniciada en la Mac. Si tarda o falla, el panel lo dice. La suscripción y su uso son tuyos: revisa los términos de tu plan.

## Pruebas

```sh
pnpm --filter @anden/puente-claude test
```
