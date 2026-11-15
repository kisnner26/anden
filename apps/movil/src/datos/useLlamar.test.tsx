import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { Linking } from 'react-native';

import * as servicio from '@/servicios/supabase/comunicacionSupabase';

import { useLlamar } from './useLlamar';

jest.mock('@/servicios/supabase/comunicacionSupabase', () => ({
  telefonoDelChofer: jest.fn(),
  telefonoDelPasajero: jest.fn(),
}));

beforeEach(() => {
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  jest.mocked(Linking.openURL).mockClear();
});

describe('useLlamar', () => {
  it('abre la llamada con el número que dio el servidor, sin mostrarlo', async () => {
    jest.mocked(servicio.telefonoDelPasajero).mockResolvedValue('8888-0003');
    const { result } = await renderHook(() => useLlamar());
    await act(async () => {
      await result.current.alPasajero('bol_1');
    });
    expect(Linking.openURL).toHaveBeenCalledWith('tel:88880003');
    expect(result.current.fallo).toBe(false);
  });

  it('si el servidor no da número, no llama y avisa', async () => {
    jest.mocked(servicio.telefonoDelChofer).mockResolvedValue(null);
    const { result } = await renderHook(() => useLlamar());
    await act(async () => {
      await result.current.alChofer('via_1');
    });
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result.current.fallo).toBe(true);
  });
});
