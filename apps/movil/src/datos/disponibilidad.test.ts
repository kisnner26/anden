import { describe, expect, it } from '@jest/globals';

import {
  minutosParaSalir,
  nivelDisponibilidad,
  proximaHaciaDestino,
} from './disponibilidad';
import type { Salida } from './salidas';

function salida(parcial: Partial<Salida>): Salida {
  return {
    anden: 1,
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    placa: 'M 000000',
    rutaId: 'rut_1',
    salida: new Date('2026-11-12T18:00:00Z'),
    servicio: 'ordinario',
    tarifa: 100,
    ventaAbierta: true,
    viajeId: 'via_1',
    ...parcial,
  };
}

describe('nivelDisponibilidad', () => {
  it('marca agotado cuando no quedan asientos', () => {
    expect(nivelDisponibilidad(0)).toBe('agotado');
  });

  it('marca pocos hasta el umbral', () => {
    expect(nivelDisponibilidad(1)).toBe('pocos');
    expect(nivelDisponibilidad(5)).toBe('pocos');
  });

  it('marca hay desde seis asientos', () => {
    expect(nivelDisponibilidad(6)).toBe('hay');
  });
});

describe('minutosParaSalir', () => {
  it('cuenta hacia arriba y suma el atraso', () => {
    const ahora = new Date('2026-11-12T17:30:00Z');
    expect(minutosParaSalir(salida({}), ahora)).toBe(30);
    expect(minutosParaSalir(salida({ minutosAtraso: 10 }), ahora)).toBe(40);
  });

  it('nunca baja de cero', () => {
    expect(minutosParaSalir(salida({}), new Date('2026-11-12T19:00:00Z'))).toBe(
      0,
    );
  });
});

describe('proximaHaciaDestino', () => {
  const salidas = [
    salida({ salida: new Date('2026-11-12T20:00:00Z'), viajeId: 'tarde' }),
    salida({ salida: new Date('2026-11-12T18:00:00Z'), viajeId: 'pronto' }),
    salida({ estado: 'en-ruta', viajeId: 'ya-salio' }),
    salida({ destino: 'Juigalpa', viajeId: 'otro-destino' }),
  ];

  it('elige la pendiente más cercana del destino', () => {
    expect(proximaHaciaDestino(salidas, 'Boaco')?.viajeId).toBe('pronto');
  });

  it('devuelve null si no queda ninguna', () => {
    expect(proximaHaciaDestino(salidas, 'Managua')).toBeNull();
  });
});
