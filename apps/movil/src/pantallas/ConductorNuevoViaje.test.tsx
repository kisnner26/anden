import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/viajesSupabase', () => ({
  publicarViaje: jest.fn(async () => 'ok'),
  retirarViaje: jest.fn(async () => true),
  leerViajesPublicados: jest.fn(async () => null),
}));

jest.mock('@/datos/ubicacion', () => ({
  obtenerUbicacionActual: jest.fn(async () => ({ estado: 'denegado' })),
}));

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { obtenerUbicacionActual } from '@/datos/ubicacion';
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
    await fireEvent.changeText(
      pantalla.getByLabelText('Punto de encuentro (Plus Code)'),
      '764M4PPX+HH',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Publicar viaje' }),
    );
    await waitFor(() => expect(publicarViaje).toHaveBeenCalledTimes(1));
    const fila = jest.mocked(publicarViaje).mock.calls[0]?.[0];
    expect(fila).toMatchObject({
      punto_encuentro: '764M4PPX+HH',
      chofer_id: 'cho_2',
      placa: 'M 123-456',
    });
    await waitFor(() => expect(alPublicar).toHaveBeenCalled());
  });

  it('llena el punto de encuentro con el Plus Code de donde está el conductor', async () => {
    jest.mocked(obtenerUbicacionActual).mockResolvedValueOnce({
      estado: 'otorgado',
      punto: { lat: 12.1364, lng: -86.2514 },
    });
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Usar mi ubicación' }),
    );
    await waitFor(() =>
      expect(
        pantalla.getByLabelText('Punto de encuentro (Plus Code)').props.value,
      ).toBe('764M4PPX+HC'),
    );
    expect(obtenerUbicacionActual).toHaveBeenCalledWith(true);
  });

  it('avisa si no se pudo leer la ubicación', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Usar mi ubicación' }),
    );
    expect(
      await pantalla.findByText(/No pudimos leer tu ubicación/),
    ).toBeTruthy();
  });
});
