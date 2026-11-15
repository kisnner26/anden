import { describe, expect, it } from '@jest/globals';

import { datosDelCielo } from './cieloDelBoleto';
import { TERMINALES } from './muestra';
import type { BoletoGuardado } from './reserva';

function boleto(origen: string | undefined, destino: string): BoletoGuardado {
  return {
    boleto: {},
    resumen: { destino, origen },
  } as unknown as BoletoGuardado;
}

describe('datosDelCielo', () => {
  it('encuentra la terminal por su nombre y la duración del trazo', () => {
    const d = datosDelCielo(boleto('Mercado Mayoreo', 'Boaco'), TERMINALES);
    expect(d?.lugar.lat).toBeCloseTo(12.13, 1);
    expect(d?.duracionMin).toBeGreaterThan(30);
  });

  it('también por la ciudad', () => {
    expect(
      datosDelCielo(boleto('Boaco', 'Managua'), TERMINALES),
    ).not.toBeNull();
  });

  it('sin terminal conocida devuelve nulo', () => {
    expect(datosDelCielo(boleto('Lugar raro', 'Boaco'), TERMINALES)).toBeNull();
    expect(datosDelCielo(boleto(undefined, 'Boaco'), TERMINALES)).toBeNull();
  });
});
