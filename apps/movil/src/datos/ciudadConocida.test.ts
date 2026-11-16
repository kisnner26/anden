import { describe, expect, it } from '@jest/globals';

import { ciudadConocida } from './ciudadConocida';

const CIUDADES = ['Managua', 'Boaco', 'Juigalpa'];

describe('ciudadConocida', () => {
  it('deja pasar una ciudad de la lista', () => {
    expect(ciudadConocida('Boaco', CIUDADES, 'Managua')).toBe('Boaco');
  });

  it('usa la de siempre si la ciudad no existe', () => {
    expect(ciudadConocida('Atlantis', CIUDADES, 'Managua')).toBe('Managua');
  });

  it('usa la de siempre si no llega nada', () => {
    expect(ciudadConocida(undefined, CIUDADES, 'Managua')).toBe('Managua');
  });

  it('no acepta una lista de textos como la que a veces entrega el enlace', () => {
    expect(ciudadConocida(['Boaco', 'Juigalpa'], CIUDADES, 'Managua')).toBe(
      'Managua',
    );
  });
});
