import { describe, expect, it } from '@jest/globals';

import type { BoletoGuardado } from './reserva';
import { resumenAnual } from './resumenAnual';

const AHORA = new Date('2026-11-15T12:00:00');

function viaje(
  destino: string,
  salida: string,
  asiento = 1,
  precio = 50,
): BoletoGuardado {
  return {
    boleto: { asiento, estado: 'vigente', id: `b${salida}`, precio },
    resumen: { destino, salida: new Date(salida).toISOString() },
  } as unknown as BoletoGuardado;
}

describe('resumenAnual', () => {
  it('sin viajes todo queda vacío', () => {
    const r = resumenAnual([], 2026, AHORA);
    expect(r.viajes).toBe(0);
    expect(r.horaFavorita).toBeNull();
    expect(r.asientoFavorito).toBeNull();
  });

  it('cuenta solo los viajes del año pedido', () => {
    const r = resumenAnual(
      [
        viaje('Boaco', '2026-03-02T06:00:00'),
        viaje('Boaco', '2025-03-02T06:00:00'),
      ],
      2026,
      AHORA,
    );
    expect(r.viajes).toBe(1);
  });

  it('dice la hora, el asiento y el día más repetidos', () => {
    const r = resumenAnual(
      [
        viaje('Boaco', '2026-03-02T06:00:00', 8),
        viaje('Boaco', '2026-03-09T06:00:00', 8),
        viaje('Managua', '2026-03-12T17:00:00', 3),
      ],
      2026,
      AHORA,
    );
    expect(r.horaFavorita).toBe(6);
    expect(r.asientoFavorito).toBe(8);
    expect(r.diaFavorito).toBe(1);
    expect(r.destinoFavorito).toBe('Boaco');
    expect(r.ciudades.sort()).toEqual(['Boaco', 'Managua']);
  });

  it('suma lo gastado y ignora lo que todavía no sale', () => {
    const r = resumenAnual(
      [
        viaje('Boaco', '2026-03-02T06:00:00', 1, 66),
        viaje('Boaco', '2026-12-20T06:00:00', 1, 66),
      ],
      2026,
      AHORA,
    );
    expect(r.gastado).toBe(66);
    expect(r.viajes).toBe(1);
  });
});
