import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { TarjetaIA } from './TarjetaIA';

jest.mock('@/tema/useMovimientoReducido', () => ({
  useMovimientoReducido: jest.fn(() => false),
}));

beforeEach(() => {
  jest.mocked(useMovimientoReducido).mockReturnValue(false);
});

describe('TarjetaIA', () => {
  it('muestra lo que lleva dentro', async () => {
    const pantalla = await render(
      <TarjetaIA>
        <Text>respuesta</Text>
      </TarjetaIA>,
    );
    expect(pantalla.getByText('respuesta')).toBeTruthy();
  });

  it('funciona mientras la IA trabaja', async () => {
    const pantalla = await render(
      <TarjetaIA trabajando>
        <Text>pensando</Text>
      </TarjetaIA>,
    );
    expect(pantalla.getByText('pensando')).toBeTruthy();
  });
});
