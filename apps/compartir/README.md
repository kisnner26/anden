# Seguir un viaje sin la app

Página estática que abre quien recibe el enlace de "Compartir mi viaje". Muestra la ruta, el bus y por dónde va,
y se actualiza sola cada 8 segundos. No pide cuenta ni instala nada.

## Cómo se publica

1. Corré en el editor SQL de Supabase la migración `supabase/migrations/0019_viaje_compartido.sql`.
2. Copiá `config.ejemplo.js` a `config.js` y completá la URL y la clave `anon` de tu proyecto.
3. Subí esta carpeta a cualquier hosting estático con https (GitHub Pages, Netlify, Vercel).
4. En la app, definí `EXPO_PUBLIC_URL_COMPARTIR` con la dirección donde quedó, por ejemplo
   `https://usuario.github.io/anden-compartir`, y volvé a compilar.

Sin el paso 4 la app comparte el enlace que abre Andén (`anden://viaje/...`), que solo sirve a quien ya la tiene.

## Qué se ve y qué no

El enlace lleva un código de 32 caracteres que genera el servidor y vence a las 12 horas. Quien lo abre ve el primer
nombre de quien viaja, la ruta, la hora de salida, la placa y la última ubicación del bus. No ve teléfono, cédula,
asiento ni el código del boleto.
