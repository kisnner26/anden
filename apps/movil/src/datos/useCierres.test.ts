import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useCierres } from './useCierres';

describe('useCierres por defecto', () => {
  it('no hay cierres', async () => {
    const { result } = await renderHook(() => useCierres());
    expect(result.current.cierres).toEqual([]);
  });

  it('ningún viaje figura como cerrado', async () => {
    const { result } = await renderHook(() => useCierres());
    expect(result.current.cierreDe('via_1')).toBeUndefined();
  });

  it('cerrar no falla', async () => {
    const { result } = await renderHook(() => useCierres());
    await expect(result.current.cerrar({} as never)).resolves.toBeUndefined();
  });
});
