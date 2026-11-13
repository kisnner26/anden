import { describe, expect, it } from '@jest/globals';

import {
  BENEFICIOS_PLUS,
  avisoDisponible,
  limiteDeRecientes,
  puedeGuardarHabitual,
} from './beneficios';

describe('beneficios de Plus', () => {
  it('hay seis beneficios, cada uno con ícono y sin repetirse', () => {
    expect(BENEFICIOS_PLUS).toHaveLength(6);
    expect(new Set(BENEFICIOS_PLUS.map((b) => b.id)).size).toBe(6);
    expect(BENEFICIOS_PLUS.every((b) => b.icono !== undefined)).toBe(true);
  });

  it('con Plus se recuerdan más búsquedas', () => {
    expect(limiteDeRecientes(false)).toBe(5);
    expect(limiteDeRecientes(true)).toBe(15);
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
