import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

jest.mock('@/datos/useBoletoEnCurso', () => ({
  useBoletoEnCurso: jest.fn(),
}));

import { useBoletoEnCurso } from '@/datos/useBoletoEnCurso';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { Viajar } from './Viajar';

beforeEach(() => {
  jest.mocked(useBoletoEnCurso).mockReturnValue(null);
});

describe('Viajar con un viaje en curso', () => {
  it('sin viaje en curso no muestra la tarjeta', async () => {
    const pantalla = await renderPantalla(
      <Viajar alAbrirViaje={jest.fn()} alElegirAsiento={jest.fn()} />,
    );
    expect(pantalla.queryByTestId('aviso-viaje-en-curso')).toBeNull();
  });

  it('con el viaje iniciado por el chofer muestra la tarjeta y lleva a seguirlo', async () => {
    jest
      .mocked(useBoletoEnCurso)
      .mockReturnValue(boletoDePrueba(new Date(Date.now() - 10 * 60_000)));
    const alSeguirViaje = jest.fn();
    const pantalla = await renderPantalla(
      <Viajar
        alAbrirViaje={jest.fn()}
        alElegirAsiento={jest.fn()}
        alSeguirViaje={alSeguirViaje}
      />,
    );
    expect(
      pantalla.getByText('Tu bus a Boaco ya salió. Seguilo en el mapa.'),
    ).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Seguir mi viaje/ }),
    );
    expect(alSeguirViaje).toHaveBeenCalledWith('bol_K7RM4QX9');
  });
});
