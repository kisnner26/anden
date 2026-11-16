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

  it('se pausa al pasar a segundo plano', () => {
    const tarea = jest.fn();
    const { cambiar, f } = fuente();
    iniciarSondeo(tarea, 1000, f);
    jest.advanceTimersByTime(2000);
    cambiar('background');
    jest.advanceTimersByTime(5000);
    expect(tarea).toHaveBeenCalledTimes(2);
  });

  it('al volver a la vista refresca al instante y sigue repitiendo', () => {
    const tarea = jest.fn();
    const { cambiar, f } = fuente();
    iniciarSondeo(tarea, 1000, f);
    cambiar('background');
    cambiar('active');
    expect(tarea).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2000);
    expect(tarea).toHaveBeenCalledTimes(3);
  });
});
