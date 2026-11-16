import { describe, expect, it } from 'vitest';

import { normalizar, palabras, rasgos } from './texto';

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
});
