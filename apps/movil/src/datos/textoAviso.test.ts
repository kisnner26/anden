import { describe, expect, it } from '@jest/globals';

import type { Aviso } from './avisos';
import { textoAviso, textoRecordatorio } from './textoAviso';

const base: Aviso = {
  anden: 4,
  boletoId: 'bol_1',
  destino: 'Boaco',
  id: 'bol_1:pronto',
  minutos: 25,
  tipo: 'pronto',
};

describe('textoAviso', () => {
  it('arma el titular y el detalle de una salida pronta', () => {
    expect(textoAviso(base)).toEqual({
      detalle: 'Andén 4. Llegá con tiempo y llevá la tarifa exacta.',
      titulo: 'Tu bus a Boaco sale en 25 min',
    });
  });

  it('arma el aviso de atraso con sus minutos', () => {
    expect(textoAviso({ ...base, minutos: 15, tipo: 'atraso' }).titulo).toBe(
      'Tu bus a Boaco sale con 15 min de atraso',
    );
  });

  it('arma el aviso de cancelación', () => {
    expect(textoAviso({ ...base, tipo: 'cancelado' }).titulo).toBe(
      'Se canceló tu viaje a Boaco',
    );
  });
});

describe('textoRecordatorio', () => {
  it('dice el destino y el andén', () => {
    expect(textoRecordatorio('Juigalpa', 2)).toEqual({
      cuerpo: 'Andén 2. Llevá la tarifa exacta para pagar al abordar.',
      titulo: 'Tu bus a Juigalpa sale en 30 min',
    });
  });
});
