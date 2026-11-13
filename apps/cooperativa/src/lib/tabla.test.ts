import { describe, expect, it } from 'vitest';

import { aCsv } from './csv';
import { buscar, comparar, ordenar, paginar, totalPaginas } from './tabla';

describe('ordenar', () => {
  it('ordena números como números y textos sin importar tildes', () => {
    expect(ordenar([10, 2, 33], (n) => n, 'asc')).toEqual([2, 10, 33]);
    expect(ordenar(['Óscar', 'ana', 'Boris'], (n) => n, 'asc')).toEqual([
      'ana',
      'Boris',
      'Óscar',
    ]);
    expect(ordenar([1, 3, 2], (n) => n, 'desc')).toEqual([3, 2, 1]);
  });

  it('lo vacío va siempre al final', () => {
    expect(comparar(null, 5)).toBeGreaterThan(0);
    expect(comparar(5, undefined)).toBeLessThan(0);
  });

  it('no modifica la lista original', () => {
    const lista = [3, 1, 2];
    ordenar(lista, (n) => n, 'asc');
    expect(lista).toEqual([3, 1, 2]);
  });
});

describe('buscar', () => {
  const filas = [
    'Ernesto Calero, Managua',
    'Gross Hoowerts, Boaco',
    'María José, Juigalpa',
  ];
  it('exige todas las palabras y no distingue tildes', () => {
    expect(buscar(filas, (f) => f, 'maria jose')).toEqual([
      'María José, Juigalpa',
    ]);
    expect(buscar(filas, (f) => f, 'boaco gross')).toEqual([
      'Gross Hoowerts, Boaco',
    ]);
    expect(buscar(filas, (f) => f, 'calero boaco')).toEqual([]);
  });
  it('sin consulta devuelve todo', () => {
    expect(buscar(filas, (f) => f, '  ')).toHaveLength(3);
  });
});

describe('paginar', () => {
  it('corta por páginas y cuenta cuántas hay', () => {
    const filas = Array.from({ length: 23 }, (_, i) => i);
    expect(paginar(filas, 2, 10)).toEqual([20, 21, 22]);
    expect(totalPaginas(23, 10)).toBe(3);
    expect(totalPaginas(0, 10)).toBe(1);
  });
});

describe('aCsv', () => {
  it('pone comillas donde hace falta y empieza con BOM', () => {
    const csv = aCsv(
      ['a', 'b'],
      [
        ['x, y', 'dijo "hola"'],
        [1, null],
      ],
    );
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"x, y","dijo ""hola"""');
    expect(csv.split('\n')[2]).toBe('1,');
  });
});
