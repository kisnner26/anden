import { describe, expect, it } from '@jest/globals';

import { agruparPorDestino } from './historialViajes';
import type { BoletoGuardado } from './reserva';

function boleto(id: string, destino: string, dia: number): BoletoGuardado {
  return {
    boleto: { id },
    resumen: { destino, salida: new Date(2026, 10, dia).toISOString() },
  } as unknown as BoletoGuardado;
}

describe('agruparPorDestino', () => {
  it('sin viajes no hay grupos', () => {
    expect(agruparPorDestino([])).toEqual([]);
  });

  it('junta por destino y ordena cada grupo del más reciente al más antiguo', () => {
    const [boaco] = agruparPorDestino([
      boleto('a', 'Boaco', 1),
      boleto('b', 'Boaco', 5),
    ]);
    expect(boaco?.boletos.map((b) => b.boleto.id)).toEqual(['b', 'a']);
  });

  it('el destino más recorrido va primero', () => {
    const grupos = agruparPorDestino([
      boleto('a', 'Juigalpa', 9),
      boleto('b', 'Boaco', 1),
      boleto('c', 'Boaco', 2),
    ]);
    expect(grupos.map((g) => g.destino)).toEqual(['Boaco', 'Juigalpa']);
  });

  it('a igual cantidad gana el más reciente', () => {
    const grupos = agruparPorDestino([
      boleto('a', 'Boaco', 1),
      boleto('b', 'Juigalpa', 9),
    ]);
    expect(grupos.map((g) => g.destino)).toEqual(['Juigalpa', 'Boaco']);
  });
});
