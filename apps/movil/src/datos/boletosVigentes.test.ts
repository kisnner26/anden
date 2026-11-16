import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { boletosVigentes } from './boletosVigentes';

describe('boletosVigentes', () => {
  it('deja solo los vigentes', () => {
    const vigente = boletoDePrueba(new Date(2026, 10, 20, 9, 0), 1, 'AAAA1111');
    const usado = boletoDePrueba(new Date(2026, 10, 19, 9, 0), 2, 'BBBB2222');
    usado.boleto = { ...usado.boleto, estado: 'usado' };
    expect(boletosVigentes([usado, vigente])).toEqual([vigente]);
  });

  it('pone adelante el que sale primero', () => {
    const tarde = boletoDePrueba(new Date(2026, 10, 20, 18, 0), 1, 'AAAA1111');
    const temprano = boletoDePrueba(
      new Date(2026, 10, 20, 6, 0),
      2,
      'BBBB2222',
    );
    expect(boletosVigentes([tarde, temprano])).toEqual([temprano, tarde]);
  });

  it('no cambia la lista que recibe', () => {
    const tarde = boletoDePrueba(new Date(2026, 10, 20, 18, 0), 1, 'AAAA1111');
    const temprano = boletoDePrueba(
      new Date(2026, 10, 20, 6, 0),
      2,
      'BBBB2222',
    );
    const lista = [tarde, temprano];
    boletosVigentes(lista);
    expect(lista).toEqual([tarde, temprano]);
  });

  it('sin boletos devuelve una lista vacía', () => {
    expect(boletosVigentes([])).toEqual([]);
  });

  it('deja fuera los cancelados', () => {
    const cancelado = boletoDePrueba(
      new Date(2026, 10, 20, 6, 0),
      1,
      'CCCC3333',
    );
    cancelado.boleto = { ...cancelado.boleto, estado: 'cancelado' };
    expect(boletosVigentes([cancelado])).toEqual([]);
  });
});
