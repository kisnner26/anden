import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { AppStateStatus } from 'react-native';

import { iniciarSondeo, type FuenteDeEstado } from './sondeo';

function fuente(inicial: AppStateStatus = 'active') {
  let oyente: ((estado: AppStateStatus) => void) | null = null;
  const remove = jest.fn();
  const f: FuenteDeEstado = {
    addEventListener: (_tipo, alCambiar) => {
      oyente = alCambiar;
      return { remove };
    },
    currentState: inicial,
  };
  return { cambiar: (e: AppStateStatus) => oyente?.(e), f, remove };
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('iniciarSondeo', () => {
  it('repite la tarea mientras la app está a la vista', () => {
    const tarea = jest.fn();
    const { f } = fuente();
    iniciarSondeo(tarea, 1000, f);
    jest.advanceTimersByTime(3000);
    expect(tarea).toHaveBeenCalledTimes(3);
  });

  it('no arranca si la app ya está en segundo plano', () => {
    const tarea = jest.fn();
    const { f } = fuente('background');
    iniciarSondeo(tarea, 1000, f);
    jest.advanceTimersByTime(5000);
    expect(tarea).not.toHaveBeenCalled();
  });
});
