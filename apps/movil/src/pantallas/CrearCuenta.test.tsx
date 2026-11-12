import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { CLAVE_PERFIL } from '@/datos/ProveedorPerfil';
import { ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { renderPantalla } from '@/pruebas/render';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CrearCuenta } from './CrearCuenta';

async function dibujar(alTerminar = jest.fn()) {
  const pantalla = await renderPantalla(
    <ProveedorPerfil>
      <CrearCuenta alTerminar={alTerminar} />
    </ProveedorPerfil>,
  );
  return { alTerminar, pantalla };
}

describe('CrearCuenta', () => {
  it('muestra los errores si falta algo', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    expect(
      pantalla.getByText('Escribí un nombre de 2 a 80 letras.'),
    ).toBeTruthy();
    expect(pantalla.getByText('Escribí tu apellido.')).toBeTruthy();
    expect(alTerminar).not.toHaveBeenCalled();
  });

  it('rechaza un teléfono que no es de Nicaragua', async () => {
    const { pantalla } = await dibujar();
    await fireEvent.changeText(pantalla.getByLabelText('Teléfono'), '123');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    expect(
      pantalla.getByText('Escribí un teléfono de Nicaragua de 8 dígitos.'),
    ).toBeTruthy();
  });

  it('guarda el perfil y termina', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Ana');
    await fireEvent.changeText(pantalla.getByLabelText('Apellido'), 'Lopez');
    await fireEvent.changeText(pantalla.getByLabelText('Teléfono'), '88881234');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    await waitFor(() => expect(alTerminar).toHaveBeenCalledTimes(1));
    const guardado = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_PERFIL)) ?? '{}',
    );
    expect(guardado).toMatchObject({ apellido: 'Lopez', nombre: 'Ana' });
  });

  it('deja omitir la cuenta', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ahora no' }));
    expect(alTerminar).toHaveBeenCalledTimes(1);
  });
});
