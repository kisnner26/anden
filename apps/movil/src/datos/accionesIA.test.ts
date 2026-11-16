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

});
