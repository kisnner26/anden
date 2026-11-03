import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { elegirFotoDeGaleria } from '@/datos/fotos';
import { PERFIL_VACIO } from '@/datos/perfil';
import { CLAVE_PERFIL, ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ContextoPerfil, type ValorPerfil } from '@/datos/usePerfil';
import { renderPantalla } from '@/pruebas/render';

import { PerfilUsuario } from './PerfilUsuario';

jest.mock('@/datos/fotos', () => ({ elegirFotoDeGaleria: jest.fn() }));

const galeria = elegirFotoDeGaleria as unknown as {
  mockResolvedValue: (valor: unknown) => void;
};

async function abrir() {
  const pantalla = await renderPantalla(
    <ProveedorPerfil>
      <PerfilUsuario alVolver={() => undefined} />
    </ProveedorPerfil>,
  );
  await waitFor(() => expect(pantalla.getByLabelText('Nombre')).toBeTruthy());
  return pantalla;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('PerfilUsuario', () => {
  it('anuncia mientras carga el perfil', async () => {
    const cargando: ValorPerfil = {
      agregarPasajero: async () => undefined,
      cargando: true,
      guardar: async () => undefined,
      perfil: PERFIL_VACIO,
      quitarPasajero: async () => undefined,
    };
    const pantalla = await renderPantalla(
      <ContextoPerfil.Provider value={cargando}>
        <PerfilUsuario alVolver={() => undefined} />
      </ContextoPerfil.Provider>,
    );
    expect(pantalla.getByText('Cargando tu perfil')).toBeTruthy();
  });

  it('empieza vacío y avisa que los datos quedan en el teléfono', async () => {
    const pantalla = await abrir();
    expect(
      pantalla.getByText('Tus datos se guardan solo en este teléfono.'),
    ).toBeTruthy();
    expect(pantalla.getByText('Todavía no guardaste a nadie.')).toBeTruthy();
  });

  it('guarda nombre y teléfono con formato', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Ana');
    await fireEvent.changeText(pantalla.getByLabelText('Teléfono'), '88881234');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Guardar' }));
    await waitFor(async () => {
      const guardado = JSON.parse(
        (await AsyncStorage.getItem(CLAVE_PERFIL)) ?? '{}',
      ) as { nombre: string; telefono: string };
      expect(guardado.nombre).toBe('Ana');
      expect(guardado.telefono).toBe('+505 8888 1234');
    });
    expect(pantalla.getByText('Guardado · Ana')).toBeTruthy();
  });

  it('avisa de un teléfono inválido y no deja guardar', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(pantalla.getByLabelText('Teléfono'), '123');
    expect(
      pantalla.getByText('Escribí un teléfono de Nicaragua de 8 dígitos.'),
    ).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Guardar' }));
    expect(await AsyncStorage.getItem(CLAVE_PERFIL)).toBeNull();
  });

  it('avisa de un correo inválido', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Correo (opcional)'),
      'ana',
    );
    expect(pantalla.getByText('Ese correo no parece válido.')).toBeTruthy();
  });

  it('rechaza nombres con números sin borrar lo escrito', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Ana 2');
    expect(
      pantalla.getByText('Escribí un nombre de 2 a 80 letras.'),
    ).toBeTruthy();
    expect(pantalla.getByDisplayValue('Ana 2')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Guardar' }).props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it('explica el formato requerido para la cédula', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Cédula (opcional)'),
      '0010101900001A',
    );
    expect(
      pantalla.getByText('Usá el formato 001-010190-0001A.'),
    ).toBeTruthy();
    expect(
      pantalla.getByLabelText('Cédula (opcional)').props['aria-invalid'],
    ).toBe(true);
  });

  it('muestra la foto elegida de la galería', async () => {
    galeria.mockResolvedValue({ tipo: 'elegida', uri: 'file:///foto.jpg' });
    const pantalla = await abrir();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir foto' }),
    );
    await waitFor(() =>
      expect(pantalla.getByTestId('avatar-foto')).toBeTruthy(),
    );
  });

  it('explica cuando no hay permiso para la galería', async () => {
    galeria.mockResolvedValue({ tipo: 'sin-permiso' });
    const pantalla = await abrir();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir foto' }),
    );
    await waitFor(() =>
      expect(
        pantalla.getByText(/no tiene permiso para abrir tu galería/),
      ).toBeTruthy(),
    );
  });

  it('agrega y quita un pasajero guardado', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre del pasajero'),
      'Sofía Mora',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Agregar pasajero' }),
    );
    await waitFor(() => expect(pantalla.getByText('Sofía Mora')).toBeTruthy());
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Quitar Sofía Mora' }),
    );
    await waitFor(() => expect(pantalla.queryByText('Sofía Mora')).toBeNull());
  });

  it('no agrega un pasajero con nombre inválido', async () => {
    const pantalla = await abrir();
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre del pasajero'),
      '7',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Agregar pasajero' }),
    );
    expect(
      pantalla.getByText('Escribí un nombre válido antes de agregarlo.'),
    ).toBeTruthy();
    expect(pantalla.getByDisplayValue('7')).toBeTruthy();
  });
});
