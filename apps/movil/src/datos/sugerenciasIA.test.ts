import { describe, expect, it } from '@jest/globals';

import { MEMORIA_VACIA, registrarReserva } from './memoriaIA';
import {
  sugerenciasDelMomento,
  type FactoresSugerencia,
} from './sugerenciasIA';

const BASE: FactoresSugerencia = {
  ahora: new Date(2026, 10, 12, 9, 0),
  boletoProximo: null,
  destinos: ['Boaco', 'Juigalpa', 'León'],
  memoria: MEMORIA_VACIA,
  semilla: 1,
};

describe('sugerenciasDelMomento', () => {
  it('siempre da tres preguntas distintas', () => {
    for (let semilla = 0; semilla < 30; semilla += 1) {
      const lista = sugerenciasDelMomento({ ...BASE, semilla });
      expect(lista).toHaveLength(3);
      expect(new Set(lista).size).toBe(3);
    }
  });

  it('cambian de una apertura a otra', () => {
    const vistas = new Set<string>();
    for (let semilla = 0; semilla < 20; semilla += 1) {
      vistas.add(sugerenciasDelMomento({ ...BASE, semilla }).join('|'));
    }
    expect(vistas.size).toBeGreaterThan(3);
  });

  it('con la misma semilla dan lo mismo', () => {
    expect(sugerenciasDelMomento(BASE)).toEqual(sugerenciasDelMomento(BASE));
  });

  it('con un boleto a punto de salir priorizan el andén y el tiempo', () => {
    const lista = sugerenciasDelMomento({
      ...BASE,
      boletoProximo: { destino: 'Boaco', minutosParaSalir: 40 },
    });
    expect(lista.some((p) => p.includes('andén') || p.includes('falta'))).toBe(
      true,
    );
  });

  it('usan el destino habitual de la memoria', () => {
    const memoria = registrarReserva(MEMORIA_VACIA, 'León');
    const todas = new Set<string>();
    for (let semilla = 0; semilla < 20; semilla += 1) {
      for (const p of sugerenciasDelMomento({ ...BASE, memoria, semilla }))
        todas.add(p);
    }
    expect([...todas].some((p) => p.includes('León'))).toBe(true);
  });

  it('sin destinos ni historial igual ofrece tres', () => {
    expect(sugerenciasDelMomento({ ...BASE, destinos: [] })).toHaveLength(3);
  });

  it('con el modo turista ofrece qué visitar en el destino', () => {
    const todas = new Set<string>();
    for (let semilla = 0; semilla < 15; semilla += 1) {
      for (const p of sugerenciasDelMomento({
        ...BASE,
        semilla,
        turista: true,
      })) {
        todas.add(p);
      }
    }
    expect([...todas].some((p) => p.startsWith('¿Qué puedo visitar en'))).toBe(
      true,
    );
    const sinModo = new Set<string>();
    for (let semilla = 0; semilla < 15; semilla += 1) {
      for (const p of sugerenciasDelMomento({ ...BASE, semilla }))
        sinModo.add(p);
    }
    expect([...sinModo].some((p) => p.includes('visitar'))).toBe(false);
  });
});
