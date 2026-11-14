import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

const VERSION = '0.0.0';

/** comprobaciones para que quien opera el servicio sepa si está vivo, sin exigir cuenta */
export async function rutasSalud(app: FastifyInstance): Promise<void> {
  const servidor = app.withTypeProvider<ZodTypeProvider>();
  const iniciado = Date.now();

  servidor.get(
    '/salud',
    {
      schema: {
        description: 'Dice si el servicio está vivo.',
        response: {
          200: z.object({
            estado: z.literal('ok'),
            segundosActivo: z.number().int().min(0),
            version: z.string(),
          }),
        },
        tags: ['operación'],
      },
    },
    async () => ({
      estado: 'ok' as const,
      segundosActivo: Math.floor((Date.now() - iniciado) / 1000),
      version: VERSION,
    }),
  );
}
