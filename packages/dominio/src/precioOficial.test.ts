import { describe, expect, it } from 'vitest';

import { precioOficial } from './precio';
import type { Tarifario } from './tipos';

const tarifario: Tarifario = [
  {
    rutaId: 'rut_uca_gra',
    servicio: 'ordinario',
    desdeParada: 0,
    hastaParada: 2,
    cordobas: 46,
    resolucion: 'muestra',
  },
  {
    rutaId: 'rut_uca_gra',
    servicio: 'ordinario',
    desdeParada: 1,
    hastaParada: 2,
    cordobas: 21,
    resolucion: 'muestra',
  },
];

const pasajero = { nombre: 'Ana Ruiz', esMenorEnBrazos: false };

describe('precioOficial', () => {
  it('devuelve la tarifa exacta del recorrido completo', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'ordinario',
        { desde: 0, hasta: 2 },
        [pasajero],
      ),
    ).toEqual({ ok: true, valor: { unitario: 46, total: 46 } });
  });

  it('devuelve la tarifa autorizada del tramo intermedio', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'ordinario',
        { desde: 1, hasta: 2 },
        [pasajero],
      ),
    ).toEqual({ ok: true, valor: { unitario: 21, total: 21 } });
  });

  it('rechaza ruta o servicio sin tarifa autorizada', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_otra',
        'ordinario',
        { desde: 0, hasta: 2 },
        [pasajero],
      ),
    ).toEqual({ ok: false, error: 'sin-tarifa-autorizada' });
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'expreso',
        { desde: 0, hasta: 2 },
        [pasajero],
      ),
    ).toEqual({ ok: false, error: 'sin-tarifa-autorizada' });
  });

  it('rechaza un tramo invertido', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'ordinario',
        { desde: 2, hasta: 1 },
        [pasajero],
      ),
    ).toEqual({ ok: false, error: 'tramo-invalido' });
  });

  it('cobra solo pasajeros que ocupan asiento', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'ordinario',
        { desde: 0, hasta: 2 },
        [pasajero, { nombre: 'Luis Ruiz', esMenorEnBrazos: true }, pasajero],
      ),
    ).toEqual({ ok: true, valor: { unitario: 46, total: 92 } });
  });

  it('rechaza una compra sin pasajeros que pagan', () => {
    expect(
      precioOficial(
        tarifario,
        'rut_uca_gra',
        'ordinario',
        { desde: 0, hasta: 2 },
        [{ nombre: 'Luis Ruiz', esMenorEnBrazos: true }],
      ),
    ).toEqual({ ok: false, error: 'sin-pasajeros' });
  });
});
