import { describe, expect, it } from '@jest/globals';

import {
  pasajerosReservados,
  proximoViaje,
  viajesDeHoy,
} from './panelDelChofer';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 16, 14, 0);

function viaje(
  id: string,
  salida: Date,
  estado: Salida['estado'] = 'programado',
) {
  return { estado, salida, viajeId: id } as unknown as Salida;
}

describe('pasajerosReservados', () => {
  it('son los asientos que ya no están libres', () => {
    expect(
      pasajerosReservados({ asientosLibres: 12, asientosTotales: 30 }),
    ).toBe(18);
  });

  it('sin saber los asientos del bus son cero', () => {
    expect(pasajerosReservados({ asientosLibres: 12 })).toBe(0);
  });

  it('nunca da un número negativo', () => {
    expect(
      pasajerosReservados({ asientosLibres: 40, asientosTotales: 30 }),
    ).toBe(0);
  });
});

describe('viajesDeHoy', () => {
  it('deja solo los de hoy y los ordena por hora', () => {
    const lista = viajesDeHoy(
      [
        viaje('b', new Date(2026, 10, 16, 18, 0)),
        viaje('a', new Date(2026, 10, 16, 9, 0)),
        viaje('manana', new Date(2026, 10, 17, 9, 0)),
      ],
      AHORA,
    );
    expect(lista.map((v) => v.viajeId)).toEqual(['a', 'b']);
  });

  it('no cuenta los cancelados', () => {
    const lista = viajesDeHoy(
      [viaje('x', new Date(2026, 10, 16, 9, 0), 'cancelado')],
      AHORA,
    );
    expect(lista).toEqual([]);
  });
});

describe('proximoViaje', () => {
  const lista = [
    viaje('a', new Date(2026, 10, 16, 9, 0)),
    viaje('b', new Date(2026, 10, 16, 15, 0)),
    viaje('c', new Date(2026, 10, 16, 18, 0)),
  ];

  it('elige el primero que todavía no sale', () => {
    expect(proximoViaje(lista, new Set(), AHORA)?.viajeId).toBe('b');
  });

  it('salta los viajes ya cerrados', () => {
    expect(proximoViaje(lista, new Set(['b']), AHORA)?.viajeId).toBe('c');
  });

  it('un viaje que salió hace poco todavía cuenta, uno viejo no', () => {
    const reciente = [viaje('r', new Date(2026, 10, 16, 13, 45))];
    expect(proximoViaje(reciente, new Set(), AHORA)?.viajeId).toBe('r');
    const viejo = [viaje('v', new Date(2026, 10, 16, 13, 0))];
    expect(proximoViaje(viejo, new Set(), AHORA)).toBeNull();
  });

  it('un viaje cancelado no es el próximo', () => {
    expect(
      proximoViaje(
        [viaje('x', new Date(2026, 10, 16, 15, 0), 'cancelado')],
        new Set(),
        AHORA,
      ),
    ).toBeNull();
  });

  it('sin viajes no hay próximo', () => {
    expect(proximoViaje([], new Set(), AHORA)).toBeNull();
  });
});
