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

  it('con movimiento reducido sigue mostrando el contenido', async () => {
    jest.mocked(useMovimientoReducido).mockReturnValue(true);
    const pantalla = await render(
      <TarjetaIA>
        <Text>quieta</Text>
      </TarjetaIA>,
    );
    expect(pantalla.getByText('quieta')).toBeTruthy();
  });

  it('cambiar entre trabajando y en reposo no pierde el contenido', async () => {
    const pantalla = await render(
      <TarjetaIA>
        <Text>estable</Text>
      </TarjetaIA>,
    );
    await pantalla.rerender(
      <TarjetaIA trabajando>
        <Text>estable</Text>
      </TarjetaIA>,
    );
    expect(pantalla.getByText('estable')).toBeTruthy();
  });
});
