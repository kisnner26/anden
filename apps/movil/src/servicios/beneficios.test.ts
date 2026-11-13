import { describe, expect, it } from '@jest/globals';

import {
  BENEFICIOS_PLUS,
  avisoDisponible,
  puedeGuardarHabitual,
} from './beneficios';

describe('beneficios de Plus', () => {
  it('hay cuatro beneficios, cada uno con ícono', () => {
    expect(BENEFICIOS_PLUS).toHaveLength(4);
    expect(new Set(BENEFICIOS_PLUS.map((b) => b.id)).size).toBe(4);
  });

  it('sin Plus solo cabe un viaje habitual', () => {
    expect(puedeGuardarHabitual(false, 0)).toBe(true);
    expect(puedeGuardarHabitual(false, 1)).toBe(false);
  });

  it('con Plus no hay límite de habituales', () => {
    expect(puedeGuardarHabitual(true, 50)).toBe(true);
  });

  it('sin Plus solo está el aviso de 30 minutos', () => {
    expect(avisoDisponible(false, 30)).toBe(true);
    expect(avisoDisponible(false, 15)).toBe(false);
    expect(avisoDisponible(false, 60)).toBe(false);
  });

  it('con Plus están todos los avisos', () => {
    for (const minutos of [15, 30, 60]) {
      expect(avisoDisponible(true, minutos)).toBe(true);
    }
  });
});
