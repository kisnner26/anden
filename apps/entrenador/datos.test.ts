import { describe, expect, it } from 'vitest';

import { validarFrase } from './datos.ts';

describe('validarFrase', () => {
  it('acepta una frase con su intención', () => {
    expect(
      validarFrase({ etiqueta: 'precio', texto: 'cuanto cuesta' }),
    ).toEqual({ etiqueta: 'precio', texto: 'cuanto cuesta' });
  });

  it('junta los espacios y recorta', () => {
    expect(
      validarFrase({ etiqueta: 'saludo', texto: '  hola   que   tal ' })?.texto,
    ).toBe('hola que tal');
  });

  it('rechaza lo que no es un objeto', () => {
    expect(validarFrase(null)).toBeNull();
    expect(validarFrase('hola')).toBeNull();
  });

  it('rechaza una frase demasiado corta o demasiado larga', () => {
    expect(validarFrase({ etiqueta: 'saludo', texto: 'h' })).toBeNull();
    expect(
      validarFrase({ etiqueta: 'saludo', texto: 'a'.repeat(161) }),
    ).toBeNull();
  });

  it('rechaza una intención con caracteres raros', () => {
    expect(validarFrase({ etiqueta: '../../etc', texto: 'hola' })).toBeNull();
    expect(validarFrase({ etiqueta: 'Saludo', texto: 'hola' })).toBeNull();
  });

  it('rechaza campos que no son texto', () => {
    expect(validarFrase({ etiqueta: 3, texto: 'hola' })).toBeNull();
    expect(validarFrase({ etiqueta: 'saludo', texto: 4 })).toBeNull();
  });
});
