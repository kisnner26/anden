import { describe, expect, it } from 'vitest';

import { estadoViaje, llegadaEstimada, ventaAbierta } from './horarios';
import type { Ruta, Viaje } from './tipos';

const ruta: Ruta = {
  id: 'rut_uca_gra',
  origenId: 'ter_uca',
  destinoId: 'ter_gra',
  paradas: [
    { tipo: 'terminal', terminalId: 'ter_uca', minutosDesdeOrigen: 0 },
    { tipo: 'terminal', terminalId: 'ter_gra', minutosDesdeOrigen: 60 },
  ],
  distanciaKm: 45,
  duracionMin: 60,
  tarifaBase: 46,
};

const viaje: Viaje = {
  id: 'via_01',
  rutaId: ruta.id,
  busId: 'bus_01',
  choferId: 'cho_01',
  salida: '2026-11-02T14:00:00-06:00',
  anden: 4,
  estado: 'programado',
  minutosAtraso: 0,
};

describe('estadoViaje', () => {
  it('entra a abordando exactamente veinte minutos antes', () => {
    expect(
      estadoViaje(viaje, ruta, new Date('2026-11-02T13:40:00-06:00')),
    ).toBe('abordando');
  });

  it('pasa a en ruta en la salida real y llegó al terminar', () => {
    expect(
      estadoViaje(viaje, ruta, new Date('2026-11-02T14:00:00-06:00')),
    ).toBe('en-ruta');
    expect(
      estadoViaje(viaje, ruta, new Date('2026-11-02T15:00:00-06:00')),
    ).toBe('llego');
  });

  it('prioriza cancelado y atraso antes de salir', () => {
    expect(
      estadoViaje(
        { ...viaje, estado: 'cancelado' },
        ruta,
        new Date('2026-11-02T14:30:00-06:00'),
      ),
    ).toBe('cancelado');
    expect(
      estadoViaje(
        { ...viaje, minutosAtraso: 10 },
        ruta,
        new Date('2026-11-02T14:05:00-06:00'),
      ),
    ).toBe('atrasado');
  });
});

describe('llegadaEstimada', () => {
  it('suma el atraso y el tiempo hasta la parada', () => {
    expect(
      llegadaEstimada({ ...viaje, minutosAtraso: 10 }, ruta, ruta.paradas[1]!),
    ).toBe('2026-11-02T21:10:00.000Z');
  });
});

describe('ventaAbierta', () => {
  it('cierra exactamente quince minutos antes y en cancelados', () => {
    expect(ventaAbierta(viaje, new Date('2026-11-02T13:44:59-06:00'))).toBe(
      true,
    );
    expect(ventaAbierta(viaje, new Date('2026-11-02T13:45:00-06:00'))).toBe(
      false,
    );
    expect(
      ventaAbierta(
        { ...viaje, estado: 'cancelado' },
        new Date('2026-11-02T12:00:00-06:00'),
      ),
    ).toBe(false);
  });
});
