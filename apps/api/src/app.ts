import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import type { Configuracion } from './config';
import { manejarError } from './errores';
import type { RepositorioSalidas } from './repositorios/salidas';
import { rutasSalidas } from './rutas/salidas';
import { rutasSalud } from './rutas/salud';

export interface DependenciasApp {
  configuracion: Pick<
    Configuracion,
    'NIVEL_DE_REGISTRO' | 'NODE_ENV' | 'PETICIONES_POR_MINUTO'
  >;
  salidas: RepositorioSalidas;
}

/**
 * arma la aplicación sin abrir ningún puerto: así las pruebas la usan directo con `inject`. Todo lo que
 * toca el mundo de afuera (base de datos, reloj) entra por `dependencias`.
 */
export async function construirApp(
  dependencias: DependenciasApp,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      dependencias.configuracion.NIVEL_DE_REGISTRO === 'silent'
        ? false
        : {
            // nunca se registran las cabeceras con credenciales
            level: dependencias.configuracion.NIVEL_DE_REGISTRO,
            redact: ['req.headers.authorization', 'req.headers.cookie'],
          },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(manejarError);

  await app.register(sensible);
  await app.register(helmet);
  await app.register(rateLimit, {
    max: dependencias.configuracion.PETICIONES_POR_MINUTO,
    timeWindow: '1 minute',
  });
  await app.register(swagger, {
    openapi: {
      info: {
        description:
          'La API de Andén: salidas, reservas, telemetría y predicciones.',
        title: 'API de Andén',
        version: '0.0.0',
      },
      openapi: '3.1.0',
    },
    transform: jsonSchemaTransform,
  });

  app.get('/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  );

  await app.register(rutasSalud);
  await app.register(rutasSalidas({ salidas: dependencias.salidas }));
  return app;
}
