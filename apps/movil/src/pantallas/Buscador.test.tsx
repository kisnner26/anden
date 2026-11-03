import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { CLAVE_RECIENTES } from '@/datos/recientes';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Buscador } from './Buscador';

afterEach(async () => {
  reiniciarMuestra();
  await AsyncStorage.clear();
});

function abrir(alAbrirViaje: (id: string) => void = () => undefined) {
  return renderPantalla(
    <Buscador alAbrirViaje={alAbrirViaje} alVolver={() => undefined} />,
  );
}

describe('Buscador', () => {
  it('sin escribir ofrece las rutas frecuentes', async () => {
    const pantalla = await abrir();
    expect(pantalla.getByText('Rutas frecuentes')).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'Boaco' })).toBeTruthy();
  });

  it('escribir filtra las salidas en vivo', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Buscar salidas'),
      'boa',
    );
    expect(pantalla.getByText(/^\d+ salidas?$/)).toBeTruthy();
    expect(pantalla.queryByText('Rutas frecuentes')).toBeNull();
  });

  it('encuentra sin importar las mayúsculas', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Buscar salidas'),
      'JUIGALPA',
    );
    expect(pantalla.getByText(/^\d+ salidas$/)).toBeTruthy();
  });

  it('tocar una ruta frecuente escribe el destino', async () => {
    const pantalla = await abrir();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Boaco' }));
    expect(pantalla.getByLabelText('Buscar salidas').props.value).toBe('Boaco');
  });

  it('filtra por servicio', async () => {
    const pantalla = await abrir();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Expreso' }));
    expect(pantalla.getByText(/^\d+ salidas?$/)).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Expreso' }).props
        .accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('sin coincidencias muestra el bus y deja quitar los filtros', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Buscar salidas'),
      'zzzz',
    );
    expect(pantalla.getByText('No encontramos salidas')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Quitar filtros' }),
    );
    expect(pantalla.getByLabelText('Buscar salidas').props.value).toBe('');
    expect(pantalla.getByText('Rutas frecuentes')).toBeTruthy();
  });

  it('abre la salida elegida', async () => {
    const alAbrirViaje = jest.fn();
    const pantalla = await abrir(alAbrirViaje);
    await fireEvent.changeText(
      pantalla.getByLabelText('Buscar salidas'),
      'boa',
    );
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: /Boaco/ })[0]!,
    );
    expect(alAbrirViaje).toHaveBeenCalledTimes(1);
  });

  it('recuerda la búsqueda al confirmar y la ofrece como reciente', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Buscar salidas'),
      'Juigalpa',
    );
    await fireEvent(pantalla.getByLabelText('Buscar salidas'), 'submitEditing');
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(CLAVE_RECIENTES)).toContain('Juigalpa'),
    );
  });

  it('muestra y borra las búsquedas recientes', async () => {
    await AsyncStorage.setItem(CLAVE_RECIENTES, JSON.stringify(['Rivas']));
    const pantalla = await abrir();
    await waitFor(() => expect(pantalla.getByText('Recientes')).toBeTruthy());
    await fireEvent.press(pantalla.getByRole('button', { name: 'Borrar' }));
    await waitFor(() => expect(pantalla.queryByText('Recientes')).toBeNull());
  });
});
