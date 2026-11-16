import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useHabituales } from './useHabituales';

describe('useHabituales por defecto', () => {
  it('no hay viajes habituales', async () => {
    const { result } = await renderHook(() => useHabituales());
    expect(result.current.habituales).toEqual([]);
  });
});
