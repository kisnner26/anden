import { construirApp } from './app';
import { leerConfiguracion } from './config';
import { crearRepositorioEnMemoria } from './repositorios/salidas';

/** punto de entrada: lee la configuración, arma la app y escucha; cierra bien al recibir una señal de apagado */
async function main(): Promise<void> {
  const configuracion = leerConfiguracion();
  // por ahora sin base de datos conectada: el repositorio real de Supabase llega en el siguiente paso
  const app = await construirApp({
    configuracion,
    salidas: crearRepositorioEnMemoria([]),
  });

  for (const senal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(senal, () => {
      app.log.info({ senal }, 'apagando');
      void app.close().then(() => process.exit(0));
    });
  }

  await app.listen({ host: configuracion.HOST, port: configuracion.PUERTO });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
