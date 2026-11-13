import { describe, expect, it } from '@jest/globals';

import {
  destinosFrecuentes,
  salidaMasBarata,
  salidasRelacionadas,
} from './ayudasIA';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 12, 10, 0);

function salida(
  viajeId: string,
  destino: string,
  horas: number,
  tarifa: number | null,
  libres = 10,
): Salida {
  return {
    anden: 1,
    asientosLibres: libres,
    choferId: 'cho_1',
    codigoDestino: destino.slice(0, 3),
    destino,
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    rutaId: 'r',
    salida: new Date(AHORA.getTime() + horas * 3_600_000),
    servicio: 'ordinario',
    tarifa,
    ventaAbierta: true,
    viajeId,
  };
}

const LISTA = [
  salida('a', 'Boaco', 3, 60),
  salida('b', 'Boaco', 1, 60),
  salida('c', 'Juigalpa', 2, 45),
  salida('d', 'Granada', -2, 30),
  salida('e', 'León', 4, null),
];

describe('salidasRelacionadas', () => {
  it('encuentra el destino sin importar mayúsculas ni tildes', () => {
    const lista = salidasRelacionadas('¿Hay buses a LEON?', LISTA, AHORA);
    expect(lista.map((s) => s.viajeId)).toEqual(['e']);
  });

  it('ordena por hora y deja afuera lo que ya salió', () => {
    const lista = salidasRelacionadas('boaco y granada', LISTA, AHORA);
    expect(lista.map((s) => s.viajeId)).toEqual(['b', 'a']);
  });

  it('sin coincidencias devuelve vacío', () => {
    expect(salidasRelacionadas('hola', LISTA, AHORA)).toEqual([]);
  });
});

describe('destinosFrecuentes', () => {
  it('ordena por cantidad de salidas por venir', () => {
    expect(destinosFrecuentes(LISTA, AHORA, 2)).toEqual(['Boaco', 'Juigalpa']);
  });
});

describe('salidaMasBarata', () => {
  it('toma la de menor tarifa que aún no sale y tiene asientos', () => {
    expect(salidaMasBarata(LISTA, AHORA)?.viajeId).toBe('c');
  });

  it('ignora las agotadas', () => {
    const sin = [salida('x', 'Rivas', 1, 20, 0), salida('y', 'Masaya', 2, 25)];
    expect(salidaMasBarata(sin, AHORA)?.viajeId).toBe('y');
  });

  it('nula si no hay candidatas', () => {
    expect(salidaMasBarata([], AHORA)).toBeNull();
  });
});
