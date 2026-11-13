import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/perfilChoferSupabase', () => ({
  leerPerfilChofer: jest.fn(),
}));

import { leerPerfilChofer } from '@/servicios/supabase/perfilChoferSupabase';

import {
  reiniciarChoferesPublicos,
  useChoferPublico,
} from './useChoferPublico';

beforeEach(() => {
  jest.clearAllMocks();
  reiniciarChoferesPublicos();
});

describe('useChoferPublico', () => {
  it('trae lo que el chofer publicó', async () => {
    jest.mocked(leerPerfilChofer).mockResolvedValue({
      fotoUrl: 'https://cdn/x.jpg',
      nombre: 'Marvin L.',
    });
    const { result } = await renderHook(() => useChoferPublico('cho_2'));
    await waitFor(() => expect(result.current?.nombre).toBe('Marvin L.'));
  });

  it('queda en nulo si no publicó nada', async () => {
    jest.mocked(leerPerfilChofer).mockResolvedValue(null);
    const { result } = await renderHook(() => useChoferPublico('cho_3'));
    await waitFor(() => expect(leerPerfilChofer).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});
