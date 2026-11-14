import { describe, expect, it } from '@jest/globals';

import { progresoHaciaSalida } from './progresoBoleto';

describe('progresoHaciaSalida', () => {
  it('lejos de la salida la barra está vacía', () => {
    expect(progresoHaciaSalida(600)).toBe(0);
    expect(progresoHaciaSalida(181)).toBe(0);
  });

  it('a la mitad de la ventana va por la mitad', () => {
    expect(progresoHaciaSalida(90)).toBe(0.5);
  });

  it('al salir o después está llena', () => {
    expect(progresoHaciaSalida(0)).toBe(1);
    expect(progresoHaciaSalida(-5)).toBe(1);
  });

  it('acepta otra ventana', () => {
    expect(progresoHaciaSalida(30, 60)).toBe(0.5);
  });
});
