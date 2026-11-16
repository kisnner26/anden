import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useBloqueo } from './useBloqueo';

describe('useBloqueo por defecto', () => {
  it('la app no está bloqueada', async () => {
    const { result } = await renderHook(() => useBloqueo());
    expect(result.current.bloqueado).toBe(false);
    expect(result.current.activo).toBe(false);
  });
});
