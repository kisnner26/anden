import { describe, expect, it } from '@jest/globals';

import type { CierreViaje } from '@/servicios/cierres';

import {
  actividadPorDia,
  cierresDelPeriodo,
  resumirActividad,
} from './analiticaConductor';

const AHORA = new Date(2026, 10, 12, 18, 0);

function cierre(
  dia: number,
  cobrado: number,
  pendiente: number,
  pasajeros: number,
  id = `v${dia}-${cobrado}`,
): CierreViaje {
  return {
    cerradoEn: new Date(2026, 10, dia, 12, 0).toISOString(),
    choferId: 'cho_1',
    cobrado,
    pagados: pasajeros,
    pasajeros,
    pendiente,
    sinPagar: [],
    total: cobrado + pendiente,
    viajeId: id,
  };
}

describe('cierresDelPeriodo', () => {
  it('deja solo los de los últimos días, contando hoy', () => {
    const lista = [
      cierre(12, 100, 0, 3),
      cierre(6, 50, 0, 2),
      cierre(5, 70, 0, 2),
    ];
    expect(cierresDelPeriodo(lista, 7, AHORA)).toHaveLength(2);
  });
});

describe('actividadPorDia', () => {
  it('da un renglón por día, también los vacíos', () => {
    const dias = actividadPorDia([cierre(12, 100, 0, 3)], 7, AHORA);
    expect(dias).toHaveLength(7);
    expect(dias[6]).toMatchObject({
      cobrado: 100,
      dia: '2026-11-12',
      viajes: 1,
    });
    expect(dias[0]).toMatchObject({ cobrado: 0, viajes: 0 });
  });

  it('suma varios viajes del mismo día', () => {
    const dias = actividadPorDia(
      [cierre(11, 100, 0, 3, 'a'), cierre(11, 60, 0, 2, 'b')],
      3,
      AHORA,
    );
    expect(dias[1]).toMatchObject({ cobrado: 160, pasajeros: 5, viajes: 2 });
  });
});

describe('resumirActividad', () => {
  it('calcula ganancias, promedios y cobranza', () => {
    const resumen = resumirActividad(
      [cierre(12, 100, 20, 4, 'a'), cierre(10, 80, 0, 2, 'b')],
      7,
      AHORA,
    );
    expect(resumen.cobrado).toBe(180);
    expect(resumen.viajes).toBe(2);
    expect(resumen.pasajeros).toBe(6);
    expect(resumen.porViaje).toBe(90);
    expect(resumen.pasajerosPorViaje).toBe(3);
    expect(resumen.pendiente).toBe(20);
    expect(resumen.cobranza).toBeCloseTo(0.9);
    expect(resumen.mejorDia?.dia).toBe('2026-11-12');
  });

  it('sin viajes todo queda en cero y sin mejor día', () => {
    const resumen = resumirActividad([], 7, AHORA);
    expect(resumen).toMatchObject({
      cobranza: 0,
      cobrado: 0,
      mejorDia: null,
      porViaje: 0,
      viajes: 0,
    });
  });
});
