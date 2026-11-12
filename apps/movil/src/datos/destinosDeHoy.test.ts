import { describe, expect, it } from '@jest/globals';

import { destinosDeHoy } from './destinosDeHoy';
import type { Salida } from './salidas';

function salida(
  destino: string,
  minutos: number,
  estado: Salida['estado'] = 'programado',
): Salida {
  return {
    destino,
    estado,
    minutosAtraso: 0,
    salida: new Date(2026, 10, 13, 10, minutos),
    viajeId: `${destino}${minutos}`,
  } as unknown as Salida;
}

describe('destinosDeHoy', () => {
  it('deja una salida por destino, la más próxima', () => {
    const lista = destinosDeHoy([
      salida('Boaco', 30),
      salida('Boaco', 10),
      salida('Juigalpa', 20),
    ]);
    expect(lista.map((s) => s.viajeId)).toEqual(['Boaco10', 'Juigalpa20']);
  });

  it('ignora las que ya salieron o se cancelaron', () => {
    expect(
      destinosDeHoy([
        salida('Boaco', 5, 'salio'),
        salida('Boaco', 6, 'cancelado'),
      ]),
    ).toEqual([]);
  });
});
