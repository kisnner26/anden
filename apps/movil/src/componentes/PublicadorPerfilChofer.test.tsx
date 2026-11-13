import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/perfilChoferSupabase', () => ({
  publicarPerfilChofer: jest.fn(async () => null),
  leerPerfilChofer: jest.fn(async () => null),
}));

import { ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';
import { publicarPerfilChofer } from '@/servicios/supabase/perfilChoferSupabase';

import { PublicadorPerfilChofer } from './PublicadorPerfilChofer';

function dibujar() {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorPerfil>
        <PublicadorPerfilChofer />
      </ProveedorPerfil>
    </ProveedorSesion>,
  );
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('PublicadorPerfilChofer', () => {
  it('publica el nombre del conductor al abrir su panel', async () => {
    await AsyncStorage.setItem(
      'anden.sesion',
      JSON.stringify({
        choferId: 'cho_2',
        nombre: 'Marvin Lanzas',
        rol: 'conductor',
      }),
    );
    await dibujar();
    await waitFor(() =>
      expect(publicarPerfilChofer).toHaveBeenCalledWith(
        'cho_2',
        'Marvin Lanzas',
        null,
      ),
    );
  });

  it('no publica nada para un pasajero', async () => {
    await AsyncStorage.setItem(
      'anden.sesion',
      JSON.stringify({ nombre: 'Ana Ruiz', rol: 'pasajero', usuario: 'ana' }),
    );
    await dibujar();
    await new Promise((r) => setTimeout(r, 50));
    expect(publicarPerfilChofer).not.toHaveBeenCalled();
  });
});
