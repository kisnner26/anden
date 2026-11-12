import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';

import { Ingresar } from './Ingresar';

beforeEach(async () => {
  await AsyncStorage.clear();
});

function dibujar(alIngresar: () => void = () => undefined) {
  return renderPantalla(
    <ProveedorSesion>
      <Ingresar alIngresar={alIngresar} alVolver={() => undefined} />
    </ProveedorSesion>,
  );
}

describe('Ingresar', () => {
  it('explica que es para choferes y que el pasajero no la necesita', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText(/Para choferes de una cooperativa/)).toBeTruthy();
    expect(pantalla.getByText('Modo de prueba')).toBeTruthy();
  });

  it('no deja ingresar sin código ni clave', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByRole('button', { name: 'Ingresar' }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it('entra con las credenciales correctas', async () => {
    const alIngresar = jest.fn();
    const pantalla = await dibujar(alIngresar);
    await fireEvent.changeText(
      pantalla.getByLabelText('Código de chofer'),
      '1001',
    );
    await fireEvent.changeText(pantalla.getByLabelText('Clave'), '2026');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(alIngresar).toHaveBeenCalledTimes(1));
  });

  it('avisa si el código o la clave no son correctos', async () => {
    const alIngresar = jest.fn();
    const pantalla = await dibujar(alIngresar);
    await fireEvent.changeText(
      pantalla.getByLabelText('Código de chofer'),
      '1001',
    );
    await fireEvent.changeText(pantalla.getByLabelText('Clave'), 'mala');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ingresar' }));
    expect(
      await pantalla.findByText('El código o la clave no son correctos.'),
    ).toBeTruthy();
    expect(alIngresar).not.toHaveBeenCalled();
  });

  it('oculta la clave mientras se escribe', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByLabelText('Clave').props.secureTextEntry).toBe(true);
  });

  it('tocar fuera de los campos cierra el teclado', async () => {
    const cerrar = jest.spyOn(Keyboard, 'dismiss');
    const pantalla = await dibujar();
    await fireEvent.press(pantalla.getByTestId('ingresar-envoltura'));
    expect(cerrar).toHaveBeenCalledTimes(1);
    cerrar.mockRestore();
  });
});
