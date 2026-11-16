import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { gustosDeViaje, SIN_GUSTOS } from './gustosDeViaje';
import type { BoletoGuardado } from './reserva';

function boleto(
  hora: number,
  minuto = 0,
  servicio: 'expreso' | 'ordinario' = 'ordinario',
  estado: 'cancelado' | 'vigente' = 'vigente',
): BoletoGuardado {
  const base = boletoDePrueba(new Date(2026, 10, 2, hora, minuto));
  return {
    boleto: { ...base.boleto, estado },
    resumen: { ...base.resumen, servicio },
  };
}

describe('gustosDeViaje', () => {
  it('no concluye nada con un solo viaje', () => {
    expect(gustosDeViaje([boleto(6)])).toEqual({ ...SIN_GUSTOS, viajes: 1 });
  });

  it('saca la hora de salida habitual', () => {
    const gustos = gustosDeViaje([boleto(6), boleto(6, 30), boleto(7)]);
    expect(gustos.horaPreferida).toBe(6 * 60 + 30);
    expect(gustos.viajes).toBe(3);
  });




});
