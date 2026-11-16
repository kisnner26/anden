import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useFavoritos } from './useFavoritos';

describe('useFavoritos por defecto', () => {
  it('empieza sin favoritos', async () => {
    const { result } = await renderHook(() => useFavoritos());
    expect(result.current.favoritos).toEqual([]);
  });

  it('nada es favorito', async () => {
    const { result } = await renderHook(() => useFavoritos());
    expect(result.current.esFavorito('via_1')).toBe(false);
  });
});
