import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { pasosDeGuia } from '@/datos/guiaConductor';
import { renderPantalla } from '@/pruebas/render';

import { GuiaConductor } from './GuiaConductor';

const PASOS = pasosDeGuia({
  cerrados: 0,
  conFoto: false,
  nombreListo: true,
  viajesPublicados: 1,
  vioPasajeros: false,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('GuiaConductor', () => {
  it('lista los cuatro pasos y cuántos lleva', async () => {
    const pantalla = await renderPantalla(<GuiaConductor pasos={PASOS} />);
    expect(
      await pantalla.findByText('Tus primeros pasos como conductor'),
    ).toBeTruthy();
    expect(pantalla.getByText('1 de 4 listos')).toBeTruthy();
    expect(pantalla.getByText('Publicá tu primer viaje')).toBeTruthy();
    expect(pantalla.getByText('Cerrá tu primer viaje')).toBeTruthy();
  });

  it('se puede ocultar y no vuelve a aparecer', async () => {
    const pantalla = await renderPantalla(<GuiaConductor pasos={PASOS} />);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Ocultar' }),
    );
    await waitFor(() =>
      expect(
        pantalla.queryByText('Tus primeros pasos como conductor'),
      ).toBeNull(),
    );
    expect(await AsyncStorage.getItem('anden.guiaConductorCerrada')).toBe('1');
  });
});
