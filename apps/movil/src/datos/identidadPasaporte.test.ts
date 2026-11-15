import { describe, expect, it } from '@jest/globals';

import {
  lineasDeLectura,
  nivelDelPasaporte,
  numeroDePasaporte,
  primerViaje,
} from './identidadPasaporte';
import { boletoDePrueba } from '@/pruebas/boletos';

describe('nivelDelPasaporte', () => {
  it('sin viajes es aspirante y le faltan pocos para el primer nivel', () => {
    expect(nivelDelPasaporte(0)).toEqual({
      nivel: 'aspirante',
      progreso: 0,
      siguiente: { faltan: 1, id: 'pasajero' },
    });
  });

  it('avanza por tramos y dice cuántos viajes faltan', () => {
    const r = nivelDelPasaporte(7);
    expect(r.nivel).toBe('frecuente');
    expect(r.siguiente).toEqual({ faltan: 3, id: 'viajero' });
    expect(r.progreso).toBeCloseTo(0.4);
  });

  it('el nivel más alto queda completo y sin siguiente', () => {
    expect(nivelDelPasaporte(40)).toEqual({
      nivel: 'trotamundos',
      progreso: 1,
      siguiente: null,
    });
  });

  it('justo en el umbral ya es del nivel nuevo', () => {
    expect(nivelDelPasaporte(10).nivel).toBe('viajero');
    expect(nivelDelPasaporte(9).nivel).toBe('frecuente');
  });
});

describe('numeroDePasaporte', () => {
  it('es repetible y distinto entre personas', () => {
    const a = numeroDePasaporte('Marvin', 'Lanzas');
    expect(a).toBe(numeroDePasaporte(' marvin ', 'LANZAS'));
    expect(a).not.toBe(numeroDePasaporte('Luis', 'Lanzas'));
    expect(a).toMatch(/^AN\d{7}$/);
  });
});

describe('lineasDeLectura', () => {
  it('arma dos líneas de 44 signos sin tildes', () => {
    const [uno, dos] = lineasDeLectura(
      'José María',
      'Núñez Peña',
      'AN0000042',
      12,
    );
    expect(uno).toHaveLength(44);
    expect(dos).toHaveLength(44);
    expect(uno.startsWith('P<NICNUNEZ<PENA<<JOSE<MARIA<')).toBe(true);
    expect(dos.startsWith('AN0000042<NIC<012')).toBe(true);
  });

  it('sin nombre usa VIAJERO y recorta lo que no cabe', () => {
    const [uno] = lineasDeLectura('', '', 'AN0000001', 0);
    expect(uno.startsWith('P<NICVIAJERO')).toBe(true);
    const [largo] = lineasDeLectura('A'.repeat(40), 'B'.repeat(40), 'X', 1);
    expect(largo).toHaveLength(44);
  });
});

describe('primerViaje', () => {
  it('es la salida más antigua que no se canceló', () => {
    const viejo = boletoDePrueba(new Date('2026-03-01T08:00:00'));
    const nuevo = boletoDePrueba(new Date('2026-10-01T08:00:00'));
    expect(primerViaje([nuevo, viejo])).toBe(viejo.resumen.salida);
    expect(primerViaje([])).toBeNull();
  });
});
