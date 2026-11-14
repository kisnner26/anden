import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

/** el cuerpo de error estándar (RFC 9457, "problem details"): lo mismo para todos los fallos de la API */
export interface Problema {
  detail: string;
  errores?: { campo: string; mensaje: string }[];
  instance: string;
  status: number;
  title: string;
  type: string;
}

const TITULOS: Record<number, string> = {
  400: 'Petición inválida',
  401: 'Hace falta iniciar sesión',
  403: 'No tenés permiso',
  404: 'No encontrado',
  409: 'Conflicto',
  429: 'Demasiadas peticiones',
  500: 'Error interno',
};

export function problemaDe(
  estado: number,
  detalle: string,
  instancia: string,
  errores?: Problema['errores'],
): Problema {
  return {
    detail: detalle,
    ...(errores ? { errores } : {}),
    instance: instancia,
    status: estado,
    title: TITULOS[estado] ?? 'Error',
    type: `https://anden.example/problemas/${estado}`,
  };
}

/** convierte cualquier error en un problema; los de servidor no filtran detalles internos */
export function manejarError(
  error: FastifyError,
  peticion: FastifyRequest,
  respuesta: FastifyReply,
): void {
  const instancia = peticion.url;
  if (error.validation) {
    const errores = error.validation.map((v) => ({
      campo: v.instancePath.replace(/^\//, '').replace(/\//g, '.') || 'cuerpo',
      mensaje: v.message ?? 'valor inválido',
    }));
    void respuesta
      .status(400)
      .type('application/problem+json')
      .send(
        problemaDe(
          400,
          'Los datos enviados no son válidos.',
          instancia,
          errores,
        ),
      );
    return;
  }
  const estado =
    error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
  if (estado >= 500) peticion.log.error({ err: error }, 'error no controlado');
  void respuesta
    .status(estado)
    .type('application/problem+json')
    .send(
      problemaDe(
        estado,
        estado >= 500 ? 'Ocurrió un error en el servidor.' : error.message,
        instancia,
      ),
    );
}
