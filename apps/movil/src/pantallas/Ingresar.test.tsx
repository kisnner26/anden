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

function dibujar(
  alIngresar: (rol: string) => void = () => undefined,
  extras: Partial<Parameters<typeof Ingresar>[0]> = {},
) {
  return renderPantalla(
    <ProveedorSesion>
      <Ingresar alIngresar={alIngresar} {...extras} />
    </ProveedorSesion>,
  );
}

describe('Ingresar', () => {
  it('no pregunta con qué rol se entra ni lo nombra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Entrá con tu cuenta de Andén.')).toBeTruthy();
    expect(pantalla.queryByText(/chofer/i)).toBeNull();
    expect(pantalla.queryByText(/conductor/i)).toBeNull();
    expect(pantalla.queryByText(/pasajero/i)).toBeNull();
    expect(pantalla.getByLabelText('Correo, teléfono o código')).toBeTruthy();
    expect(pantalla.getByLabelText('Contraseña')).toBeTruthy();
  });

  it('no deja ingresar sin datos', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByRole('button', { name: 'Ingresar' }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it('con un código de conductor entra y la cuenta dice que es conductor', async () => {
    const alIngresar = jest.fn();
    const pantalla = await dibujar(alIngresar);
    await fireEvent.changeText(
      pantalla.getByLabelText('Correo, teléfono o código'),
      '1001',
    );
    await fireEvent.changeText(pantalla.getByLabelText('Contraseña'), '2026');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(alIngresar).toHaveBeenCalledWith('conductor'));
  });

  it('con un correo de pasajero entra por la misma pantalla y la cuenta dice que es pasajero', async () => {
    const alIngresar = jest.fn();
    const pantalla = await dibujar(alIngresar);
    await fireEvent.changeText(
      pantalla.getByLabelText('Correo, teléfono o código'),
      'ana@correo.com',
    );
    await fireEvent.changeText(pantalla.getByLabelText('Contraseña'), '2026');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(alIngresar).toHaveBeenCalledWith('pasajero'));
  });

  it('con datos equivocados avisa sin decir cuál falló', async () => {
    const alIngresar = jest.fn();
    const pantalla = await dibujar(alIngresar);
    await fireEvent.changeText(
      pantalla.getByLabelText('Correo, teléfono o código'),
      '1001',
    );
    await fireEvent.changeText(pantalla.getByLabelText('Contraseña'), 'mala');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ingresar' }));
    expect(
      await pantalla.findByText('Los datos no son correctos.'),
    ).toBeTruthy();
    expect(alIngresar).not.toHaveBeenCalled();
  });

  it('oculta la contraseña mientras se escribe', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByLabelText('Contraseña').props.secureTextEntry).toBe(
      true,
    );
  });

  it('ofrece crear una cuenta y seguir sin cuenta cuando se le da cómo', async () => {
    const alCrearCuenta = jest.fn();
    const alInvitado = jest.fn();
    const pantalla = await dibujar(undefined, { alCrearCuenta, alInvitado });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Continuar sin cuenta' }),
    );
    expect(alCrearCuenta).toHaveBeenCalledTimes(1);
    expect(alInvitado).toHaveBeenCalledTimes(1);
  });

  it('sin esas opciones no muestra los enlaces', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryByRole('button', { name: 'Crear cuenta' })).toBeNull();
    expect(
      pantalla.queryByRole('button', { name: 'Continuar sin cuenta' }),
    ).toBeNull();
  });

  it('tocar fuera de los campos cierra el teclado', async () => {
    const cerrar = jest.spyOn(Keyboard, 'dismiss');
    const pantalla = await dibujar();
    await fireEvent.press(pantalla.getByTestId('ingresar-envoltura'));
    expect(cerrar).toHaveBeenCalledTimes(1);
    cerrar.mockRestore();
  });
});
