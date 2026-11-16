import { describe, expect, it } from 'vitest';

import { argumentosDeClaude, validarPedido } from './claude.ts';

describe('validarPedido', () => {
  it('acepta una pregunta con sus instrucciones', () => {
    expect(
      validarPedido({ instrucciones: 'Sos el asistente', pregunta: ' hola ' }),
    ).toEqual({ instrucciones: 'Sos el asistente', pregunta: 'hola' });
  });
});
