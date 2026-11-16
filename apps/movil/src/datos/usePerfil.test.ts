import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { PERFIL_VACIO } from './perfil';
import { usePerfil } from './usePerfil';

describe('usePerfil por defecto', () => {
  it('el perfil está vacío y no se está cargando', async () => {
    const { result } = await renderHook(() => usePerfil());
    expect(result.current.perfil).toEqual(PERFIL_VACIO);
    expect(result.current.cargando).toBe(false);
  });
});
