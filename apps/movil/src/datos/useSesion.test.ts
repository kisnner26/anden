import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useSesion } from './useSesion';

describe('useSesion por defecto', () => {
  it('no hay sesión y el rol es pasajero', async () => {
    const { result } = await renderHook(() => useSesion());
    expect(result.current.sesion).toBeNull();
    expect(result.current.rol).toBe('pasajero');
  });
});
