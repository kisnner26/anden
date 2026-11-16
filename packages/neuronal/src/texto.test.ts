import { describe, expect, it } from 'vitest';

import { normalizar, palabras, rasgos } from './texto.ts';

describe('normalizar', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizar('¿Cuánto CUESTA?')).toBe('cuanto cuesta');
  });

  it('junta los espacios repetidos y recorta', () => {
    expect(normalizar('  bus   a    Boaco  ')).toBe('bus a boaco');
  });

  it('cambia los signos por espacios', () => {
    expect(normalizar('hola,mundo!')).toBe('hola mundo');
  });

  it('deja el texto vacío vacío', () => {
    expect(normalizar('¿?!')).toBe('');
  });
});

describe('palabras', () => {
  it('separa las palabras', () => {
    expect(palabras('Quiero ir a León')).toEqual(['quiero', 'ir', 'a', 'leon']);
  });

  it('un texto vacío no tiene palabras', () => {
    expect(palabras('   ')).toEqual([]);
  });
});

describe('rasgos', () => {
  it('incluye cada palabra', () => {
    expect(rasgos('bus boaco')).toEqual(
      expect.arrayContaining(['p:bus', 'p:boaco']),
    );
  });

  it('incluye los pares de palabras seguidas', () => {
    expect(rasgos('bus a boaco')).toEqual(
      expect.arrayContaining(['b:bus_a', 'b:a_boaco']),
    );
  });

  it('incluye trozos de tres letras con marca de inicio y fin', () => {
    const lista = rasgos('bus');
    expect(lista).toEqual(expect.arrayContaining(['c:^bu', 'c:bus', 'c:us$']));
  });

  it('una palabra mal escrita comparte trozos con la correcta', () => {
    const a = new Set(rasgos('boaco'));
    const compartidos = rasgos('boacoo').filter(
      (r) => a.has(r) && r.startsWith('c:'),
    );
    expect(compartidos.length).toBeGreaterThanOrEqual(3);
  });
});
