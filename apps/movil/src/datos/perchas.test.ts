import { describe, expect, it } from '@jest/globals';

import { perchasUtiles, type Percha } from './perchas';

const LIMITES = {
  altoMascota: 55,
  anchoMascota: 64,
  anchoVentana: 400,
  pisoY: 700,
  topeY: 60,
};

const percha = (x: number, y: number, ancho: number, alto = 100): Percha => ({
  rect: { alto, ancho, x, y },
  ref: { current: null },
});

describe('perchasUtiles', () => {
  it('acepta una tarjeta ancha y bien ubicada', () => {
    expect(perchasUtiles([percha(16, 300, 368)], LIMITES)).toHaveLength(1);
  });

  it('descarta las que no dejan lugar encima, las angostas y las que se salen de la ventana', () => {
    const lista = [
      percha(16, 80, 368),
      percha(16, 300, 90),
      percha(300, 300, 200),
      percha(16, 300, 368),
    ];
    expect(perchasUtiles(lista, LIMITES)).toHaveLength(1);
  });

  it('descarta las que quedan por debajo del piso', () => {
    expect(perchasUtiles([percha(16, 750, 368)], LIMITES)).toHaveLength(0);
  });
});
