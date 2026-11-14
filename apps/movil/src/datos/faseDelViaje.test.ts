import { describe, expect, it } from '@jest/globals';

import { faseDeActividad } from './faseDelViaje';

describe('faseDeActividad', () => {
  it.each([
    ['programado', 'espera'],
    ['abordando', 'abordando'],
    ['atrasado', 'atrasado'],
    ['en-ruta', 'ruta'],
    ['llego', 'llego'],
  ])('%s -> %s', (estado, fase) => {
    expect(faseDeActividad(estado)).toBe(fase);
  });

  it('un estado desconocido o ausente cuenta como en espera', () => {
    expect(faseDeActividad(undefined)).toBe('espera');
    expect(faseDeActividad('raro')).toBe('espera');
  });
});
