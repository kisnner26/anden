import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useRecordatorios } from './useRecordatorios';

describe('useRecordatorios por defecto', () => {
  it('no hay recordatorios', async () => {
    const { result } = await renderHook(() => useRecordatorios());
    expect(result.current.recordatorios).toEqual([]);
    expect(result.current.de('via_1')).toBeUndefined();
  });
});
