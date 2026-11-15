import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { formatoCuenta, useCuentaRegresiva } from './useCuentaRegresiva';

afterEach(() => {
  jest.useRealTimers();
});

describe('formatoCuenta', () => {
  it('muestra diez minutos como 10:00', () => {
    expect(formatoCuenta(600)).toBe('10:00');
  });

  it('completa con ceros los segundos y los minutos', () => {
    expect(formatoCuenta(65)).toBe('01:05');
    expect(formatoCuenta(0)).toBe('00:00');
  });
});

describe('useCuentaRegresiva', () => {
  it('baja un segundo por segundo', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useCuentaRegresiva(10));
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(7);
  });

  it('se detiene en cero', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useCuentaRegresiva(2));
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(0);
  });

  it('vuelve a empezar cuando cambia la ronda', async () => {
    jest.useFakeTimers();
    const { rerender, result } = await renderHook(
      ({ ronda }: { ronda: number }) => useCuentaRegresiva(10, ronda),
      { initialProps: { ronda: 0 } },
    );
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current).toBe(6);
    await rerender({ ronda: 1 });
    expect(result.current).toBe(10);
  });
});
