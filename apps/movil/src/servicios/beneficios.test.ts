import { describe, expect, it } from '@jest/globals';

import {
  BENEFICIOS_PLUS,
  avisoDisponible,
  limiteDeRecientes,
  puedeGuardarHabitual,
  diasDeAnticipacion,
  puedeReservarSalida,
} from './beneficios';

describe('beneficios de Plus', () => {
  it('hay siete beneficios, cada uno con ícono y sin repetirse', () => {
    expect(BENEFICIOS_PLUS).toHaveLength(7);
    expect(new Set(BENEFICIOS_PLUS.map((b) => b.id)).size).toBe(7);
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

describe('reserva anticipada', () => {
  const ahora = new Date(2026, 10, 12, 10, 0);
  const enDias = (dias: number) => new Date(2026, 10, 12 + dias, 9, 0);

  it('Plus reserva con más días de anticipación', () => {
    expect(diasDeAnticipacion(true)).toBeGreaterThan(diasDeAnticipacion(false));
  });

  it('sin Plus solo se reserva dentro de los próximos días', () => {
    expect(puedeReservarSalida(false, enDias(2), ahora)).toBe(true);
    expect(puedeReservarSalida(false, enDias(3), ahora)).toBe(false);
  });

  it('con Plus se reserva mucho antes', () => {
    expect(puedeReservarSalida(true, enDias(10), ahora)).toBe(true);
    expect(puedeReservarSalida(true, enDias(14), ahora)).toBe(false);
  });
});
