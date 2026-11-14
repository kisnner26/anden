import { z } from 'zod';

const esquema = z.object({
  /** orígenes permitidos para el navegador, separados por coma; vacío no permite ninguno */
  ORIGENES_PERMITIDOS: z.string().default(''),
  HOST: z.string().default('0.0.0.0'),
  NIVEL_DE_REGISTRO: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PUERTO: z.coerce.number().int().min(1).max(65535).default(3000),
  /** peticiones por minuto y por dirección */
  PETICIONES_POR_MINUTO: z.coerce.number().int().min(1).default(120),
  SUPABASE_CLAVE_DE_SERVICIO: z.string().optional(),
  SUPABASE_URL: z.url().optional(),
});

export type Configuracion = z.infer<typeof esquema>;

/** lee y valida las variables de entorno; si algo no sirve el servidor no arranca, y dice cuál variable */
export function leerConfiguracion(
  entorno: Readonly<Record<string, string | undefined>> = process.env,
): Configuracion {
  const resultado = esquema.safeParse(entorno);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((problema) => `${problema.path.join('.')}: ${problema.message}`)
      .join('; ');
    throw new Error(`Configuración inválida: ${detalle}`);
  }
  return resultado.data;
}

export function origenesPermitidos(configuracion: Configuracion): string[] {
  return configuracion.ORIGENES_PERMITIDOS.split(',')
    .map((origen) => origen.trim())
    .filter((origen) => origen !== '');
}
