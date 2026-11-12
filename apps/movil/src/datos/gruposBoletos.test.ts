import { describe, expect, it } from '@jest/globals';

import { agruparBoletos } from './gruposBoletos';
import type { BoletoGuardado } from './reserva';

function boleto(id: string, destino: string, salida: string): BoletoGuardado {
  return {
    boleto: { id },
    resumen: { destino, salida },
  } as unknown as BoletoGuardado;
}

describe('agruparBoletos', () => {
  it('sin boletos no hay grupos', () => {
    expect(agruparBoletos([])).toEqual([]);
  });

  it('junta los boletos del mismo destino y hora', () => {
    const grupos = agruparBoletos([
      boleto('a', 'Boaco', '2026-11-13T10:00:00Z'),
      boleto('b', 'Boaco', '2026-11-13T10:00:00Z'),
      boleto('c', 'Juigalpa', '2026-11-13T10:00:00Z'),
    ]);
    expect(grupos).toHaveLength(2);
    expect(grupos[0]?.boletos).toHaveLength(2);
  });

  it('separa el mismo destino a otra hora', () => {
    const grupos = agruparBoletos([
      boleto('a', 'Boaco', '2026-11-13T10:00:00Z'),
      boleto('b', 'Boaco', '2026-11-14T10:00:00Z'),
    ]);
    expect(grupos).toHaveLength(2);
  });
});
