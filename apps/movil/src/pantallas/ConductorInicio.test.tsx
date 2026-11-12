import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';
import { TRANSMISION } from '@/servicios/transmision';

import { ConductorInicio } from './ConductorInicio';

beforeEach(async () => {
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

afterEach(() => {
  TRANSMISION.detener('via_2');
  reiniciarMuestra();
});

function dibujar(
  alAbrirViaje: (id: string) => void = () => undefined,
  alSalir: () => void = () => undefined,
) {
  return renderPantalla(
    <ProveedorSesion>
      <ConductorInicio alAbrirViaje={alAbrirViaje} alSalir={alSalir} />
    </ProveedorSesion>,
  );
}

describe('ConductorInicio', () => {
  it('saluda al chofer y lista solo sus viajes', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Hola, Marvin Lanzas')).toBeTruthy();
    expect(pantalla.getByText(/^Tus viajes/)).toBeTruthy();
    expect(
      pantalla.getAllByRole('button', { name: /^Abrir el viaje a/ }).length,
    ).toBeGreaterThan(0);
  });

  it('abre el viaje que se toca', async () => {
    const alAbrirViaje = jest.fn();
    const pantalla = await dibujar(alAbrirViaje);
    await pantalla.findByText('Hola, Marvin Lanzas');
    await fireEvent.press(
      pantalla.getAllByRole('button', {
        name: /^Abrir el viaje a/,
      })[0] as never,
    );
    expect(alAbrirViaje).toHaveBeenCalledTimes(1);
  });

  it('marca como en vivo el viaje que se está compartiendo', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Hola, Marvin Lanzas');
    expect(pantalla.queryByText('En vivo')).toBeNull();
    TRANSMISION.iniciar('via_2', 'cho_2');
    expect(await pantalla.findByText('En vivo')).toBeTruthy();
  });

  it('cierra la sesión y avisa para volver a la app de pasajero', async () => {
    const alSalir = jest.fn();
    const pantalla = await dibujar(undefined, alSalir);
    await pantalla.findByText('Hola, Marvin Lanzas');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cerrar sesión' }),
    );
    await waitFor(() => expect(alSalir).toHaveBeenCalledTimes(1));
    expect(await AsyncStorage.getItem('anden.sesion')).toBeNull();
  });
});
