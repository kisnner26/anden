import { describe, expect, it } from 'vitest';

import { promedioChofer, puedeCalificar } from './calificaciones';
import type { Boleto, Calificacion } from './tipos';

function nota(estrellas: 1 | 2 | 3 | 4 | 5, boletoId = 'bol'): Calificacion {
  return { boletoId, choferId: 'cho_1', estrellas, etiquetas: [] };
}

function boleto(estado: Boleto['estado'], id = 'bol_1'): Boleto {
  return {
    asiento: 8,
    codigo: 'K7RM4QX9',
    compradoEn: '2026-11-02T10:00:00-06:00',
    duenoId: 'usu_1',
    estado,
    id,
    pasajero: { esMenorEnBrazos: false, nombre: 'Ana Ruiz' },
    precio: 46,
    viajeId: 'via_1',
  };
}

describe('promedioChofer', () => {
  it('es nulo con menos de cinco calificaciones', () => {
    expect(promedioChofer([nota(5), nota(5), nota(5), nota(5)])).toBeNull();
  });

  it('calcula el promedio con un decimal desde la quinta', () => {
    expect(promedioChofer([nota(5), nota(5), nota(4), nota(4), nota(4)])).toBe(
      4.4,
    );
  });

  it('redondea al decimal más cercano', () => {
    const notas = [
      nota(5),
      nota(5),
      nota(5),
      nota(4),
      nota(4),
      nota(4),
      nota(4),
    ];
    expect(promedioChofer(notas)).toBe(4.4);
  });

  it('usa solo las últimas 200', () => {
    const viejas = Array.from({ length: 50 }, () => nota(1));
    const nuevas = Array.from({ length: 200 }, () => nota(5));
    expect(promedioChofer([...viejas, ...nuevas])).toBe(5);
  });
});

describe('puedeCalificar', () => {
  it('permite calificar un boleto usado sin calificación', () => {
    expect(puedeCalificar(boleto('usado'), [])).toBe(true);
  });

  it('no permite calificar dos veces el mismo boleto', () => {
    expect(puedeCalificar(boleto('usado'), [nota(5, 'bol_1')])).toBe(false);
  });

  it('permite calificar si la calificación existente es de otro boleto', () => {
    expect(puedeCalificar(boleto('usado'), [nota(5, 'bol_2')])).toBe(true);
  });

  it('no permite calificar un boleto que todavía no se usó', () => {
    expect(puedeCalificar(boleto('vigente'), [])).toBe(false);
    expect(puedeCalificar(boleto('cancelado'), [])).toBe(false);
  });
});
