import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useAbordaje } from './useAbordaje';

describe('useAbordaje por defecto', () => {
  it('empieza sin registros', async () => {
    const { result } = await renderHook(() => useAbordaje());
    expect(result.current.registro).toEqual({});
  });

  it('nadie ha abordado', async () => {
    const { result } = await renderHook(() => useAbordaje());
    expect(result.current.abordo('bol_1')).toBe(false);
  });

  it('alternar no falla aunque no haya proveedor', async () => {
    const { result } = await renderHook(() => useAbordaje());
    await expect(result.current.alternar('bol_1')).resolves.toBeUndefined();
  });
});
