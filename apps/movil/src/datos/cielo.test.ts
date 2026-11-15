import { describe, expect, it } from '@jest/globals';

import { cieloDelViaje, momentoDelCielo } from './cielo';

const MANAGUA = { lat: 12.13413, lng: -86.1933 };

describe('momentoDelCielo', () => {
  it('a las 5:30 de la mañana está amaneciendo o todavía es de noche', () => {
    const m = momentoDelCielo(new Date('2026-11-15T11:30:00Z'), MANAGUA);
    expect(['noche', 'amanecer']).toContain(m);
  });

  it('a las 6:30 es amanecer', () => {
    expect(momentoDelCielo(new Date('2026-11-15T12:30:00Z'), MANAGUA)).toBe(
      'amanecer',
    );
  });

  it('a las 12 es de día', () => {
    expect(momentoDelCielo(new Date('2026-11-15T18:00:00Z'), MANAGUA)).toBe(
      'dia',
    );
  });

  it('a las 17:15 es atardecer', () => {
    expect(momentoDelCielo(new Date('2026-11-15T23:15:00Z'), MANAGUA)).toBe(
      'atardecer',
    );
  });

  it('a las 21 es de noche', () => {
    expect(momentoDelCielo(new Date('2026-11-16T03:00:00Z'), MANAGUA)).toBe(
      'noche',
    );
  });
});

describe('cieloDelViaje', () => {
  it('un viaje que sale de noche y llega de día pasa por el amanecer', () => {
    const [salida, medio, llegada] = cieloDelViaje(
      new Date('2026-11-15T10:30:00Z'), // 4:30
      180,
      MANAGUA,
    );
    expect(salida).toBe('noche');
    expect(llegada).not.toBe('noche');
    expect(['noche', 'amanecer', 'dia']).toContain(medio);
  });
});
