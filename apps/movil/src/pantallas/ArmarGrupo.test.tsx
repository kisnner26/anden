import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

jest.mock('@/servicios/supabase/grupoSupabase', () => ({
  crearGrupo: jest.fn(),
  verGrupo: jest.fn(),
}));

import { VIAJE_BOACO } from '@/datos/muestra';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';
import * as servicio from '@/servicios/supabase/grupoSupabase';

import { ArmarGrupo } from './ArmarGrupo';

beforeEach(async () => {
  jest.clearAllMocks();
  reiniciarMuestra();
  await AsyncStorage.clear();
  jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
});

function dibujar(alCreado: (codigo: string) => void = () => undefined) {
  return renderPantalla(
    <ArmarGrupo
      alCreado={alCreado}
      alVolver={() => undefined}
      viajeId={VIAJE_BOACO}
    />,
  );
}

describe('ArmarGrupo', () => {
  it('crea el grupo con el cupo elegido, lo comparte y abre su pantalla', async () => {
    jest.mocked(servicio.crearGrupo).mockResolvedValue('AB12CD34');
    const alCreado = jest.fn();
    const p = await dibujar(alCreado);
    await fireEvent.press(p.getByRole('button', { name: '5' }));
    await fireEvent.press(p.getByRole('button', { name: 'Reservar en grupo' }));
    await waitFor(() => expect(alCreado).toHaveBeenCalledWith('AB12CD34'));
    expect(servicio.crearGrupo).toHaveBeenCalledWith(VIAJE_BOACO, 5);
    expect(Share.share).toHaveBeenCalledTimes(1);
    const mensaje = jest.mocked(Share.share).mock.calls[0]![0]
      .message as string;
    expect(mensaje).toContain('anden://grupo/AB12CD34');
  });

  it('si no se pudo crear lo dice y no comparte nada', async () => {
    jest.mocked(servicio.crearGrupo).mockResolvedValue(null);
    const p = await dibujar();
    await fireEvent.press(p.getByRole('button', { name: 'Reservar en grupo' }));
    expect(await p.findByText(/No se pudo crear el grupo/)).toBeTruthy();
    expect(Share.share).not.toHaveBeenCalled();
  });
});
