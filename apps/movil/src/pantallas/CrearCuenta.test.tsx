import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { CLAVE_PERFIL } from '@/datos/ProveedorPerfil';
import { ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { crearSesionLocal } from '@/servicios/sesion';
import { CUENTAS_MUESTRA } from '@/servicios/cuentasMuestra';
import { renderPantalla } from '@/pruebas/render';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CrearCuenta } from './CrearCuenta';

const SERVICIO = crearSesionLocal(CUENTAS_MUESTRA);

async function llenar(
  pantalla: Awaited<ReturnType<typeof renderPantalla>>,
  cambios: Record<string, string> = {},
) {
  const campos: Record<string, string> = {
    Nombre: 'Ana',
    Apellido: 'Lopez',
    Usuario: 'ana.lopez',
    Teléfono: '88881234',
    Contraseña: 'andén2026',
    'Repetí la contraseña': 'andén2026',
    ...cambios,
  };
  for (const [etiqueta, valor] of Object.entries(campos)) {
    await fireEvent.changeText(pantalla.getByLabelText(etiqueta), valor);
  }
}

async function dibujar(alTerminar = jest.fn()) {
  const pantalla = await renderPantalla(
    <ProveedorSesion servicio={SERVICIO}>
      <ProveedorPerfil>
        <CrearCuenta alTerminar={alTerminar} />
      </ProveedorPerfil>
    </ProveedorSesion>,
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

  it('crea la cuenta, guarda el perfil, celebra y termina', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await llenar(pantalla);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    expect(await pantalla.findByTestId('cuenta-creada')).toBeTruthy();
    await waitFor(() => expect(alTerminar).toHaveBeenCalledTimes(1), {
      timeout: 4000,
    });
    const guardado = JSON.parse(
      (await AsyncStorage.getItem(`${CLAVE_PERFIL}.ana.lopez`)) ?? '{}',
    );
    expect(guardado).toMatchObject({ apellido: 'Lopez', nombre: 'Ana' });
    expect(
      JSON.parse((await AsyncStorage.getItem('anden.sesion')) ?? '{}'),
    ).toMatchObject({ usuario: 'ana.lopez' });
  });

  it('pide un usuario válido y una contraseña segura', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await llenar(pantalla, { Usuario: 'a b', Contraseña: 'corta' });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    expect(
      pantalla.getByText(/Escribí de 3 a 20 letras sin tilde/),
    ).toBeTruthy();
    expect(pantalla.getByText(/al menos 8 caracteres/)).toBeTruthy();
    expect(alTerminar).not.toHaveBeenCalled();
  });

  it('avisa si las contraseñas no coinciden', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await llenar(pantalla, { 'Repetí la contraseña': 'otra2026clave' });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    expect(pantalla.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    expect(alTerminar).not.toHaveBeenCalled();
  });

  it('avisa si el usuario ya está en uso', async () => {
    const { alTerminar, pantalla } = await dibujar();
    await llenar(pantalla, { Usuario: 'ana' });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Crear cuenta' }),
    );
    expect(
      await pantalla.findByText('Ese usuario ya está en uso. Probá con otro.'),
    ).toBeTruthy();
    expect(alTerminar).not.toHaveBeenCalled();
  });

  it('ya no deja omitir la cuenta', async () => {
    const { pantalla } = await dibujar();
    expect(pantalla.queryByRole('button', { name: 'Ahora no' })).toBeNull();
  });

  it('ofrece registrarse como conductor cuando se da el acceso', async () => {
    const alRegistrarConductor = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorPerfil>
        <CrearCuenta
          alRegistrarConductor={alRegistrarConductor}
          alTerminar={() => undefined}
        />
      </ProveedorPerfil>,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: '¿Sos conductor? Registrate acá' }),
    );
    expect(alRegistrarConductor).toHaveBeenCalledTimes(1);
  });
});
