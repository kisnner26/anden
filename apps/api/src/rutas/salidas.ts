import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { problemaDe } from '../errores';
import { esquemaProblema } from '../esquemas/problema';
import { esquemaFiltroSalidas, esquemaSalida } from '../esquemas/salida';
import type { RepositorioSalidas } from '../repositorios/salidas';

export interface DependenciasSalidas {
  salidas: RepositorioSalidas;
}

export function rutasSalidas(dependencias: DependenciasSalidas) {
  return async (app: FastifyInstance): Promise<void> => {
    const servidor = app.withTypeProvider<ZodTypeProvider>();

    servidor.get(
      '/v1/salidas',
      {
        schema: {
          description:
            'Lista las salidas, de la más próxima a la más lejana, con los filtros que se indiquen.',
          querystring: esquemaFiltroSalidas,
          response: {
            200: z.object({ salidas: z.array(esquemaSalida) }),
            400: esquemaProblema,
          },
          tags: ['salidas'],
        },
      },
      async (peticion) => ({
        salidas: await dependencias.salidas.listar(peticion.query),
      }),
    );

    servidor.get(
      '/v1/salidas/:id',
      {
        schema: {
          description: 'El detalle de una salida.',
          params: z.object({ id: z.string().min(1) }),
          response: { 200: esquemaSalida, 404: esquemaProblema },
          tags: ['salidas'],
        },
      },
      async (peticion, respuesta) => {
        const salida = await dependencias.salidas.obtener(peticion.params.id);
        if (!salida) {
          return respuesta
            .status(404)
            .type('application/problem+json')
            .send(
              problemaDe(
                404,
                'No existe una salida con ese id.',
                peticion.url,
              ) as never,
            );
        }
        return salida;
      },
    );
  };
}
