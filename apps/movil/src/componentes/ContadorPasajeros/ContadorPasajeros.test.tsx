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
});
