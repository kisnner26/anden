import { describe, expect, it } from '@jest/globals';

import {
  consejoDelMomento,
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
    puntoEncuentro: '764M4PPX+HC',
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

describe('consejoDelMomento', () => {
  it('avisa del boleto que está por salir', () => {
    const consejo = consejoDelMomento(
      LISTA,
      {
        puntoEncuentro: '764M4PPX+HG',
        destino: 'Boaco',
        salida: new Date(AHORA.getTime() + 30 * 60_000),
        viajeId: 'a',
      },
      null,
      AHORA,
    );
    expect(consejo?.texto).toBe(
      'Tu bus a Boaco sale en 30 min, punto de encuentro 764M4PPX+HG.',
    );
    expect(consejo?.viajeId).toBe('a');
  });

  it('si el boleto está lejos propone la próxima salida habitual', () => {
    const consejo = consejoDelMomento(
      LISTA,
      {
        puntoEncuentro: '764M4PPX+HG',
        destino: 'Boaco',
        salida: new Date(AHORA.getTime() + 600 * 60_000),
        viajeId: 'a',
      },
      'Boaco',
      AHORA,
    );
    expect(consejo?.viajeId).toBe('b');
    expect(consejo?.texto).toContain('habitual a Boaco');
  });

  it('sin nada útil no dice nada', () => {
    expect(consejoDelMomento(LISTA, null, null, AHORA)).toBeNull();
    expect(consejoDelMomento([], null, 'Boaco', AHORA)).toBeNull();
  });
});
