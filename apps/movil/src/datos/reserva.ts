import {
  error,
  generarCodigo,
  ok,
  precioOficial,
  puedeRetener,
  type Boleto,
  type Ocupacion,
  type Resultado,
  type TipoServicio,
} from '@anden/dominio';

import type { DatosMuestra } from './muestra';

/** persona que usa la app; hasta que haya cuentas (T-053) es un identificador fijo */
export const DUENO_RESERVA = 'usu_yo';

export interface PasajeroReserva {
  asiento: number;
  cedula?: string;
  nombre: string;
}

/** lo que se necesita para mostrar un boleto aunque el viaje cambie después */
export interface ResumenBoleto {
  anden: number;
  choferId: string;
  choferNombre: string;
  cooperativa: string;
  destino: string;
  metodoPago: 'efectivo-al-abordar';
  placa: string;
  salida: string;
  servicio: TipoServicio;
}

export interface BoletoGuardado {
  boleto: Boleto;
  resumen: ResumenBoleto;
}

type ErrorRetencion = Extract<
  ReturnType<typeof puedeRetener>,
  { ok: false }
>['error'];

export type ErrorReserva =
  ErrorRetencion | 'faltan-nombres' | 'sin-tarifa' | 'viaje-inexistente';

const LARGO_MINIMO_NOMBRE = 2;

/**
 * arma un boleto por pasajero para reservar con pago en efectivo al abordar; no cobra nada: la tarifa
 * oficial sale del tarifario y la regla de asientos y de cierre de venta es la del dominio
 */
export function crearReserva(
  datos: DatosMuestra,
  viajeId: string,
  pasajeros: readonly PasajeroReserva[],
  ahora: Date,
  aleatorio: () => number,
): Resultado<BoletoGuardado[], ErrorReserva> {
  const viaje = datos.viajes.find((candidato) => candidato.id === viajeId);
  const ruta = datos.rutas.find((candidata) => candidata.id === viaje?.rutaId);
  const bus = datos.buses.find((candidato) => candidato.id === viaje?.busId);
  const chofer = datos.choferes.find(
    (candidato) => candidato.id === viaje?.choferId,
  );
  const destino = datos.terminales.find(
    (terminal) => terminal.id === ruta?.destinoId,
  );
  if (!viaje || !ruta || !bus || !chofer || !destino) {
    return error('viaje-inexistente');
  }

  if (
    pasajeros.length === 0 ||
    pasajeros.some((p) => p.nombre.trim().length < LARGO_MINIMO_NOMBRE)
  ) {
    return error('faltan-nombres');
  }

  const retencion = puedeRetener(
    viaje,
    bus.configuracion,
    datos.ocupaciones.filter((ocupacion) => ocupacion.viajeId === viaje.id),
    pasajeros.map((p) => p.asiento),
    DUENO_RESERVA,
    ahora,
  );
  if (!retencion.ok) return error(retencion.error);

  const precio = precioOficial(
    datos.tarifario,
    ruta.id,
    bus.servicio,
    { desde: 0, hasta: ruta.paradas.length - 1 },
    pasajeros.map(() => ({ esMenorEnBrazos: false, nombre: 'pasajero' })),
  );
  if (!precio.ok) return error('sin-tarifa');

  const resumen: ResumenBoleto = {
    anden: viaje.anden,
    choferId: chofer.id,
    choferNombre: chofer.nombre,
    cooperativa: bus.cooperativa,
    destino: destino.ciudad,
    metodoPago: 'efectivo-al-abordar',
    placa: bus.placa,
    salida: viaje.salida,
    servicio: bus.servicio,
  };

  const usados = new Set<string>();
  const boletos = pasajeros.map<BoletoGuardado>((pasajero) => {
    let codigo = generarCodigo(aleatorio);
    while (usados.has(codigo)) codigo = generarCodigo(aleatorio);
    usados.add(codigo);
    const cedula = pasajero.cedula?.trim();
    return {
      boleto: {
        asiento: pasajero.asiento,
        codigo,
        compradoEn: ahora.toISOString(),
        duenoId: DUENO_RESERVA,
        estado: 'vigente',
        id: `bol_${codigo}`,
        pasajero: {
          ...(cedula ? { cedula } : {}),
          esMenorEnBrazos: false,
          nombre: pasajero.nombre.trim(),
        },
        precio: precio.valor.unitario,
        viajeId: viaje.id,
      },
      resumen,
    };
  });

  return ok(boletos);
}

/** los asientos reservados pasan a ocupados para que el plano del viaje los muestre como tomados */
export function ocupacionesDe(boletos: readonly BoletoGuardado[]): Ocupacion[] {
  return boletos.map(({ boleto }) => ({
    asiento: boleto.asiento,
    boletoId: boleto.id,
    duenoId: boleto.duenoId,
    estado: 'vendido',
    viajeId: boleto.viajeId,
  }));
}
