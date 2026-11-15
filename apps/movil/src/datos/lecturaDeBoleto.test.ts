import { describe, expect, it } from '@jest/globals';

import { codigoDeQR, resultadoDeLectura } from './lecturaDeBoleto';
import type { BoletoGuardado } from './reserva';

function boleto(parcial: {
  codigo?: string;
  estado?: string;
  viajeId?: string;
}): BoletoGuardado {
  return {
    boleto: {
      asiento: 8,
      codigo: parcial.codigo ?? 'K7RM4QX9',
      estado: parcial.estado ?? 'vigente',
      id: 'bol_1',
      pasajero: { esMenorEnBrazos: false, nombre: 'Ana Ruiz' },
      viajeId: parcial.viajeId ?? 'via_1',
    },
    resumen: {},
  } as unknown as BoletoGuardado;
}

describe('codigoDeQR', () => {
  it('saca el código del QR de un boleto', () => {
    expect(codigoDeQR('ANDEN:K7RM4QX9')).toBe('K7RM4QX9');
    expect(codigoDeQR(' anden:k7rm-4qx9 ')).toBe('K7RM4QX9');
  });

  it('rechaza lo que no es de Andén o no tiene ocho caracteres', () => {
    expect(codigoDeQR('https://ejemplo.com')).toBeNull();
    expect(codigoDeQR('ANDEN:123')).toBeNull();
  });
});

describe('resultadoDeLectura', () => {
  const lista = [boleto({})];

  it('un boleto de este viaje deja subir', () => {
    expect(
      resultadoDeLectura('ANDEN:K7RM4QX9', lista, 'via_1', () => false),
    ).toEqual({
      asiento: 8,
      boletoId: 'bol_1',
      nombre: 'Ana Ruiz',
      tipo: 'ok',
    });
  });

  it('si ya había subido lo dice', () => {
    expect(
      resultadoDeLectura('ANDEN:K7RM4QX9', lista, 'via_1', () => true).tipo,
    ).toBe('ya');
  });

  it('un boleto de otro viaje no deja subir', () => {
    expect(
      resultadoDeLectura('ANDEN:K7RM4QX9', lista, 'via_2', () => false).tipo,
    ).toBe('otroViaje');
  });

  it('un boleto cancelado o desconocido es inválido', () => {
    expect(
      resultadoDeLectura(
        'ANDEN:K7RM4QX9',
        [boleto({ estado: 'cancelado' })],
        'via_1',
        () => false,
      ).tipo,
    ).toBe('invalido');
    expect(
      resultadoDeLectura('ANDEN:ZZZZZZZZ', lista, 'via_1', () => false).tipo,
    ).toBe('invalido');
    expect(resultadoDeLectura('hola', lista, 'via_1', () => false).tipo).toBe(
      'invalido',
    );
  });
});
