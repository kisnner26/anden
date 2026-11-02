import { z } from 'zod';

import {
  COMODIDADES,
  CONFIGURACIONES_BUS,
  ESTADOS_VIAJE,
  TIPOS_ASIENTO,
  TIPOS_BUS,
  type Asiento,
  type Bus,
  type Chofer,
  type Coordenadas,
  type Parada,
  type Ruta,
  type Terminal,
  type Viaje,
} from './tipos';

const id = z.string().min(1);
const texto = z.string().trim().min(1);
const entero = z.number().int();
const fechaHora = z.iso.datetime({ offset: true });

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

export const esquemaBus: z.ZodType<Bus> = z.object({
  id,
  placa: texto,
  cooperativa: texto,
  tipo: z.enum(TIPOS_BUS),
  configuracion: z.enum(CONFIGURACIONES_BUS),
  comodidades: z.array(z.enum(COMODIDADES)),
});

export const esquemaChofer: z.ZodType<Chofer> = z.object({
  id,
  nombre: texto,
  fotoUrl: texto,
  aniosManejando: entero.min(0),
  licenciaVerificada: z.boolean(),
  viajesRealizados: entero.min(0),
});

export const esquemaViaje: z.ZodType<Viaje> = z.object({
  id,
  rutaId: id,
  busId: id,
  choferId: id,
  salida: fechaHora,
  anden: entero.min(1),
  estado: z.enum(ESTADOS_VIAJE),
  minutosAtraso: entero.min(0),
});

export const esquemaAsiento: z.ZodType<Asiento> = z.object({
  numero: entero.min(1),
  fila: entero.min(0),
  columna: entero.min(0),
  tipo: z.enum(TIPOS_ASIENTO),
});
