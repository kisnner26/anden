import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';
import { t } from '@/textos/t';

import { AjusteClaudePuente } from './AjusteClaudePuente';

const mockServicio = {
  borrarPuente: jest.fn(async () => undefined),
  guardarPuente: jest.fn(async () => undefined),
  leerPuente: jest.fn(
    async (): Promise<{ codigo: string; url: string } | null> => null,
  ),
  probarPuente: jest.fn(async () => true),
};

jest.mock('@/servicios/puenteClaude', () => ({
  ...(jest.requireActual('@/servicios/puenteClaude') as object),
  borrarPuente: () => mockServicio.borrarPuente(),
  guardarPuente: (p: unknown) => mockServicio.guardarPuente(p as never),
  leerPuente: () => mockServicio.leerPuente(),
  probarPuente: () => mockServicio.probarPuente(),
}));

const CODIGO = 'ab12'.repeat(12);

beforeEach(() => {
  jest.clearAllMocks();
  mockServicio.leerPuente.mockResolvedValue(null);
  mockServicio.probarPuente.mockResolvedValue(true);
});

describe('AjusteClaudePuente', () => {
  it('empieza desconectado con los dos campos y el botón', async () => {
    const pantalla = await renderPantalla(<AjusteClaudePuente />);
    expect(pantalla.getByLabelText(t('claudePuente.direccion'))).toBeTruthy();
    expect(pantalla.getByLabelText(t('claudePuente.codigo'))).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: t('claudePuente.conectar') }),
    ).toBeTruthy();
  });

  it('con datos inválidos avisa y no intenta conectar', async () => {
    const pantalla = await renderPantalla(<AjusteClaudePuente />);
    await fireEvent.changeText(
      pantalla.getByLabelText(t('claudePuente.direccion')),
      'http://8.8.8.8:4780',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText(t('claudePuente.codigo')),
      'corto',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('claudePuente.conectar') }),
    );
    expect(await pantalla.findByText(t('claudePuente.datosMal'))).toBeTruthy();
    expect(mockServicio.probarPuente).not.toHaveBeenCalled();
  });

  it('si el puente no responde lo dice y no guarda nada', async () => {
    mockServicio.probarPuente.mockResolvedValue(false);
    const pantalla = await renderPantalla(<AjusteClaudePuente />);
    await fireEvent.changeText(
      pantalla.getByLabelText(t('claudePuente.direccion')),
      'http://192.168.1.52:4780',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText(t('claudePuente.codigo')),
      CODIGO,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('claudePuente.conectar') }),
    );
    expect(
      await pantalla.findByText(t('claudePuente.noResponde')),
    ).toBeTruthy();
    expect(mockServicio.guardarPuente).not.toHaveBeenCalled();
  });

  it('si responde guarda la dirección y el código y queda conectado', async () => {
    const pantalla = await renderPantalla(<AjusteClaudePuente />);
    await fireEvent.changeText(
      pantalla.getByLabelText(t('claudePuente.direccion')),
      'http://192.168.1.52:4780/',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText(t('claudePuente.codigo')),
      CODIGO,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('claudePuente.conectar') }),
    );
    expect(await pantalla.findByText(t('claudePuente.conectado'))).toBeTruthy();
    expect(mockServicio.guardarPuente).toHaveBeenCalledWith({
      codigo: CODIGO,
      url: 'http://192.168.1.52:4780',
    });
  });

  it('si ya había un puente guardado arranca conectado', async () => {
    mockServicio.leerPuente.mockResolvedValue({
      codigo: CODIGO,
      url: 'http://192.168.1.52:4780',
    });
    const pantalla = await renderPantalla(<AjusteClaudePuente />);
    expect(await pantalla.findByText(t('claudePuente.conectado'))).toBeTruthy();
  });

  it('desconectar borra lo guardado y vuelve a pedir los datos', async () => {
    mockServicio.leerPuente.mockResolvedValue({
      codigo: CODIGO,
      url: 'http://192.168.1.52:4780',
    });
    const pantalla = await renderPantalla(<AjusteClaudePuente />);
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: t('claudePuente.desconectar'),
      }),
    );
    await waitFor(() =>
      expect(mockServicio.borrarPuente).toHaveBeenCalledTimes(1),
    );
    expect(
      await pantalla.findByLabelText(t('claudePuente.direccion')),
    ).toBeTruthy();
  });
});
