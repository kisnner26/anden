import { describe, expect, it } from '@jest/globals';

import { accionDeOrden, leerAcciones, minutosValidos } from './accionesIA';
import { interpretarOrden } from './ordenesIA';

describe('minutosValidos', () => {
  it('acerca lo pedido al aviso más cercano que la app programa', () => {
    expect(minutosValidos(10)).toBe(15);
    expect(minutosValidos(40)).toBe(30);
    expect(minutosValidos(50)).toBe(60);
    expect(minutosValidos(600)).toBe(60);
  });

  it('usa 30 si no dijo un número claro', () => {
    expect(minutosValidos(undefined)).toBe(30);
    expect(minutosValidos(-5)).toBe(30);
    expect(minutosValidos('mucho')).toBe(30);
  });
});

describe('leerAcciones', () => {
  it('deja las acciones conocidas con valores válidos', () => {
    expect(
      leerAcciones([{ minutos: 20, tipo: 'avisar' }, { tipo: 'compartir' }]),
    ).toEqual([{ minutos: 15, tipo: 'avisar' }, { tipo: 'compartir' }]);
  });

  it('ignora lo que el modelo invente', () => {
    expect(
      leerAcciones([
        { tipo: 'borrarCuenta' },
        { pantalla: 'secreta', tipo: 'abrir' },
        { tipo: 'mensaje', texto: 'hola' },
        'compartir',
        null,
      ]),
    ).toEqual([]);
  });

  it('acepta abrir solo pantallas que existen', () => {
    expect(leerAcciones([{ pantalla: 'boletos', tipo: 'abrir' }])).toEqual([
      { pantalla: 'boletos', tipo: 'abrir' },
    ]);
  });

  it('quita repetidas y se queda con dos como máximo', () => {
    expect(
      leerAcciones([
        { tipo: 'compartir' },
        { tipo: 'compartir' },
        { minutos: 15, tipo: 'avisar' },
        { pantalla: 'avisos', tipo: 'abrir' },
      ]),
    ).toEqual([{ tipo: 'compartir' }, { minutos: 15, tipo: 'avisar' }]);
  });

  it('devuelve vacío si no es una lista', () => {
    expect(leerAcciones(undefined)).toEqual([]);
    expect(leerAcciones({ tipo: 'compartir' })).toEqual([]);
  });
});

describe('postal', () => {
  it('acepta la postal de una ciudad con ficha', () => {
    expect(leerAcciones([{ ciudad: 'boaco', tipo: 'postal' }])).toEqual([
      { ciudad: 'Boaco', tipo: 'postal' },
    ]);
  });

  it('descarta la postal de una ciudad que no existe', () => {
    expect(leerAcciones([{ ciudad: 'Atlantis', tipo: 'postal' }])).toEqual([]);
    expect(leerAcciones([{ tipo: 'postal' }])).toEqual([]);
  });

  it('entiende pedir una postal por orden', () => {
    expect(accionDeOrden('hacé una postal de Juigalpa')).toEqual({
      ciudad: 'Juigalpa',
      tipo: 'postal',
    });
    expect(accionDeOrden('hacé una postal')).toBeNull();
  });
});

describe('accionDeOrden', () => {
  it('entiende un aviso con minutos', () => {
    expect(
      accionDeOrden('avisame 30 minutos antes de que salga mi bus'),
    ).toEqual({
      minutos: 30,
      tipo: 'avisar',
    });
    expect(accionDeOrden('recordame mi viaje una hora antes')).toEqual({
      minutos: 60,
      tipo: 'avisar',
    });
  });

  it('entiende compartir el viaje', () => {
    expect(accionDeOrden('compartí mi viaje')).toEqual({ tipo: 'compartir' });
    expect(accionDeOrden('mandale mi viaje a mi mamá')).toEqual({
      tipo: 'compartir',
    });
  });

  it('no confunde una pregunta con una acción', () => {
    expect(accionDeOrden('cuánto cuesta ir a Boaco')).toBeNull();
    expect(accionDeOrden('avisame cuando haya bus a Boaco')).toBeNull();
  });
});

describe('interpretarOrden con acciones', () => {
  const ciudades = ['Managua', 'Boaco', 'Juigalpa'];

  it('devuelve la acción antes de buscar una ciudad', () => {
    expect(
      interpretarOrden('avisame 15 minutos antes de mi bus a Boaco', ciudades),
    ).toEqual({ accion: { minutos: 15, tipo: 'avisar' }, tipo: 'accion' });
  });

  it('sigue reservando como antes', () => {
    expect(
      interpretarOrden('reservame un boleto a Boaco', ciudades)?.tipo,
    ).toBe('reservar');
  });
});
