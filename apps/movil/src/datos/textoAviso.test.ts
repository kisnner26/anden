import { describe, expect, it } from '@jest/globals';

import type { Aviso } from './avisos';
import { textoAviso, textoRecordatorio } from './textoAviso';

const base: Aviso = {
  puntoEncuentro: '764M4PPX+HH',
  boletoId: 'bol_1',
  destino: 'Boaco',
  id: 'bol_1:pronto',
  minutos: 25,
  tipo: 'pronto',
};

describe('textoAviso', () => {
  it('arma el titular y el detalle de una salida pronta', () => {
    expect(textoAviso(base)).toEqual({
      detalle: 'Punto 764M4PPX+HH. Llegá con tiempo y llevá la tarifa exacta.',
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
  it('dice el destino y el punto de encuentro', () => {
    expect(textoRecordatorio('Juigalpa', '764M4PPX+HF')).toEqual({
      cuerpo:
        'Punto 764M4PPX+HF. Llevá la tarifa exacta para pagar al abordar.',
      titulo: 'Tu bus a Juigalpa sale en 30 min',
    });
  });

  it('arma el texto de un asiento liberado con cuántos quedan', () => {
    const { detalle, titulo } = textoAviso({
      puntoEncuentro: '764M4PPX+HG',
      boletoId: 'via_1',
      destino: 'Boaco',
      id: 'via_1:liberado',
      minutos: 2,
      tipo: 'liberado',
    });
    expect(titulo).toBe('Se liberó un asiento a Boaco');
    expect(detalle).toContain('Quedan 2 libres');
  });
});
