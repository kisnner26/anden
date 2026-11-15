import { describe, expect, it } from '@jest/globals';

import { bloquesDelDia } from './diaDelChofer';
import type { Salida } from './salidas';

const DIA = new Date(2026, 10, 15);

function viaje(
  id: string,
  hora: number,
  placa = 'M 1',
  destino = 'Boaco',
  dia = DIA,
): Salida {
  return {
    destino,
    origen: 'Managua',
    placa,
    salida: new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora, 0),
    viajeId: id,
  } as unknown as Salida;
}

const nunca = () => false;

describe('bloquesDelDia', () => {
  it('solo entran los viajes de ese día', () => {
    const b = bloquesDelDia(
      [viaje('a', 8), viaje('b', 8, 'M 1', 'Boaco', new Date(2026, 10, 16))],
      DIA,
      nunca,
      nunca,
    );
    expect(b.map((x) => x.viajeId)).toEqual(['a']);
  });

  it('el bloque va de la salida a la llegada sobre el eje de 5 a 23', () => {
    const b = bloquesDelDia([viaje('a', 14)], DIA, nunca, nunca)[0]!;
    expect(b.inicio).toBeCloseTo((14 - 5) / 18, 5);
    expect(b.fin).toBeGreaterThan(b.inicio);
  });

  it('marca si cerró, va en vivo o está pendiente', () => {
    const b = bloquesDelDia(
      [viaje('a', 6), viaje('b', 10), viaje('c', 16)],
      DIA,
      (id) => id === 'b',
      (id) => id === 'a',
    );
    expect(b.map((x) => x.estado)).toEqual(['cerrado', 'enVivo', 'pendiente']);
  });

  it('dos viajes de la misma unidad que se pisan se marcan como choque', () => {
    const b = bloquesDelDia([viaje('a', 8), viaje('b', 9)], DIA, nunca, nunca);
    expect(b.every((x) => x.solapa)).toBe(true);
  });

  it('otra unidad a la misma hora no choca, ni la misma unidad con tiempo de sobra', () => {
    const b = bloquesDelDia(
      [viaje('a', 8), viaje('b', 8, 'M 2'), viaje('c', 16)],
      DIA,
      nunca,
      nunca,
    );
    expect(b.some((x) => x.solapa)).toBe(false);
  });

  it('una hora fuera del eje se recorta a los bordes', () => {
    const b = bloquesDelDia([viaje('a', 3)], DIA, nunca, nunca)[0]!;
    expect(b.inicio).toBe(0);
  });
});
