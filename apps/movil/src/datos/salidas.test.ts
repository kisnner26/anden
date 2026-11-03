import { describe, expect, it } from '@jest/globals';

import { crearMuestra } from './muestra';
import { armarSalidas, proximaSalida } from './salidas';

const AHORA = new Date('2026-11-02T20:00:00.000Z');

describe('armarSalidas', () => {
  const datos = crearMuestra(AHORA);
  const salidas = armarSalidas(datos, AHORA);

  it('ordena las ocho salidas por hora', () => {
    expect(salidas).toHaveLength(8);
    const horas = salidas.map((salida) => salida.salida.getTime());
    expect(horas).toEqual([...horas].sort((a, b) => a - b));
  });

  it('marca como salida la que partió hace diez minutos', () => {
    expect(salidas[0]?.estado).toBe('en-ruta');
  });

  it('marca como atrasada la de León con sus diez minutos', () => {
    const leon = salidas.find((salida) => salida.destino === 'León');
    expect(leon?.estado).toBe('atrasado');
    expect(leon?.minutosAtraso).toBe(10);
  });

  it('trae la tarifa de muestra de Granada', () => {
    const granada = salidas.find((salida) => salida.destino === 'Granada');
    expect(granada?.tarifa).toBe(46);
  });

  it('deja la tarifa en nulo si no hay tarifario', () => {
    const sinTarifas = armarSalidas({ ...datos, tarifario: [] }, AHORA);
    expect(sinTarifas.every((salida) => salida.tarifa === null)).toBe(true);
  });

  it('cuenta los asientos libres de la coaster de Granada', () => {
    const granada = salidas.find((salida) => salida.destino === 'Granada');
    expect(granada?.asientosLibres).toBe(26 - 9 - 2);
  });

  it('mantiene la venta abierta veinte minutos antes de salir', () => {
    const granada = salidas.find((salida) => salida.destino === 'Granada');
    expect(granada?.ventaAbierta).toBe(true);
  });

  it('trae la placa y el chofer de cada unidad', () => {
    const granada = salidas.find((salida) => salida.destino === 'Granada');
    expect(granada?.placa).toBe('M 222-114');
    expect(granada?.choferId).toBe('cho_2');
  });

  it('identifica el taxi interlocal con su placa', () => {
    const taxi = salidas.find(
      (salida) => salida.servicio === 'taxi-interlocal',
    );
    expect(taxi?.placa).toMatch(/^M \d{3}-\d{3}$/);
  });
});

describe('proximaSalida', () => {
  it('elige la primera que todavía no partió', () => {
    const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
    expect(proximaSalida(salidas)?.destino).toBe('Granada');
  });

  it('devuelve nulo si no queda ninguna pendiente', () => {
    expect(proximaSalida([])).toBeNull();
  });
});
