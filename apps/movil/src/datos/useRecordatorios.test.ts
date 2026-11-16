import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useRecordatorios } from './useRecordatorios';

describe('useRecordatorios por defecto', () => {
  it('no hay recordatorios', async () => {
    const { result } = await renderHook(() => useRecordatorios());
    expect(result.current.recordatorios).toEqual([]);
    expect(result.current.de('via_1')).toBeUndefined();
  });

  it('programar responde que falta el permiso', async () => {
    const { result } = await renderHook(() => useRecordatorios());
    expect(await result.current.programar({} as never, 30)).toBe(
      'permiso-negado',
    );
  });

  it('quitar no falla', async () => {
    const { result } = await renderHook(() => useRecordatorios());
    await expect(result.current.quitar('via_1')).resolves.toBeUndefined();
  });
});
