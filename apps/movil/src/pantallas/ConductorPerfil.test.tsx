import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/datos/fotos', () => ({
  elegirFotoDeGaleria: jest.fn(async () => ({
    tipo: 'elegida',
    uri: 'fotos/nueva.jpg',
  })),
}));
jest.mock('@/datos/almacenFotos', () => ({
  borrarFoto: jest.fn(),
  resolverFoto: (uri: string) => uri,
}));

import { ProveedorPerfil, CLAVE_PERFIL } from '@/datos/ProveedorPerfil';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';

import { ConductorPerfil } from './ConductorPerfil';

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
      usuario: '1002',
    }),
  );
});

function dibujar(alEditar = jest.fn(), alVerPerfilPublico = jest.fn()) {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorPerfil>
        <ConductorPerfil
          alEditar={alEditar}
          alVerPerfilPublico={alVerPerfilPublico}
        />
      </ProveedorPerfil>
    </ProveedorSesion>,
  );
}

describe('ConductorPerfil', () => {
  it('muestra su nombre, su usuario y los datos de servicio', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Marvin Lanzas')).toBeTruthy();
    expect(pantalla.getByText('1002')).toBeTruthy();
    expect(pantalla.getByText('Verificada')).toBeTruthy();
  });

  it('marca como sin completar lo que falta', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Marvin Lanzas');
    expect(pantalla.getAllByText('Sin completar').length).toBeGreaterThan(0);
  });

  it('cambia la foto y la guarda en su perfil', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Cambiar foto' }),
    );
    await waitFor(async () => {
      const guardado = Object.entries(
        await AsyncStorage.multiGet(await AsyncStorage.getAllKeys()),
      )
        .map(([, par]) => par)
        .find(([clave]) => clave.startsWith(CLAVE_PERFIL));
      expect(guardado?.[1]).toContain('fotos/nueva.jpg');
    });
  });

  it('abre la edición de datos y el perfil público', async () => {
    const alEditar = jest.fn();
    const alVer = jest.fn();
    const pantalla = await dibujar(alEditar, alVer);
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Editar mis datos' }),
    );
    expect(alEditar).toHaveBeenCalled();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Así te ven los pasajeros' }),
    );
    expect(alVer).toHaveBeenCalledWith('cho_2');
  });
});
