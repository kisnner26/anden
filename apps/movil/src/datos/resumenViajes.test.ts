import { describe, expect, it } from '@jest/globals';

import { resumenDeViajes } from './resumenViajes';
import type { BoletoGuardado } from './reserva';

function boleto(
  destino: string,
  mes: number,
  precio = 70,
  estado = 'vigente',
  origen = 'Mercado Mayoreo',
): BoletoGuardado {
  return {
    boleto: { estado, id: `${destino}${mes}${precio}`, precio },
    resumen: { destino, origen, salida: new Date(2026, mes, 10).toISOString() },
  } as unknown as BoletoGuardado;
}

describe('resumenDeViajes', () => {
  it('sin viajes todo está en cero', () => {
    expect(resumenDeViajes([])).toEqual({
      destinoFavorito: null,
      gastado: 0,
      kilometros: 0,
      mesTop: null,
      viajes: 0,
    });
  });

  it('suma lo gastado y cuenta los viajes', () => {
    const r = resumenDeViajes([
      boleto('Boaco', 9, 70),
      boleto('Juigalpa', 10, 110),
    ]);
    expect(r.viajes).toBe(2);
    expect(r.gastado).toBe(180);
  });

  it('el destino favorito es el más repetido', () => {
    const r = resumenDeViajes([
      boleto('Boaco', 9),
      boleto('Juigalpa', 9),
      boleto('Boaco', 10),
    ]);
    expect(r.destinoFavorito).toBe('Boaco');
  });

  it('los cancelados no cuentan', () => {
    const r = resumenDeViajes([
      boleto('Boaco', 9),
      boleto('Boaco', 9, 70, 'cancelado'),
    ]);
    expect(r.viajes).toBe(1);
    expect(r.gastado).toBe(70);
  });

  it('los kilómetros salen del trazo de carretera, en los dos sentidos', () => {
    const ida = resumenDeViajes([boleto('Boaco', 9)]);
    const vuelta = resumenDeViajes([
      boleto('Managua', 9, 70, 'vigente', 'Terminal de Boaco'),
    ]);
    expect(ida.kilometros).toBeGreaterThan(70);
    expect(vuelta.kilometros).toBe(ida.kilometros);
  });

  it('el mes con más viajes', () => {
    const r = resumenDeViajes([
      boleto('Boaco', 9),
      boleto('Boaco', 10),
      boleto('Boaco', 10),
    ]);
    expect(r.mesTop).toBe(10);
  });
});
