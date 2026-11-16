import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useAppActiva } from './useAppActiva';

let oyente: ((estado: string) => void) | null = null;
const remove = jest.fn();
const original = AppState.currentState;

afterEach(() => {
  jest.restoreAllMocks();
  (AppState as { currentState: string }).currentState = original;
  oyente = null;
  remove.mockClear();
});

function simular(inicial: string) {
  (AppState as { currentState: string }).currentState = inicial;
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((
    _tipo: string,
    alCambiar: (estado: string) => void,
  ) => {
    oyente = alCambiar;
    return { remove };
  }) as never);
}

describe('useAppActiva', () => {
  it('empieza activa si la app está a la vista', async () => {
    simular('active');
    const { result } = await renderHook(() => useAppActiva());
    expect(result.current).toBe(true);
  });
});
