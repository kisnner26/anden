import { describe, expect, it } from '@jest/globals';

import { formatoHora, formatoHoraCompleta } from './formato';

function a(hora: number, minuto: number): Date {
  return new Date(2026, 10, 2, hora, minuto);
}

describe('formatoHora', () => {
  it('pasa las 14:40 a 2:40', () => {
    expect(formatoHora(a(14, 40))).toBe('2:40');
  });

  it('muestra la medianoche como 12:05', () => {
    expect(formatoHora(a(0, 5))).toBe('12:05');
  });

  it('conserva el cero de los minutos', () => {
    expect(formatoHora(a(9, 3))).toBe('9:03');
  });
});

describe('formatoHoraCompleta', () => {
  it('agrega p. m. por la tarde', () => {
    expect(formatoHoraCompleta(a(14, 40))).toBe('2:40 p. m.');
  });

  it('agrega a. m. por la mañana y a las 12:00 es p. m.', () => {
    expect(formatoHoraCompleta(a(9, 3))).toBe('9:03 a. m.');
    expect(formatoHoraCompleta(a(12, 0))).toBe('12:00 p. m.');
  });
});
