import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { RutasSimple } from './RutasSimple';

describe('RutasSimple', () => {
  it('ofrece un botón por cada viaje de ida y de vuelta', async () => {
    const pantalla = await renderPantalla(
      <RutasSimple alBuscar={jest.fn()} alSalir={jest.fn()} />,
    );
    for (const viaje of [
      'Managua a Boaco',
      'Boaco a Managua',
      'Managua a Juigalpa',
      'Juigalpa a Managua',
    ]) {
      expect(pantalla.getByText(viaje)).toBeTruthy();
    }
  });
});
