import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useEncomiendas } from './useEncomiendas';

describe('useEncomiendas por defecto', () => {
  it('no hay encomiendas ni se está cargando', async () => {
    const { result } = await renderHook(() => useEncomiendas());
    expect(result.current.encomiendas).toEqual([]);
    expect(result.current.cargando).toBe(false);
  });

  it('enviar responde nulo porque no se pudo enviar', async () => {
    const { result } = await renderHook(() => useEncomiendas());
    expect(await result.current.enviar({} as never)).toBeNull();
  });

  it('cambiar el estado responde que no se cambió', async () => {
    const { result } = await renderHook(() => useEncomiendas());
    expect(await result.current.cambiarEstado('enc_1', 'aceptada')).toBe(false);
  });

  it('recargar no falla', async () => {
    const { result } = await renderHook(() => useEncomiendas());
    await expect(result.current.recargar()).resolves.toBeUndefined();
  });
});
