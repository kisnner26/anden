import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { renderPantalla } from '@/pruebas/render';

import { EscenaViaje } from './EscenaViaje';

const reducido = useReducedMotion as unknown as jest.Mock;

afterEach(() => {
  jest.useRealTimers();
  reducido.mockReturnValue(false);
});

function dibujar(alTerminar: () => void = () => undefined) {
  return renderPantalla(
    <EscenaViaje
      alTerminar={alTerminar}
      destino="Boaco"
      detalle="Rumbo a Boaco."
      tipo="salida"
      titulo="Buen viaje"
    />,
  );
}

describe('EscenaViaje', () => {
  it('muestra el título y el detalle', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Buen viaje')).toBeTruthy();
    expect(pantalla.getByText('Rumbo a Boaco.')).toBeTruthy();
  });

  it('se anuncia como un botón con su título', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByRole('button', { name: 'Buen viaje' })).toBeTruthy();
  });

  it('se cierra al tocarla', async () => {
    const alTerminar = jest.fn();
    const pantalla = await dibujar(alTerminar);
    await fireEvent.press(pantalla.getByTestId('escena-viaje'));
    expect(alTerminar).toHaveBeenCalledTimes(1);
  });

  it('con movimiento reducido se cierra sola enseguida', async () => {
    jest.useFakeTimers();
    reducido.mockReturnValue(true);
    const alTerminar = jest.fn();
    await dibujar(alTerminar);
    expect(alTerminar).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    expect(alTerminar).toHaveBeenCalledTimes(1);
  });
});
