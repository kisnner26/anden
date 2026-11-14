import { z } from 'zod';

/** el cuerpo de todos los errores (RFC 9457); se declara en las respuestas para que quede en la documentación */
export const esquemaProblema = z.object({
  detail: z.string(),
  errores: z
    .array(z.object({ campo: z.string(), mensaje: z.string() }))
    .optional(),
  instance: z.string(),
  status: z.number().int(),
  title: z.string(),
  type: z.string(),
});
