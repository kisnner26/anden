import { ESTADOS_VIAJE, TIPOS_SERVICIO, esPlusCompleto } from '@anden/dominio';
import { z } from 'zod';

/** una salida tal como la ve quien consulta la API; todo texto de hora va en ISO 8601 */
export const esquemaSalida = z.object({
  asientosLibres: z.number().int().min(0),
  destino: z.string().min(1),
  estado: z.enum(ESTADOS_VIAJE),
  id: z.string().min(1),
  minutosAtraso: z.number().int().min(0),
  origen: z.string().min(1),
  placa: z.string().min(1),
  /** código de Google Maps del punto donde se sube al bus; vacío si todavía no se confirma */
  puntoEncuentro: z.string().refine((v) => v === '' || esPlusCompleto(v)),
  salida: z.iso.datetime(),
  servicio: z.enum(TIPOS_SERVICIO),
  /** córdobas por pasajero; nulo si la ruta no tiene tarifa cargada */
  tarifa: z.number().int().min(0).nullable(),
  ventaAbierta: z.boolean(),
});

export type Salida = z.infer<typeof esquemaSalida>;

export const esquemaFiltroSalidas = z.object({
  destino: z.string().min(1).optional(),
  /** un día, como AAAA-MM-DD; sin día trae todas las próximas */
  dia: z.iso.date().optional(),
  origen: z.string().min(1).optional(),
  servicio: z.enum(TIPOS_SERVICIO).optional(),
});

export type FiltroSalidas = z.infer<typeof esquemaFiltroSalidas>;
