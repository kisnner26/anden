import { describe, expect, it } from '@jest/globals';

import { franjaDe, mapaDeCalor } from './mapaDeCalor';
import type { Salida } from './salidas';

const HOY = new Date(2026, 10, 15, 0, 0);
const MANANA = new Date(2026, 10, 16, 0, 0);
const AHORA = new Date(2026, 10, 15, 5, 0);

function salida(
  dia: Date,
  hora: number,
  libres: number,
  total: number | null = 30,
): Salida {
  const s = new Date(dia);
  s.setHours(hora, 0, 0, 0);
  return {
    asientosLibres: libres,
    asientosTotales: total ?? undefined,
    estado: 'programado',
    salida: s,
    viajeId: `v${dia.getDate()}-${hora}`,
  } as unknown as Salida;
}

describe('franjaDe', () => {
  it('parte el día en cuatro', () => {
    expect(franjaDe(new Date(2026, 10, 15, 5))).toBe('madrugada');
    expect(franjaDe(new Date(2026, 10, 15, 9))).toBe('manana');
    expect(franjaDe(new Date(2026, 10, 15, 15))).toBe('tarde');
    expect(franjaDe(new Date(2026, 10, 15, 21))).toBe('noche');
  });
});

describe('mapaDeCalor', () => {
  it('da una celda por día y franja', () => {
    expect(mapaDeCalor([], [HOY, MANANA], AHORA)).toHaveLength(8);
  });

  it('una franja sin salidas queda vacía', () => {
    const c = mapaDeCalor([], [HOY], AHORA)[0]!;
    expect(c).toMatchObject({ holgura: null, salidas: 0 });
  });

  it('la holgura es la proporción de asientos libres', () => {
    const c = mapaDeCalor([salida(HOY, 9, 15)], [HOY], AHORA).find(
      (x) => x.franja === 'manana',
    )!;
    expect(c.holgura).toBeCloseTo(0.5, 5);
    expect(c.libres).toBe(15);
  });

  it('junta las salidas de una misma franja', () => {
    const c = mapaDeCalor(
      [salida(HOY, 8, 10), salida(HOY, 10, 20)],
      [HOY],
      AHORA,
    ).find((x) => x.franja === 'manana')!;
    expect(c.salidas).toBe(2);
    expect(c.holgura).toBeCloseTo(0.5, 5);
  });

  it('sin el total de asientos no inventa una proporción', () => {
    const c = mapaDeCalor([salida(HOY, 9, 15, null)], [HOY], AHORA).find(
      (x) => x.franja === 'manana',
    )!;
    expect(c.salidas).toBe(1);
    expect(c.holgura).toBeNull();
  });

  it('no cuenta lo que ya salió', () => {
    const c = mapaDeCalor([salida(HOY, 3, 10)], [HOY], AHORA).find(
      (x) => x.franja === 'madrugada',
    )!;
    expect(c.salidas).toBe(0);
  });

  it('cada salida cae en el día que le toca', () => {
    const celdas = mapaDeCalor([salida(MANANA, 15, 5)], [HOY, MANANA], AHORA);
    expect(celdas.filter((c) => c.salidas > 0)).toHaveLength(1);
    expect(celdas.find((c) => c.salidas > 0)?.dia.getDate()).toBe(16);
  });
});
