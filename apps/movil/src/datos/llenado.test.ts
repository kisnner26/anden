import { describe, expect, it } from '@jest/globals';

import { llenadoDe } from './llenado';

describe('llenadoDe', () => {
  it('cuenta lo vendido y lo que falta', () => {
    const l = llenadoDe({ asientosLibres: 6, asientosTotales: 30 });
    expect(l).toEqual({ faltan: 6, proporcion: 0.8, total: 30, vendidos: 24 });
  });

  it('un bus lleno no falta nada', () => {
    expect(llenadoDe({ asientosLibres: 0, asientosTotales: 30 })?.faltan).toBe(
      0,
    );
  });

  it('sin el total de asientos no se puede calcular', () => {
    expect(llenadoDe({ asientosLibres: 6 })).toBeNull();
  });

  it('nunca pasa del total', () => {
    expect(llenadoDe({ asientosLibres: 40, asientosTotales: 30 })?.faltan).toBe(
      30,
    );
  });
});
