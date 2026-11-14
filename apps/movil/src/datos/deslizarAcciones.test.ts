import { describe, expect, it } from '@jest/globals';

import {
  UMBRAL_ACCION,
  LIMITE_ARRASTRE,
  accionAlSoltar,
  avanceDeAccion,
  limitarArrastre,
} from './deslizarAcciones';

describe('avanceDeAccion', () => {
  it('crece hasta el umbral y ahí se queda en 1', () => {
    expect(avanceDeAccion(0)).toBe(0);
    expect(avanceDeAccion(UMBRAL_ACCION / 2)).toBeCloseTo(0.5);
    expect(avanceDeAccion(-UMBRAL_ACCION * 3)).toBe(1);
  });
});

describe('limitarArrastre', () => {
  it('sigue el dedo hasta el umbral', () => {
    expect(limitarArrastre(40)).toBe(40);
    expect(limitarArrastre(-40)).toBe(-40);
  });

  it('pasado el umbral opone resistencia y no pasa del límite', () => {
    expect(limitarArrastre(UMBRAL_ACCION + 40)).toBeLessThan(
      UMBRAL_ACCION + 40,
    );
    expect(limitarArrastre(1000)).toBe(LIMITE_ARRASTRE);
    expect(limitarArrastre(-1000)).toBe(-LIMITE_ARRASTRE);
  });
});

describe('accionAlSoltar', () => {
  it('sin llegar al umbral no activa nada', () => {
    expect(accionAlSoltar(UMBRAL_ACCION - 1, true, true)).toBeNull();
  });

  it('a la derecha activa la acción de la izquierda y al revés', () => {
    expect(accionAlSoltar(UMBRAL_ACCION, true, true)).toBe('izquierda');
    expect(accionAlSoltar(-UMBRAL_ACCION, true, true)).toBe('derecha');
  });

  it('si ese lado no tiene acción no hace nada', () => {
    expect(accionAlSoltar(UMBRAL_ACCION, false, true)).toBeNull();
    expect(accionAlSoltar(-UMBRAL_ACCION, true, false)).toBeNull();
  });
});
