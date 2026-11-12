import { describe, expect, it } from '@jest/globals';

import {
  MINUTOS_RECORDATORIO,
  avisosDeBoletos,
  momentoRecordatorio,
} from './avisos';
import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

const AHORA = new Date('2026-11-03T14:00:00-06:00');
const EN_MINUTOS = (minutos: number) =>
  new Date(AHORA.getTime() + minutos * 60_000);

function salida(cambios: Partial<Salida> = {}): Salida {
  return {
    anden: 4,
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'GRA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 123456',
    rutaId: 'rut_1',
    salida: EN_MINUTOS(45),
    servicio: 'ordinario',
    tarifa: 46,
    ventaAbierta: true,
    viajeId: 'via_1',
    ...cambios,
  };
}

function boleto(
  estado: BoletoGuardado['boleto']['estado'] = 'vigente',
  anden = 4,
): BoletoGuardado {
  return {
    boleto: {
      asiento: 8,
      codigo: 'ABCD2345',
      compradoEn: AHORA.toISOString(),
      duenoId: 'usu_yo',
      estado,
      id: 'bol_1',
      pasajero: { esMenorEnBrazos: false, nombre: 'Ana' },
      precio: 46,
      viajeId: 'via_1',
    },
    resumen: {
      anden,
      choferId: 'cho_1',
      choferNombre: 'Luis',
      cooperativa: 'Cooperativa',
      destino: 'Boaco',
      metodoPago: 'efectivo-al-abordar',
      placa: 'M 123456',
      salida: EN_MINUTOS(45).toISOString(),
      servicio: 'ordinario',
    },
  };
}

describe('momentoRecordatorio', () => {
  it('es 30 minutos antes de la salida', () => {
    expect(momentoRecordatorio(EN_MINUTOS(90)).getTime()).toBe(
      EN_MINUTOS(90 - MINUTOS_RECORDATORIO).getTime(),
    );
  });

  it('se corre con el atraso del viaje', () => {
    expect(momentoRecordatorio(EN_MINUTOS(90), 15).getTime()).toBe(
      EN_MINUTOS(75).getTime(),
    );
  });
});

describe('avisosDeBoletos', () => {
  it('avisa que el bus sale pronto, con los minutos que faltan', () => {
    const avisos = avisosDeBoletos([boleto()], [salida()], AHORA);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toMatchObject({
      id: 'bol_1:pronto',
      minutos: 45,
      tipo: 'pronto',
    });
  });

  it('no avisa si la salida está lejos', () => {
    const lejos = salida({ salida: EN_MINUTOS(300) });
    expect(avisosDeBoletos([boleto()], [lejos], AHORA)).toEqual([]);
  });

  it('avisa el atraso con sus minutos', () => {
    const atrasada = salida({ estado: 'atrasado', minutosAtraso: 20 });
    const tipos = avisosDeBoletos([boleto()], [atrasada], AHORA).map(
      (aviso) => aviso.tipo,
    );
    expect(tipos).toContain('atraso');
  });

  it('avisa el cambio de andén', () => {
    const avisos = avisosDeBoletos([boleto('vigente', 2)], [salida()], AHORA);
    expect(
      avisos.some((aviso) => aviso.tipo === 'anden' && aviso.anden === 4),
    ).toBe(true);
  });

  it('avisa el viaje cancelado y nada más', () => {
    const cancelada = salida({ estado: 'cancelado' });
    const avisos = avisosDeBoletos([boleto()], [cancelada], AHORA);
    expect(avisos.map((aviso) => aviso.tipo)).toEqual(['cancelado']);
  });

  it('ignora los boletos que no están vigentes', () => {
    expect(avisosDeBoletos([boleto('usado')], [salida()], AHORA)).toEqual([]);
  });

  it('ignora los viajes que ya salieron', () => {
    const pasada = salida({ salida: EN_MINUTOS(-30) });
    expect(avisosDeBoletos([boleto()], [pasada], AHORA)).toEqual([]);
  });

  it('ignora un boleto sin su salida en la muestra', () => {
    expect(avisosDeBoletos([boleto()], [], AHORA)).toEqual([]);
  });
});
