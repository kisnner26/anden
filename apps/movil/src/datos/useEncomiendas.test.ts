import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useEncomiendas } from './useEncomiendas';

describe('useEncomiendas por defecto', () => {
  it('no hay encomiendas ni se está cargando', async () => {
    const { result } = await renderHook(() => useEncomiendas());
    expect(result.current.encomiendas).toEqual([]);
    expect(result.current.cargando).toBe(false);
  });
});
