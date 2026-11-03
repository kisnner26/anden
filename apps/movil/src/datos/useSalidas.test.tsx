import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { reiniciarMuestra, useAhora, useSalidas } from './useSalidas';

afterEach(() => {
  reiniciarMuestra();
  jest.useRealTimers();
});

describe('useSalidas', () => {
  it('devuelve las ocho salidas y una próxima salida', async () => {
    const { result } = await renderHook(() => useSalidas());
    expect(result.current.salidas).toHaveLength(8);
    expect(result.current.proxima?.destino).toBe('Boaco');
  });

  it('comparte la misma muestra entre llamadas', async () => {
    const primera = await renderHook(() => useSalidas());
    const segunda = await renderHook(() => useSalidas());
    expect(segunda.result.current.datos).toBe(primera.result.current.datos);
  });
});

describe('useAhora', () => {
  it('avanza con el intervalo indicado', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useAhora(1000));
    const inicio = result.current.getTime();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.getTime()).toBeGreaterThanOrEqual(inicio + 1000);
  });
});
