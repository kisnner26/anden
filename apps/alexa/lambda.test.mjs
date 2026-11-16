import { describe, expect, it } from 'vitest';

import { pedidoValido } from './lambda.mjs';

const AHORA = Date.parse('2026-11-13T16:00:00Z');

function pedido(id = 'amzn1.ask.skill.abc', marca = '2026-11-13T15:59:30Z') {
  return {
    request: { timestamp: marca },
    session: { application: { applicationId: id } },
  };
}

describe('pedidoValido', () => {
  it('acepta un pedido de la habilidad y reciente', () => {
    expect(pedidoValido(pedido(), 'amzn1.ask.skill.abc', AHORA)).toBe(true);
  });
});
