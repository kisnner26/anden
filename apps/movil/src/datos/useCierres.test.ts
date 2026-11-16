import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useCierres } from './useCierres';

describe('useCierres por defecto', () => {
  it('no hay cierres', async () => {
    const { result } = await renderHook(() => useCierres());
    expect(result.current.cierres).toEqual([]);
  });
});
