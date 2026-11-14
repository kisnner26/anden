import { describe, expect, it } from '@jest/globals';

import {
  DISTANCIA_ARRASTRE,
  esArrastreHaciaArriba,
  progresoDeArrastre,
} from './arrastreBoleto';

describe('progresoDeArrastre', () => {
  it('sin mover o hacia abajo no hay avance', () => {
    expect(progresoDeArrastre(0)).toBe(0);
    expect(progresoDeArrastre(40)).toBe(0);
  });

  it('crece con lo que se sube y llega a 1', () => {
    expect(progresoDeArrastre(-DISTANCIA_ARRASTRE / 2)).toBeCloseTo(0.5);
    expect(progresoDeArrastre(-DISTANCIA_ARRASTRE)).toBe(1);
  });

  it('nunca pasa de 1', () => {
    expect(progresoDeArrastre(-1000)).toBe(1);
  });
});

describe('esArrastreHaciaArriba', () => {
  it('reconoce un arrastre claro hacia arriba', () => {
    expect(esArrastreHaciaArriba(3, -30)).toBe(true);
  });

  it('un movimiento chico o hacia abajo no cuenta', () => {
    expect(esArrastreHaciaArriba(0, -4)).toBe(false);
    expect(esArrastreHaciaArriba(0, 30)).toBe(false);
  });

  it('un deslizamiento más de lado que vertical no cuenta', () => {
    expect(esArrastreHaciaArriba(40, -20)).toBe(false);
  });
});
