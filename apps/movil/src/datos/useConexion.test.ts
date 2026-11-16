import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useConexion } from './useConexion';

describe('useConexion por defecto', () => {
  it('figura en línea y sin haber vuelto', async () => {
    const { result } = await renderHook(() => useConexion());
    expect(result.current.enLinea).toBe(true);
    expect(result.current.recienVuelta).toBe(false);
  });
});
