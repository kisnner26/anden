import { z } from 'zod';

import {
  COMODIDADES,
  CONFIGURACIONES_BUS,
  ESTADOS_BOLETO,
  ESTADOS_VIAJE,
  ETIQUETAS_CALIFICACION,
  TIPOS_ASIENTO,
  TIPOS_SERVICIO,
  type Asiento,
  type Boleto,
  type Bus,
  type Calificacion,
  type Chofer,
  type Coordenadas,
  type Ocupacion,
  type Parada,
  type Pasajero,
  type PosicionBus,
  type Retencion,
  type Ruta,
  type Tarifa,
  type Terminal,
  type Tramo,
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

export const esquemaTramo: z.ZodType<Tramo> = z
  .object({
    desde: entero.min(0),
    hasta: entero.min(0),
  })
  .refine((tramo) => tramo.desde < tramo.hasta, {
    message: 'el inicio debe ser anterior al final',
  });

export const esquemaTarifa: z.ZodType<Tarifa> = z
  .object({
    rutaId: id,
    servicio: z.enum(TIPOS_SERVICIO),
    desdeParada: entero.min(0),
    hastaParada: entero.min(0),
    cordobas: entero.positive(),
    resolucion: texto,
  })
  .refine((tarifa) => tarifa.desdeParada < tarifa.hastaParada, {
    message: 'el inicio debe ser anterior al final',
  });

export const esquemaBus: z.ZodType<Bus> = z.object({
  id,
  placa: texto,
  cooperativa: texto,
  servicio: z.enum(TIPOS_SERVICIO),
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

export const esquemaRetencion: z.ZodType<Retencion> = z.object({
  id,
  viajeId: id,
  asientos: z.array(entero.min(1)).min(1),
  expira: fechaHora,
  duenoId: id,
});

export const esquemaOcupacion: z.ZodType<Ocupacion> = z.discriminatedUnion(
  'estado',
  [
    z.object({
      viajeId: id,
      asiento: entero.min(1),
      estado: z.literal('retenido'),
      duenoId: id,
      expira: fechaHora,
    }),
    z.object({
      viajeId: id,
      asiento: entero.min(1),
      estado: z.literal('vendido'),
      duenoId: id,
      boletoId: id,
    }),
  ],
);

export const esquemaPasajero: z.ZodType<Pasajero> = z.object({
  nombre: texto,
  cedula: texto.optional(),
  esMenorEnBrazos: z.boolean(),
});

export const esquemaBoleto: z.ZodType<Boleto> = z.object({
  id,
  codigo: z.string().regex(/^[A-Z0-9]{8}$/),
  viajeId: id,
  duenoId: id,
  asiento: entero.min(1),
  pasajero: esquemaPasajero,
  precio: entero.min(0),
  estado: z.enum(ESTADOS_BOLETO),
  compradoEn: fechaHora,
});

export const esquemaCalificacion: z.ZodType<Calificacion> = z.object({
  boletoId: id,
  choferId: id,
  estrellas: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  etiquetas: z.array(z.enum(ETIQUETAS_CALIFICACION)),
});

export const esquemaPosicionBus: z.ZodType<PosicionBus> = z.object({
  viajeId: id,
  coordenadas: esquemaCoordenadas,
  registradaEn: fechaHora,
});
