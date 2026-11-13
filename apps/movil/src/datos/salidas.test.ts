import { describe, expect, it } from '@jest/globals';

import { crearMuestra, VIAJE_BOACO } from './muestra';
import { armarSalidas, proximaSalida, salidasDelDia } from './salidas';

const AHORA = new Date('2026-11-02T20:00:00.000Z');

describe('armarSalidas', () => {
  const datos = crearMuestra(AHORA);
  const salidas = salidasDelDia(armarSalidas(datos, AHORA), AHORA);

  it('ordena las ocho salidas por hora', () => {
    expect(salidas).toHaveLength(8);
    const horas = salidas.map((salida) => salida.salida.getTime());
    expect(horas).toEqual([...horas].sort((a, b) => a - b));
  });

  it('marca como salida la que partió hace diez minutos', () => {
    expect(salidas[0]?.estado).toBe('en-ruta');
  });

  it('marca como atrasada la de Juigalpa con sus diez minutos', () => {
    const juigalpa = salidas.find(
      (salida) => salida.destino === 'Juigalpa' && salida.minutosAtraso > 0,
    );
    expect(juigalpa?.estado).toBe('atrasado');
    expect(juigalpa?.minutosAtraso).toBe(10);
  });

  it('trae la tarifa de muestra de Boaco', () => {
    const boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO);
    expect(boaco?.tarifa).toBe(66);
  });

  it('deja la tarifa en nulo si no hay tarifario', () => {
    const sinTarifas = armarSalidas({ ...datos, tarifario: [] }, AHORA);
    expect(sinTarifas.every((salida) => salida.tarifa === null)).toBe(true);
  });

  it('cuenta los asientos libres de la coaster de Boaco', () => {
    const boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO);
    expect(boaco?.asientosLibres).toBe(26 - 9 - 2);
  });

  it('mantiene la venta abierta veinte minutos antes de salir', () => {
    const boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO);
    expect(boaco?.ventaAbierta).toBe(true);
  });

  it('trae la placa y el chofer de cada unidad', () => {
    const boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO);
    expect(boaco?.placa).toBe('M 222-114');
    expect(boaco?.choferId).toBe('cho_2');
  });
});

describe('proximaSalida', () => {
  it('elige la primera que todavía no partió', () => {
    const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
    expect(proximaSalida(salidas)?.destino).toBe('Boaco');
  });

  it('devuelve nulo si no queda ninguna pendiente', () => {
    expect(proximaSalida([])).toBeNull();
  });
});
