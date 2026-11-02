import { describe, expect, it } from 'vitest';

import { error, ok, type Resultado } from './resultado';

describe('resultado', () => {
  it('ok guarda el valor', () => {
    expect(ok(42)).toEqual({ ok: true, valor: 42 });
  });

  it('error guarda la causa', () => {
    expect(error('sin asientos')).toEqual({ ok: false, error: 'sin asientos' });
  });

  it('se puede discriminar por ok', () => {
    const dividir = (
      a: number,
      b: number,
    ): Resultado<number, 'division-por-cero'> =>
      b === 0 ? error('division-por-cero') : ok(a / b);

    const bueno = dividir(6, 3);
    const malo = dividir(1, 0);

    expect(bueno.ok && bueno.valor).toBe(2);
    expect(!malo.ok && malo.error).toBe('division-por-cero');
  });
});
