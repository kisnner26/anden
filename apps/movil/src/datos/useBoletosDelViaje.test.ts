import { describe, expect, it } from '@jest/globals';

import type { BoletoGuardado } from './reserva';
import { unirBoletos } from './useBoletosDelViaje';

function boleto(id: string, estado: 'vigente' | 'cancelado'): BoletoGuardado {
  return { boleto: { estado, id }, resumen: {} } as unknown as BoletoGuardado;
}

describe('unirBoletos', () => {
  it('suma los boletos de los pasajeros a los locales sin repetir', () => {
    const unidos = unirBoletos(
      [boleto('a', 'vigente')],
      [boleto('a', 'vigente'), boleto('b', 'vigente')],
    );
    expect(unidos.map((g) => g.boleto.id).sort()).toEqual(['a', 'b']);
  });

  it('el boleto local manda sobre la copia remota', () => {
    const [unico] = unirBoletos(
      [boleto('a', 'cancelado')],
      [boleto('a', 'vigente')],
    );
    expect(unico?.boleto.estado).toBe('cancelado');
  });
});
