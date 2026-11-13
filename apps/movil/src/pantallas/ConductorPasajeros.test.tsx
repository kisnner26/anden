import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { ConductorPasajeros } from './ConductorPasajeros';

beforeEach(async () => {
  jest.useFakeTimers({
    advanceTimers: true,
    now: new Date(2026, 10, 12, 14, 0),
  });
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({ choferId: 'cho_2', nombre: 'Marvin', rol: 'conductor' }),
  );
});

afterEach(() => {
  reiniciarMuestra();
  jest.useRealTimers();
});

function dibujar(alAbrirViaje = jest.fn()) {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorBoletos>
        <ConductorPasajeros alAbrirViaje={alAbrirViaje} />
      </ProveedorBoletos>
    </ProveedorSesion>,
  );
}

describe('ConductorPasajeros', () => {
  it('lista las salidas del día aunque todavía no tengan pasajeros', async () => {
    const pantalla = await dibujar();
    expect(
      (await pantalla.findAllByText('Todavía nadie reservó esta salida.'))
        .length,
    ).toBeGreaterThan(0);
  });

  it('abre el viaje al tocar su sección', async () => {
    const alAbrir = jest.fn();
    const pantalla = await dibujar(alAbrir);
    const botones = await pantalla.findAllByRole('button');
    await fireEvent.press(botones[0]!);
    expect(alAbrir).toHaveBeenCalledTimes(1);
  });
});
