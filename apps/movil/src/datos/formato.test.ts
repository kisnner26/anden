import { describe, expect, it } from '@jest/globals';

import {
  formatoDuracion,
  formatoFechaCorta,
  formatoHora,
  formatoHoraCompleta,
} from './formato';

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

describe('formatoDuracion', () => {
  it('muestra solo minutos si dura menos de una hora', () => {
    expect(formatoDuracion(40)).toBe('40 min');
  });

  it('muestra horas y minutos', () => {
    expect(formatoDuracion(95)).toBe('1 h 35 min');
  });

  it('muestra solo horas si no sobran minutos', () => {
    expect(formatoDuracion(120)).toBe('2 h');
  });
});

describe('formatoFechaCorta', () => {
  it('muestra el lunes 2 de noviembre de 2026', () => {
    expect(formatoFechaCorta(new Date(2026, 10, 2))).toBe('lun 2 nov');
  });

  it('muestra el sábado 31 de enero', () => {
    expect(formatoFechaCorta(new Date(2026, 0, 31))).toBe('sáb 31 ene');
  });
});
