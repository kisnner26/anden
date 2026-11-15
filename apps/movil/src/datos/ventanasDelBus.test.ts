import { describe, expect, it } from '@jest/globals';

import { ventanasEncendidas } from './ventanasDelBus';

describe('ventanasEncendidas', () => {
  it('vacío no enciende ninguna y lleno las enciende todas', () => {
    expect(ventanasEncendidas(0)).toBe(0);
    expect(ventanasEncendidas(1)).toBe(8);
  });

  it('con un solo pasajero ya se ve una ventana', () => {
    expect(ventanasEncendidas(1 / 30)).toBe(1);
  });

  it('a la mitad enciende la mitad', () => {
    expect(ventanasEncendidas(0.5)).toBe(4);
  });

  it('no se pasa de los límites', () => {
    expect(ventanasEncendidas(-1)).toBe(0);
    expect(ventanasEncendidas(3)).toBe(8);
  });
});
