import { describe, expect, it } from 'vitest';

import { argumentosDeClaude, validarPedido } from './claude.ts';

describe('validarPedido', () => {
  it('acepta una pregunta con sus instrucciones', () => {
    expect(
      validarPedido({ instrucciones: 'Sos el asistente', pregunta: ' hola ' }),
    ).toEqual({ instrucciones: 'Sos el asistente', pregunta: 'hola' });
  });

  it('rechaza lo que no es un objeto o no trae textos', () => {
    expect(validarPedido(null)).toBeNull();
    expect(validarPedido('hola')).toBeNull();
    expect(validarPedido({ pregunta: 'hola' })).toBeNull();
    expect(validarPedido({ instrucciones: 1, pregunta: 'hola' })).toBeNull();
  });

  it('rechaza una pregunta vacía o demasiado larga', () => {
    expect(validarPedido({ instrucciones: '', pregunta: '   ' })).toBeNull();
    expect(
      validarPedido({ instrucciones: '', pregunta: 'a'.repeat(601) }),
    ).toBeNull();
  });
});
