import { describe, expect, it, jest } from '@jest/globals';

import {
  crearTransmisionLocal,
  sinSenal,
  type PosicionBus,
} from './transmision';

const POSICION: PosicionBus = {
  lat: 12.3,
  lng: -85.9,
  registradaEn: '2026-11-12T18:00:00.000Z',
  velocidadMs: 12,
};

describe('transmisión local', () => {
  it('guarda la última posición de un viaje activo', () => {
    const servicio = crearTransmisionLocal();
    servicio.iniciar('via_1', 'cho_1');
    servicio.publicar('via_1', POSICION);
    expect(servicio.activos()).toEqual(['via_1']);
    expect(servicio.ultima('via_1')).toEqual(POSICION);
  });

  it('ignora posiciones de un viaje que no se inició', () => {
    const servicio = crearTransmisionLocal();
    servicio.publicar('via_1', POSICION);
    expect(servicio.ultima('via_1')).toBeNull();
  });

  it('al detener borra la posición y deja de estar activo', () => {
    const servicio = crearTransmisionLocal();
    servicio.iniciar('via_1', 'cho_1');
    servicio.publicar('via_1', POSICION);
    servicio.detener('via_1');
    expect(servicio.activos()).toEqual([]);
    expect(servicio.ultima('via_1')).toBeNull();
  });

  it('avisa a quien escucha y sube la versión con cada cambio', () => {
    const servicio = crearTransmisionLocal();
    const oyente = jest.fn();
    const dejar = servicio.suscribir(oyente);
    const inicial = servicio.version();
    servicio.iniciar('via_1', 'cho_1');
    servicio.publicar('via_1', POSICION);
    expect(oyente).toHaveBeenCalledTimes(2);
    expect(servicio.version()).toBe(inicial + 2);
    dejar();
    servicio.detener('via_1');
    expect(oyente).toHaveBeenCalledTimes(2);
  });

  it('detener un viaje que no estaba activo no avisa a nadie', () => {
    const servicio = crearTransmisionLocal();
    const oyente = jest.fn();
    servicio.suscribir(oyente);
    servicio.detener('via_x');
    expect(oyente).not.toHaveBeenCalled();
  });
});

describe('sinSenal', () => {
  const ahora = new Date('2026-11-12T18:00:30.000Z');

  it('sin posición está sin señal', () => {
    expect(sinSenal(null, ahora)).toBe(true);
  });

  it('con una posición reciente tiene señal', () => {
    expect(sinSenal(POSICION, ahora)).toBe(false);
  });

  it('pasado el límite pierde la señal', () => {
    expect(sinSenal(POSICION, new Date('2026-11-12T18:03:00.000Z'))).toBe(true);
  });
});
