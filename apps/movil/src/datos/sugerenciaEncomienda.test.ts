import { describe, expect, it } from '@jest/globals';

import {
  instruccionesDeEncomienda,
  leerSugerenciaEncomienda,
  sugerenciaPorPalabras,
} from './sugerenciaEncomienda';

describe('leerSugerenciaEncomienda', () => {
  it('lee un JSON limpio', () => {
    expect(
      leerSugerenciaEncomienda(
        '{"tamano":"grande","fragil":true,"descripcion":"Caja de vasos"}',
        'caja de vasos',
      ),
    ).toEqual({ descripcion: 'Caja de vasos', fragil: true, tamano: 'grande' });
  });

  it('lo encuentra aunque venga rodeado de texto o de comillas de código', () => {
    const r = leerSugerenciaEncomienda(
      'Claro:\n```json\n{"tamano":"sobre","fragil":false,"descripcion":"Cédula"}\n```',
      'cédula',
    );
    expect(r).toEqual({
      descripcion: 'Cédula',
      fragil: false,
      tamano: 'sobre',
    });
  });

  it('un tamaño inventado cae en la clasificación por palabras', () => {
    const r = leerSugerenciaEncomienda(
      '{"tamano":"enorme","fragil":false,"descripcion":"Documentos"}',
      'unos documentos',
    );
    expect(r.tamano).toBe('sobre');
  });

  it('sin JSON usa la clasificación por palabras del texto original', () => {
    const r = leerSugerenciaEncomienda(
      'No entendí.',
      'una caja de vasos de vidrio',
    );
    expect(r.fragil).toBe(true);
    expect(r.descripcion).toBe('una caja de vasos de vidrio');
  });

  it('una descripción muy larga se recorta', () => {
    const r = leerSugerenciaEncomienda(
      JSON.stringify({
        descripcion: 'a'.repeat(200),
        fragil: false,
        tamano: 'pequeno',
      }),
      'x',
    );
    expect(r.descripcion).toHaveLength(80);
  });

  it('acepta frágil como texto', () => {
    expect(
      leerSugerenciaEncomienda(
        '{"tamano":"pequeno","fragil":"sí","descripcion":"Florero"}',
        'florero',
      ).fragil,
    ).toBe(true);
  });
});

describe('sugerenciaPorPalabras', () => {
  it('documentos son un sobre', () => {
    expect(sugerenciaPorPalabras('unos documentos para mi tía').tamano).toBe(
      'sobre',
    );
  });

  it('un saco o un mueble es grande', () => {
    expect(sugerenciaPorPalabras('un saco de frijoles').tamano).toBe('grande');
  });

  it('lo demás es un paquete chico', () => {
    expect(sugerenciaPorPalabras('unos zapatos').tamano).toBe('pequeno');
  });

  it('detecta lo frágil', () => {
    expect(sugerenciaPorPalabras('un espejo').fragil).toBe(true);
    expect(sugerenciaPorPalabras('ropa').fragil).toBe(false);
  });
});

describe('instruccionesDeEncomienda', () => {
  it('pide solo el JSON con los tres campos', () => {
    const texto = instruccionesDeEncomienda();
    expect(texto).toContain('SOLO con un JSON');
    expect(texto).toContain('"tamano"');
    expect(texto).toContain('"fragil"');
    expect(texto).toContain('"descripcion"');
  });
});
