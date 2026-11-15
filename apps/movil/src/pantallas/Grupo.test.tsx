import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/grupoSupabase', () => ({
  crearGrupo: jest.fn(),
  verGrupo: jest.fn(),
}));

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { VIAJE_BOACO } from '@/datos/muestra';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';
import * as servicio from '@/servicios/supabase/grupoSupabase';

import { Grupo } from './Grupo';

beforeEach(async () => {
  jest.clearAllMocks();
  reiniciarMuestra();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({ nombre: 'Ana Ruiz', rol: 'pasajero' }),
  );
});

function dibujar(alElegirAsiento: (id: string) => void = () => undefined) {
  return renderPantalla(
    <ProveedorSesion>
      <Grupo
        alElegirAsiento={alElegirAsiento}
        alVolver={() => undefined}
        codigo="AB12CD34"
      />
    </ProveedorSesion>,
  );
}

const ESTADO = {
  cupo: 4,
  expira_en: '2026-11-15T12:00:00Z',
  miembros: [
    { asiento: 7, nombre: 'Ana' },
    { asiento: 8, nombre: 'Luis' },
  ],
  vencido: false,
  viaje_id: VIAJE_BOACO,
};

describe('Grupo', () => {
  it('muestra el avance y quiénes ya eligieron, solo con el primer nombre', async () => {
    jest.mocked(servicio.verGrupo).mockResolvedValue(ESTADO);
    const p = await dibujar();
    expect(await p.findByText('Luis')).toBeTruthy();
    expect(p.getAllByText('2 de 4 ya eligieron').length).toBeGreaterThan(0);
    expect(p.getByText('Asiento 7')).toBeTruthy();
  });

  it('el botón lleva a elegir asiento en el viaje del grupo', async () => {
    jest.mocked(servicio.verGrupo).mockResolvedValue(ESTADO);
    const alElegirAsiento = jest.fn();
    const p = await dibujar(alElegirAsiento);
    await fireEvent.press(
      await p.findByRole('button', { name: 'Elegir mi asiento' }),
    );
    expect(alElegirAsiento).toHaveBeenCalledWith(VIAJE_BOACO);
  });

  it('un grupo vencido ya no deja elegir', async () => {
    jest
      .mocked(servicio.verGrupo)
      .mockResolvedValue({ ...ESTADO, vencido: true });
    const p = await dibujar();
    expect(await p.findByText(/ya venció/)).toBeTruthy();
    expect(p.queryByRole('button', { name: 'Elegir mi asiento' })).toBeNull();
  });

  it('si no existe lo dice', async () => {
    jest.mocked(servicio.verGrupo).mockResolvedValue(null);
    const p = await dibujar();
    expect(await p.findByText('No encontramos este grupo.')).toBeTruthy();
  });
});
