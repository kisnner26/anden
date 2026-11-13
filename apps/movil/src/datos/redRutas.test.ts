import { describe, expect, it } from '@jest/globals';

import { corredorDe, invertirSentido, seleccionDe } from './redRutas';

describe('redRutas', () => {
  it('la ida sale de Managua y la vuelta llega a Managua', () => {
    expect(corredorDe({ ciudad: 'Boaco', sentido: 'ida' })).toMatchObject({
      destino: 'Boaco',
      origen: 'Managua',
    });
    expect(corredorDe({ ciudad: 'Juigalpa', sentido: 'vuelta' })).toMatchObject(
      {
        destino: 'Managua',
        origen: 'Juigalpa',
      },
    );
  });

  it('la selección de un corredor devuelve su ciudad y su sentido', () => {
    expect(
      seleccionDe(corredorDe({ ciudad: 'Juigalpa', sentido: 'ida' })),
    ).toEqual({
      ciudad: 'Juigalpa',
      sentido: 'ida',
    });
    expect(
      seleccionDe(corredorDe({ ciudad: 'Boaco', sentido: 'vuelta' })),
    ).toEqual({
      ciudad: 'Boaco',
      sentido: 'vuelta',
    });
  });

  it('invertir cambia solo el sentido', () => {
    expect(invertirSentido({ ciudad: 'Boaco', sentido: 'ida' })).toEqual({
      ciudad: 'Boaco',
      sentido: 'vuelta',
    });
  });
});
