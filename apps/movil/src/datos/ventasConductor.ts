import type { RegistroPagos } from '@/servicios/pagos';
import { estadoDePago, resumenDeCobro } from '@/servicios/pagos';

import type { BoletoGuardado } from './reserva';

export interface PasajeroVendido {
  asiento: number;
  boletoId: string;
  nombre: string;
  pagado: boolean;
  plus: boolean;
  precio: number;
}

export interface VentasDeViaje {
  /** boletos que se cancelaron: no cuentan en lo vendido */
  cancelados: number;
  /** lo que ya se cobró en efectivo */
  cobrado: number;
  pagados: number;
  pasajeros: PasajeroVendido[];
  pendiente: number;
  /** todo lo vendido, cobrado o no */
  total: number;
  vendidos: number;
  viajeId: string;
}

/** lo vendido en un viaje: quién compró, cuánto va cobrado y cuánto falta, con los cancelados aparte */
export function resumirVentas(
  boletos: readonly BoletoGuardado[],
  registro: RegistroPagos,
  viajeId: string,
): VentasDeViaje {
  const delViaje = boletos.filter(({ boleto }) => boleto.viajeId === viajeId);
  const validos = delViaje.filter(
    ({ boleto }) => boleto.estado !== 'cancelado',
  );
  const cobro = resumenDeCobro(
    validos.map(({ boleto }) => ({ id: boleto.id, precio: boleto.precio })),
    registro,
  );
  return {
    cancelados: delViaje.length - validos.length,
    cobrado: cobro.cobrado,
    pagados: cobro.pagados,
    pasajeros: validos
      .map(({ boleto, resumen }) => ({
        asiento: boleto.asiento,
        boletoId: boleto.id,
        nombre: boleto.pasajero.nombre,
        pagado: estadoDePago(registro, boleto.id) === 'pagado_efectivo',
        plus: resumen.plus === true,
        precio: boleto.precio,
      }))
      .sort((a, b) => a.asiento - b.asiento),
    pendiente: cobro.pendiente,
    total: cobro.total,
    vendidos: validos.length,
    viajeId,
  };
}

export interface TotalesDeVentas {
  cancelados: number;
  cobrado: number;
  pendiente: number;
  total: number;
  vendidos: number;
  viajes: number;
}

/** la suma de las ventas de varios viajes, para el resumen de arriba */
export function totalesDeVentas(
  ventas: readonly VentasDeViaje[],
): TotalesDeVentas {
  return ventas.reduce<TotalesDeVentas>(
    (suma, v) => ({
      cancelados: suma.cancelados + v.cancelados,
      cobrado: suma.cobrado + v.cobrado,
      pendiente: suma.pendiente + v.pendiente,
      total: suma.total + v.total,
      vendidos: suma.vendidos + v.vendidos,
      viajes: suma.viajes + (v.vendidos > 0 ? 1 : 0),
    }),
    {
      cancelados: 0,
      cobrado: 0,
      pendiente: 0,
      total: 0,
      vendidos: 0,
      viajes: 0,
    },
  );
}
