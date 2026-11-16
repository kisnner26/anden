import { describe, expect, it } from '@jest/globals';

import { ciudadConocida } from './ciudadConocida';

const CIUDADES = ['Managua', 'Boaco', 'Juigalpa'];

describe('ciudadConocida', () => {
  it('deja pasar una ciudad de la lista', () => {
    expect(ciudadConocida('Boaco', CIUDADES, 'Managua')).toBe('Boaco');
  });
});
