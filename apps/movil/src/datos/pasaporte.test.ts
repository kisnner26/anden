import { describe, expect, it } from '@jest/globals';

import { armarPasaporte } from './pasaporte';
import type { BoletoGuardado } from './reserva';

const AHORA = new Date('2026-11-15T12:00:00');

function viaje(
  destino: string,
  salida: string,
  estado = 'vigente',
): BoletoGuardado {
  return {
    boleto: { estado, id: `b${salida}${destino}` },
    resumen: { destino, salida: new Date(salida).toISOString() },
  } as unknown as BoletoGuardado;
}

describe('armarPasaporte', () => {
  it('sin viajes no hay sellos', () => {
    const p = armarPasaporte([], AHORA);
    expect(p.viajes).toBe(0);
    expect(p.ciudades.every((c) => c.llegadas === 0)).toBe(true);
    expect(p.raros.every((r) => !r.desbloqueado)).toBe(true);
  });

  it('un sello por ciudad con sus llegadas y el primer viaje', () => {
    const p = armarPasaporte(
      [
        viaje('Boaco', '2026-11-02T08:00:00'),
        viaje('Boaco', '2026-11-09T08:00:00'),
        viaje('Managua', '2026-11-03T18:00:00'),
      ],
      AHORA,
    );
    const boaco = p.ciudades.find((c) => c.ciudad === 'Boaco');
    expect(boaco?.llegadas).toBe(2);
    expect(boaco?.primera).toBe(new Date('2026-11-02T08:00:00').toISOString());
    expect(p.ciudades.find((c) => c.ciudad === 'Juigalpa')?.llegadas).toBe(0);
  });

  it('no cuenta lo cancelado ni lo que todavía no sale', () => {
    const p = armarPasaporte(
      [
        viaje('Boaco', '2026-11-02T08:00:00', 'cancelado'),
        viaje('Boaco', '2026-11-20T08:00:00'),
      ],
      AHORA,
    );
    expect(p.viajes).toBe(0);
  });

  it('el madrugador sale de un viaje antes de las seis', () => {
    const p = armarPasaporte([viaje('Managua', '2026-11-02T04:30:00')], AHORA);
    expect(p.raros.find((r) => r.id === 'madrugador')?.desbloqueado).toBe(true);
    expect(p.raros.find((r) => r.id === 'nocturno')?.desbloqueado).toBe(false);
  });

  it('el nocturno sale de un viaje desde las nueve de la noche', () => {
    const p = armarPasaporte([viaje('Managua', '2026-11-02T21:30:00')], AHORA);
    expect(p.raros.find((r) => r.id === 'nocturno')?.desbloqueado).toBe(true);
  });

  it('las tres ciudades se ganan al llegar a las tres', () => {
    const p = armarPasaporte(
      [
        viaje('Managua', '2026-11-01T08:00:00'),
        viaje('Boaco', '2026-11-02T08:00:00'),
        viaje('Juigalpa', '2026-11-03T08:00:00'),
      ],
      AHORA,
    );
    const sello = p.raros.find((r) => r.id === 'tresCiudades');
    expect(sello?.desbloqueado).toBe(true);
    expect(sello?.cuando).toBe(new Date('2026-11-03T08:00:00').toISOString());
  });

  it('constante: cinco llegadas a la misma ciudad', () => {
    const cinco = [1, 2, 3, 4, 5].map((d) =>
      viaje('Boaco', `2026-11-0${d}T08:00:00`),
    );
    expect(
      armarPasaporte(cinco, AHORA).raros.find((r) => r.id === 'constante')
        ?.desbloqueado,
    ).toBe(true);
  });

  it('viajero: diez viajes', () => {
    const diez = Array.from({ length: 10 }, (_, i) =>
      viaje('Managua', `2026-11-${String(i + 1).padStart(2, '0')}T08:00:00`),
    );
    expect(
      armarPasaporte(diez, AHORA).raros.find((r) => r.id === 'viajero')
        ?.desbloqueado,
    ).toBe(true);
  });
});
