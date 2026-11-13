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

  it('la instantánea cambia de identidad con cada cambio y solo entonces', () => {
    const servicio = crearTransmisionLocal();
    const inicial = servicio.instantanea();
    expect(servicio.instantanea()).toBe(inicial);
    servicio.iniciar('via_1', 'cho_1');
    const despues = servicio.instantanea();
    expect(despues).not.toBe(inicial);
    expect(despues.activos).toEqual(['via_1']);
    expect(servicio.instantanea()).toBe(despues);
  });

  it('la instantánea trae las posiciones publicadas y las quita al detener', () => {
    const servicio = crearTransmisionLocal();
    servicio.iniciar('via_1', 'cho_1');
    servicio.publicar('via_1', {
      lat: 1,
      lng: 2,
      registradaEn: new Date().toISOString(),
      velocidadMs: null,
    });
    expect(servicio.instantanea().posiciones.get('via_1')?.lat).toBe(1);
    servicio.detener('via_1');
    expect(servicio.instantanea().posiciones.size).toBe(0);
    expect(servicio.instantanea().activos).toEqual([]);
  });
});
