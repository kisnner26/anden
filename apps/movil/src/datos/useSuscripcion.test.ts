import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useSuscripcion } from './useSuscripcion';

describe('useSuscripcion por defecto', () => {
  it('la persona no tiene Plus', async () => {
    const { result } = await renderHook(() => useSuscripcion());
    expect(result.current.plus).toBe(false);
  });

  it('activar y cancelar no fallan', async () => {
    const { result } = await renderHook(() => useSuscripcion());
    await expect(result.current.activar()).resolves.toBeUndefined();
    await expect(result.current.cancelar()).resolves.toBeUndefined();
  });
});
