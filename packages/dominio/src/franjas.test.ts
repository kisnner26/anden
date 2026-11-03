import { describe, expect, it } from 'vitest';

import { franjaHoraria, horaEnManagua } from './franjas';

/** una hora de Managua en un día cualquiera */
function managua(hora: number, minuto = 0): Date {
  return new Date(
    `2026-11-03T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00-06:00`,
  );
}

describe('horaEnManagua', () => {
  it('convierte desde UTC al reloj de Managua', () => {
    expect(horaEnManagua(new Date('2026-11-03T18:30:00Z'))).toBe(12);
  });

  it('pasa al día anterior pasada la medianoche UTC', () => {
    expect(horaEnManagua(new Date('2026-11-03T03:00:00Z'))).toBe(21);
  });
});

describe('franjaHoraria', () => {
  it('00:00 es madrugada', () => {
    expect(franjaHoraria(managua(0))).toBe('madrugada');
  });

  it('05:59 todavía es madrugada', () => {
    expect(franjaHoraria(managua(5, 59))).toBe('madrugada');
  });

  it('06:00 empieza la mañana', () => {
    expect(franjaHoraria(managua(6))).toBe('manana');
  });

  it('11:59 todavía es mañana', () => {
    expect(franjaHoraria(managua(11, 59))).toBe('manana');
  });

  it('12:00 empieza la tarde', () => {
    expect(franjaHoraria(managua(12))).toBe('tarde');
  });

  it('18:00 empieza la noche', () => {
    expect(franjaHoraria(managua(18))).toBe('noche');
  });

  it('23:59 todavía es noche', () => {
    expect(franjaHoraria(managua(23, 59))).toBe('noche');
  });
});
