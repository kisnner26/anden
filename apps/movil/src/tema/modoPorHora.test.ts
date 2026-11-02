import { describe, expect, it } from '@jest/globals';

import { modoPorHora } from './modoPorHora';

function a(hora: number, minuto = 0): Date {
  return new Date(2026, 10, 2, hora, minuto);
}

describe('modoPorHora', () => {
  it('es claro a mediodía', () => {
    expect(modoPorHora(a(12))).toBe('claro');
  });

  it('pasa a oscuro justo a las 18:00', () => {
    expect(modoPorHora(a(17, 59))).toBe('claro');
    expect(modoPorHora(a(18, 0))).toBe('oscuro');
  });

  it('es oscuro de madrugada', () => {
    expect(modoPorHora(a(0))).toBe('oscuro');
    expect(modoPorHora(a(3, 30))).toBe('oscuro');
  });

  it('vuelve a claro justo a las 06:00', () => {
    expect(modoPorHora(a(5, 59))).toBe('oscuro');
    expect(modoPorHora(a(6, 0))).toBe('claro');
  });
});
