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
});
