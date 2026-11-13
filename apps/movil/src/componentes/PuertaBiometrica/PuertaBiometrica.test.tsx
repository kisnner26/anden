import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@/datos/biometria', () => ({
  verificacionVigente: jest.fn(() => false),
  verificarConductor: jest.fn(async () => true),
}));

import { verificacionVigente, verificarConductor } from '@/datos/biometria';
import { renderPantalla } from '@/pruebas/render';

import { PuertaBiometrica } from './PuertaBiometrica';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(verificacionVigente).mockReturnValue(false);
  jest.mocked(verificarConductor).mockResolvedValue(true);
});

function dibujar() {
  return renderPantalla(
    <PuertaBiometrica motivo="entrar">
      <Text>adentro</Text>
    </PuertaBiometrica>,
  );
}

describe('PuertaBiometrica', () => {
  it('pide la identidad al abrirse y deja pasar si se confirma', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('adentro')).toBeTruthy();
    expect(verificarConductor).toHaveBeenCalledWith('entrar');
  });

  it('si no se confirma no muestra lo de adentro y deja reintentar', async () => {
    jest.mocked(verificarConductor).mockResolvedValue(false);
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Panel de conductor')).toBeTruthy();
    expect(pantalla.queryByText('adentro')).toBeNull();
    expect(
      await pantalla.findByText(
        'No pudimos confirmar que sos vos. Probá de nuevo.',
      ),
    ).toBeTruthy();

    jest.mocked(verificarConductor).mockResolvedValue(true);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Confirmar que soy yo' }),
    );
    expect(await pantalla.findByText('adentro')).toBeTruthy();
  });

  it('con una verificación reciente entra sin volver a pedirla', async () => {
    jest.mocked(verificacionVigente).mockReturnValue(true);
    const pantalla = await dibujar();
    expect(pantalla.getByText('adentro')).toBeTruthy();
    expect(verificarConductor).not.toHaveBeenCalled();
  });
});
