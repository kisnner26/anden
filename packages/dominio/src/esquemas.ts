import { z } from 'zod';

import type { Coordenadas, Parada, Ruta, Terminal } from './tipos';

const id = z.string().min(1);
const texto = z.string().trim().min(1);
const entero = z.number().int();

export const esquemaCoordenadas: z.ZodType<Coordenadas> = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const esquemaTerminal: z.ZodType<Terminal> = z.object({
  id,
  nombre: texto,
  ciudad: texto,
  codigo: z.string().regex(/^[A-Z]{3}$/),
  coordenadas: esquemaCoordenadas,
  andenes: entero.min(1),
});

export const esquemaParada: z.ZodType<Parada> = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('terminal'),
    terminalId: id,
    minutosDesdeOrigen: entero.min(0),
  }),
  z.object({
    tipo: z.literal('punto'),
    nombre: texto,
    coordenadas: esquemaCoordenadas,
    minutosDesdeOrigen: entero.min(0),
  }),
]);

export const esquemaRuta: z.ZodType<Ruta> = z
  .object({
    id,
    origenId: id,
    destinoId: id,
    paradas: z.array(esquemaParada),
    distanciaKm: z.number().positive(),
    duracionMin: entero.positive(),
    tarifaBase: entero.positive(),
  })
  .refine((ruta) => ruta.origenId !== ruta.destinoId, {
    message: 'el origen y el destino deben ser distintos',
  });
