import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useTurista } from './useTurista';

describe('useTurista por defecto', () => {
  it('la persona no es turista', async () => {
    const { result } = await renderHook(() => useTurista());
    expect(result.current.turista).toBe(false);
  });

  it('cambiar no falla', async () => {
    const { result } = await renderHook(() => useTurista());
    await expect(result.current.cambiar(true)).resolves.toBeUndefined();
  });
});
