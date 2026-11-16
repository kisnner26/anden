import { describe, expect, it } from '@jest/globals';

import { etaDelViaje } from './etaDelViaje';
import type { ProgresoViaje } from './progresoViaje';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 16, 14, 0);

const salida = {
  estado: 'en-ruta',
  minutosAtraso: 0,
  salida: new Date(2026, 10, 16, 13, 45),
} as unknown as Salida;

const progreso: ProgresoViaje = {
  desvioKm: 0,
  fraccion: 0.5,
  fueraDeRuta: false,
  kmRecorridos: 40,
  kmRestantes: 40,
  minutosRestantes: 30,
  porcentaje: 50,
};

describe('etaDelViaje', () => {
  it('con el bus transmitiendo suma lo que le falta al momento actual', () => {
    const eta = etaDelViaje(AHORA, salida, 90, progreso);
    expect(eta.fuente).toBe('bus');
    expect(eta.llegada).toEqual(new Date(2026, 10, 16, 14, 30));
    expect(eta.kmRestantes).toBe(40);
    expect(eta.minutosRestantes).toBe(30);
  });

  it('sin transmisión usa la salida más la duración prevista', () => {
    const eta = etaDelViaje(AHORA, salida, 90, null);
    expect(eta.fuente).toBe('prevista');
    expect(eta.llegada).toEqual(new Date(2026, 10, 16, 15, 15));
    expect(eta.minutosRestantes).toBe(75);
    expect(eta.kmRestantes).toBeNull();
  });

  it('si la hora prevista ya pasó no devuelve minutos negativos', () => {
    const tarde = new Date(2026, 10, 16, 17, 0);
    expect(etaDelViaje(tarde, salida, 90, null).minutosRestantes).toBe(0);
  });

  it('el atraso de la salida corre la hora prevista', () => {
    const atrasada = { ...salida, minutosAtraso: 10 } as Salida;
    expect(etaDelViaje(AHORA, atrasada, 90, null).llegada).toEqual(
      new Date(2026, 10, 16, 15, 25),
    );
  });
});
