import { describe, expect, it } from '@jest/globals';

import { enVentanaDeLlamada, mensajeDeBusqueda } from './comunicacion';

const SALIDA = new Date('2026-11-15T12:00:00');

function conHoras(horas: number): Date {
  return new Date(SALIDA.getTime() + horas * 3_600_000);
}

describe('enVentanaDeLlamada', () => {
  it('desde 2 horas antes de la salida', () => {
    expect(enVentanaDeLlamada(SALIDA, conHoras(-2))).toBe(true);
    expect(enVentanaDeLlamada(SALIDA, conHoras(-2.5))).toBe(false);
  });

  it('hasta 12 horas después', () => {
    expect(enVentanaDeLlamada(SALIDA, conHoras(12))).toBe(true);
    expect(enVentanaDeLlamada(SALIDA, conHoras(13))).toBe(false);
  });

  it('en plena salida', () => {
    expect(enVentanaDeLlamada(SALIDA, SALIDA)).toBe(true);
  });
});

describe('mensajeDeBusqueda', () => {
  it('cuenta los asientos que quedan', () => {
    expect(mensajeDeBusqueda(6)).toBe('Salgo ya, quedan 6 asientos');
  });

  it('en singular cuando queda uno', () => {
    expect(mensajeDeBusqueda(1)).toBe('Salgo ya, queda 1 asiento');
  });
});
