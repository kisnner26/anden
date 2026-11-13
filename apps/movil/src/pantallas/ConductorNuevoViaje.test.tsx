import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/viajesSupabase', () => ({
  publicarViaje: jest.fn(async () => 'ok'),
  retirarViaje: jest.fn(async () => true),
  leerViajesPublicados: jest.fn(async () => null),
}));

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';
import { publicarViaje } from '@/servicios/supabase/viajesSupabase';

import { ConductorNuevoViaje } from './ConductorNuevoViaje';

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
    }),
  );
});

function dibujar(alPublicar = jest.fn()) {
  return renderPantalla(
    <ProveedorSesion>
      <ConductorNuevoViaje alPublicar={alPublicar} alVolver={() => undefined} />
    </ProveedorSesion>,
  );
}

describe('ConductorNuevoViaje', () => {
  it('no publica sin datos y dice qué falta', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Publicar viaje' }),
    );
    expect(await pantalla.findByText('Elegí una ruta.')).toBeTruthy();
    expect(pantalla.getByText('Escribí la placa del bus.')).toBeTruthy();
    expect(publicarViaje).not.toHaveBeenCalled();
  });

  it('publica el viaje completo con su chofer y vuelve', async () => {
    const alPublicar = jest.fn();
    const pantalla = await dibujar(alPublicar);
    await fireEvent.press((await pantalla.findAllByText(/→/))[0]!);
    await fireEvent.changeText(
      pantalla.getByLabelText('Hora en que se pone en andén (24 h)'),
      '23:59',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Placa del bus'),
      'M 123-456',
    );
    await fireEvent.changeText(pantalla.getByLabelText('Andén'), '4');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Publicar viaje' }),
    );
    await waitFor(() => expect(publicarViaje).toHaveBeenCalledTimes(1));
    const fila = jest.mocked(publicarViaje).mock.calls[0]?.[0];
    expect(fila).toMatchObject({
      anden: 4,
      chofer_id: 'cho_2',
      placa: 'M 123-456',
    });
    await waitFor(() => expect(alPublicar).toHaveBeenCalled());
  });
});
