# Andén en el Apple Watch

App solo-Watch (sin app embebida en el iPhone) que lee del mismo Supabase que la app del teléfono.

- **Viaje**: el próximo viaje con hora, andén, asiento, placa y cuenta atrás.
- **Boleto**: el código del boleto en grande para mostrarlo al subir.
- **Bus**: dónde va el bus del viaje en su corredor, con posición real.

## Instalar en tu reloj

```sh
TEAM_ID=XXXXXXXXXX ./scripts/install-watch.sh
```

Necesita XcodeGen (`brew install xcodegen`), el reloj emparejado y la sesión de Apple iniciada en Xcode.
La dirección y la clave pública del servidor se leen de `apps/movil/.env` y se escriben en
`Config/Secrets.xcconfig`, que no se sube al repositorio. Con una cuenta gratuita el perfil dura 7 días.
Nunca se usan simuladores de watchOS.
