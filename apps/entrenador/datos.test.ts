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
});
