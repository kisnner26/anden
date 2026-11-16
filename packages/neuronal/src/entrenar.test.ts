import { describe, expect, it } from 'vitest';

import type { Ejemplo } from './evaluar';
import { evaluar } from './evaluar';
import { entrenar } from './entrenar';
import { crearRed } from './red';

function dosGrupos(): Ejemplo[] {
  const lista: Ejemplo[] = [];
  for (let i = 0; i < 40; i += 1) {
    const t = i / 40;
    lista.push({ clase: 0, entrada: new Float32Array([t, 0.1 + t * 0.1]) });
    lista.push({ clase: 1, entrada: new Float32Array([t, 0.9 - t * 0.1]) });
  }
  return lista;
}

function xor(): Ejemplo[] {
  const lista: Ejemplo[] = [];
  for (let i = 0; i < 20; i += 1) {
    lista.push({ clase: 0, entrada: new Float32Array([0, 0]) });
    lista.push({ clase: 0, entrada: new Float32Array([1, 1]) });
    lista.push({ clase: 1, entrada: new Float32Array([0, 1]) });
    lista.push({ clase: 1, entrada: new Float32Array([1, 0]) });
  }
  return lista;
}

describe('entrenar', () => {
  it('aprende a separar dos grupos de puntos', () => {
    const red = crearRed(2, [8], 2, 3);
    entrenar(red, dosGrupos(), { epocas: 80, semilla: 1 });
    expect(evaluar(red, dosGrupos()).precision).toBeGreaterThan(0.95);
  });

  it('aprende el XOR, que una sola capa no puede', () => {
    const red = crearRed(2, [12], 2, 5);
    entrenar(red, xor(), { epocas: 200, lote: 8, semilla: 2, tasa: 0.02 });
    expect(evaluar(red, xor()).precision).toBe(1);
  });

  it('la pérdida baja de la primera a la última época', () => {
    const red = crearRed(2, [8], 2, 3);
    const historial = entrenar(red, dosGrupos(), { epocas: 40, semilla: 1 });
    expect(historial[historial.length - 1]!.perdida).toBeLessThan(
      historial[0]!.perdida,
    );
  });

  it('devuelve una entrada por época', () => {
    const red = crearRed(2, [4], 2, 3);
    const historial = entrenar(red, dosGrupos(), { epocas: 7 });
    expect(historial.map((h) => h.epoca)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
