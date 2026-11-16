import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useSeguridad } from './useSeguridad';

describe('useSeguridad por defecto', () => {
  it('la vigilancia figura como activa pero sin vigilar', async () => {
    const { result } = await renderHook(() => useSeguridad());
    expect(result.current.activa).toBe(true);
    expect(result.current.vigilando).toBe(false);
  });
});
