import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  watchPositionAsync: jest.fn(),
}));

import * as Location from 'expo-location';

import { seguirUbicacion } from '@/datos/seguirUbicacion';
import type { PosicionBus } from '@/servicios/transmision';

type Oyente = (ubicacion: unknown) => void;

const remover = jest.fn();
let oyente: Oyente = () => undefined;

beforeEach(() => {
  remover.mockClear();
  jest.mocked(Location.watchPositionAsync).mockImplementation((async (
    _opciones: unknown,
    alUbicar: Oyente,
  ) => {
    oyente = alUbicar;
    return { remove: remover };
  }) as never);
});

function ubicacion(speed: number | null) {
  return {
    coords: { latitude: 12.3, longitude: -85.9, speed },
    timestamp: Date.parse('2026-11-12T18:00:00.000Z'),
  };
}

describe('seguirUbicacion', () => {
  it('publica la posición con la velocidad en metros por segundo', async () => {
    const recibidas: PosicionBus[] = [];
    await seguirUbicacion((posicion) => recibidas.push(posicion));
    oyente(ubicacion(12));
    expect(recibidas).toEqual([
      {
        lat: 12.3,
        lng: -85.9,
        registradaEn: '2026-11-12T18:00:00.000Z',
        velocidadMs: 12,
      },
    ]);
  });

  it('una velocidad negativa o desconocida se publica como nula', async () => {
    const recibidas: PosicionBus[] = [];
    await seguirUbicacion((posicion) => recibidas.push(posicion));
    oyente(ubicacion(-1));
    oyente(ubicacion(null));
    expect(recibidas.map((p) => p.velocidadMs)).toEqual([null, null]);
  });

  it('la función devuelta deja de escuchar', async () => {
    const parar = await seguirUbicacion(() => undefined);
    parar();
    expect(remover).toHaveBeenCalledTimes(1);
  });
});
