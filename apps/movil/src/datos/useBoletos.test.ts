import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useBoletos } from './useBoletos';

describe('useBoletos por defecto', () => {
  it('no hay boletos ni se está cargando', async () => {
    const { result } = await renderHook(() => useBoletos());
    expect(result.current.boletos).toEqual([]);
    expect(result.current.cargando).toBe(false);
  });

  it('reservar responde que el viaje no existe', async () => {
    const { result } = await renderHook(() => useBoletos());
    expect(await result.current.reservar('via_1', [])).toEqual({
      error: 'viaje-inexistente',
      ok: false,
    });
  });

  it('agregar, quitar, cancelar y validar no fallan', async () => {
    const { result } = await renderHook(() => useBoletos());
    await expect(result.current.agregar({} as never)).resolves.toBeUndefined();
    await expect(result.current.quitar('bol_1')).resolves.toBeUndefined();
    await expect(result.current.cancelar('bol_1')).resolves.toBeUndefined();
    await expect(result.current.validar('bol_1')).resolves.toBeUndefined();
  });
});
