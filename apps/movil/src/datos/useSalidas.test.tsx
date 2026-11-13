import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { inicioDelDia, mismoDia, sumarDias } from './dias';
import { reiniciarMuestra, useAhora, useSalidas } from './useSalidas';

// las salidas de muestra dependen de la hora; se fija media tarde para que las ocho de hoy no cruzen la medianoche
beforeEach(() => {
  jest.useFakeTimers({
    advanceTimers: true,
    now: new Date(2026, 10, 12, 14, 0),
  });
});

afterEach(() => {
  reiniciarMuestra();
  jest.useRealTimers();
});

describe('useSalidas', () => {
  it('devuelve las ocho salidas de hoy desde Mayoreo y una próxima salida', async () => {
    const hoy = inicioDelDia(new Date());
    const { result } = await renderHook(() => useSalidas('ter_may', hoy));
    expect(result.current.salidas).toHaveLength(8);
    expect(result.current.proxima?.destino).toBe('Boaco');
  });

  it('sin día trae también los días siguientes', async () => {
    const { result } = await renderHook(() => useSalidas('ter_may'));
    expect(result.current.salidas.length).toBeGreaterThan(8);
  });

  it('sin terminal trae las salidas de todas, para encontrar un viaje por su id', async () => {
    const { result } = await renderHook(() => useSalidas());
    const deBoaco = result.current.salidas.filter(
      (salida) => salida.origen === 'Boaco',
    );
    expect(deBoaco.length).toBeGreaterThan(0);
  });

  it('con un día trae solo las salidas de ese día', async () => {
    const manana = sumarDias(new Date(), 1);
    const { result } = await renderHook(() => useSalidas('ter_may', manana));
    expect(result.current.salidas.length).toBeGreaterThan(0);
    expect(
      result.current.salidas.every((salida) => mismoDia(salida.salida, manana)),
    ).toBe(true);
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
