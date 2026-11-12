import { describe, expect, it } from '@jest/globals';

import {
  MINUTOS_RECORDATORIO,
  avisosDeBoletos,
  avisosDeEspera,
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
      id: 'via_1:pronto',
      minutos: 45,
      tipo: 'pronto',
    });
  });

  it('varios asientos del mismo viaje dan un solo aviso', () => {
    const primero = boleto();
    const segundo = {
      ...primero,
      boleto: { ...primero.boleto, asiento: 9, id: 'bol_2' },
    };
    const avisos = avisosDeBoletos([primero, segundo], [salida()], AHORA);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]?.boletoId).toBe('bol_1');
  });

  it('viajes distintos siguen dando un aviso cada uno', () => {
    const primero = boleto();
    const otro = {
      ...primero,
      boleto: { ...primero.boleto, id: 'bol_2', viajeId: 'via_2' },
    };
    const avisos = avisosDeBoletos(
      [primero, otro],
      [salida(), salida({ viajeId: 'via_2' })],
      AHORA,
    );
    expect(avisos.map((aviso) => aviso.id).sort()).toEqual([
      'via_1:pronto',
      'via_2:pronto',
    ]);
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

describe('avisosDeEspera', () => {
  const espera = {
    creadaEn: AHORA.toISOString(),
    destino: 'Boaco',
    viajeId: 'via_1',
  };

  it('avisa que se liberó un asiento con cuántos quedan', () => {
    const avisos = avisosDeEspera([espera], [salida({ asientosLibres: 2 })]);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toMatchObject({
      destino: 'Boaco',
      id: 'via_1:liberado',
      minutos: 2,
      tipo: 'liberado',
    });
  });

  it('no avisa mientras la salida siga llena', () => {
    expect(avisosDeEspera([espera], [salida({ asientosLibres: 0 })])).toEqual(
      [],
    );
  });
});
