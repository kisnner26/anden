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

  it('rechaza un pedido de otra habilidad', () => {
    expect(
      pedidoValido(
        pedido('amzn1.ask.skill.otra'),
        'amzn1.ask.skill.abc',
        AHORA,
      ),
    ).toBe(false);
  });

  it('rechaza un pedido con fecha vieja o futura', () => {
    expect(
      pedidoValido(
        pedido('amzn1.ask.skill.abc', '2026-11-13T15:50:00Z'),
        'amzn1.ask.skill.abc',
        AHORA,
      ),
    ).toBe(false);
    expect(
      pedidoValido(
        pedido('amzn1.ask.skill.abc', '2026-11-13T16:10:00Z'),
        'amzn1.ask.skill.abc',
        AHORA,
      ),
    ).toBe(false);
  });

  it('rechaza todo si no hay un id de habilidad configurado', () => {
    expect(pedidoValido(pedido(), undefined, AHORA)).toBe(false);
  });

  it('rechaza un pedido sin fecha o mal formado', () => {
    expect(
      pedidoValido(
        { session: { application: { applicationId: 'amzn1.ask.skill.abc' } } },
        'amzn1.ask.skill.abc',
        AHORA,
      ),
    ).toBe(false);
    expect(pedidoValido(null, 'amzn1.ask.skill.abc', AHORA)).toBe(false);
  });
});
