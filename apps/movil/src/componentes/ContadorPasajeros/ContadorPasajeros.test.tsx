import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { selectionAsync } from 'expo-haptics';

import { t } from '@/textos/t';

import { ContadorPasajeros, MAXIMO_PASAJEROS } from './ContadorPasajeros';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

describe('ContadorPasajeros', () => {
  it('muestra la cantidad en singular con un pasajero', async () => {
    const pantalla = await render(
      <ContadorPasajeros alCambiar={jest.fn()} cantidad={1} />,
    );
    expect(pantalla.getByText('1')).toBeTruthy();
    expect(pantalla.getByText(t('rutas.pasajero'))).toBeTruthy();
  });

  it('muestra el plural con más de uno', async () => {
    const pantalla = await render(
      <ContadorPasajeros alCambiar={jest.fn()} cantidad={3} />,
    );
    expect(pantalla.getByText(t('rutas.pasajeros'))).toBeTruthy();
  });

  it('más sube la cantidad de a uno', async () => {
    const alCambiar = jest.fn();
    const pantalla = await render(
      <ContadorPasajeros alCambiar={alCambiar} cantidad={2} />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('rutas.masPasajeros') }),
    );
    expect(alCambiar).toHaveBeenCalledWith(3);
  });

  it('menos baja la cantidad de a uno', async () => {
    const alCambiar = jest.fn();
    const pantalla = await render(
      <ContadorPasajeros alCambiar={alCambiar} cantidad={2} />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('rutas.menosPasajeros') }),
    );
    expect(alCambiar).toHaveBeenCalledWith(1);
  });

  it('con un pasajero el botón de menos está apagado y no cambia nada', async () => {
    const alCambiar = jest.fn();
    const pantalla = await render(
      <ContadorPasajeros alCambiar={alCambiar} cantidad={1} />,
    );
    const menos = pantalla.getByRole('button', {
      name: t('rutas.menosPasajeros'),
    });
    expect(menos.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
    await fireEvent.press(menos);
    expect(alCambiar).not.toHaveBeenCalled();
  });
});
