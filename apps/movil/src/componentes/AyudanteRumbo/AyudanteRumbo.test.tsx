import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';

let mockRuta = '/viajar';
jest.mock('expo-router', () => ({ usePathname: () => mockRuta }));

import { emitirSenal } from '@/datos/senalesDeAyuda';
import { ContextoMascota, type ValorMascota } from '@/datos/useMascota';
import { renderPantalla } from '@/pruebas/render';

import { AyudanteRumbo } from './AyudanteRumbo';

function dibujar(activa = true) {
  const valor: ValorMascota = {
    activa,
    cambiar: async () => undefined,
    marcar: () => undefined,
    vistos: {},
  };
  return renderPantalla(
    <ContextoMascota.Provider value={valor}>
      <AyudanteRumbo />
    </ContextoMascota.Provider>,
  );
}

beforeEach(() => {
  mockRuta = '/viajar';
});

describe('AyudanteRumbo', () => {
  it('no se ve para nada mientras todo va bien', async () => {
    const p = await dibujar();
    expect(p.queryByTestId('ayudante-rumbo')).toBeNull();
    expect(
      p.queryByRole('button', { name: 'Rumbo quiere ayudarte' }),
    ).toBeNull();
  });

  it('una señal suelta de poco peso no lo asoma', async () => {
    const p = await dibujar();
    await act(async () => {
      emitirSenal('errorFormulario');
    });
    expect(
      p.queryByRole('button', { name: 'Rumbo quiere ayudarte' }),
    ).toBeNull();
  });

  it('con varios errores seguidos asoma los ojos', async () => {
    const p = await dibujar();
    await act(async () => {
      emitirSenal('errorFormulario');
      emitirSenal('errorIngreso');
    });
    expect(
      await p.findByRole('button', { name: 'Rumbo quiere ayudarte' }),
    ).toBeTruthy();
  });

  it('al tocar los ojos se transforma y da la ayuda del problema', async () => {
    const p = await dibujar();
    await act(async () => {
      emitirSenal('reservaFallida');
      emitirSenal('errorFormulario');
    });
    await fireEvent.press(
      await p.findByRole('button', { name: 'Rumbo quiere ayudarte' }),
    );
    expect(
      await p.findByLabelText(/Ese asiento se ocupó justo antes/),
    ).toBeTruthy();
  });

  it('apagado en los ajustes nunca aparece', async () => {
    const p = await dibujar(false);
    await act(async () => {
      emitirSenal('toquesRepetidos');
    });
    expect(p.queryByTestId('ayudante-rumbo')).toBeNull();
  });

  it('en la portada de inicio no sale', async () => {
    mockRuta = '/';
    const p = await dibujar();
    await act(async () => {
      emitirSenal('toquesRepetidos');
    });
    expect(p.queryByTestId('ayudante-rumbo')).toBeNull();
  });
});
