import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { MEMORIA_VACIA } from './memoriaIA';
import { useMemoriaIA } from './useMemoriaIA';

describe('useMemoriaIA por defecto', () => {
  it('no recuerda nada y no está activa', async () => {
    const { result } = await renderHook(() => useMemoriaIA());
    expect(result.current.activa).toBe(false);
    expect(result.current.memoria).toEqual(MEMORIA_VACIA);
  });
});
