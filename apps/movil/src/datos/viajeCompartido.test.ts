import { describe, expect, it } from '@jest/globals';

import {
  enlaceDeSeguimiento,
  mensajeDeSeguimiento,
  tokenValido,
} from './viajeCompartido';

const TOKEN = '0123456789abcdef0123456789abcdef';

describe('tokenValido', () => {
  it('acepta el código largo del servidor y rechaza lo demás', () => {
    expect(tokenValido(TOKEN)).toBe(true);
    expect(tokenValido('corto')).toBe(false);
    expect(tokenValido(TOKEN.toUpperCase())).toBe(false);
    expect(tokenValido(`${TOKEN}0`)).toBe(false);
    expect(tokenValido(null)).toBe(false);
  });
});

describe('enlaceDeSeguimiento', () => {
  it('arma la dirección con el código y sin barras dobles', () => {
    expect(enlaceDeSeguimiento('https://anden.example/', TOKEN)).toBe(
      `https://anden.example/?t=${TOKEN}`,
    );
  });

  it('sin página configurada, con una dirección que no es https o con un código malo, no hay enlace', () => {
    expect(enlaceDeSeguimiento(undefined, TOKEN)).toBeNull();
    expect(enlaceDeSeguimiento('http://anden.example', TOKEN)).toBeNull();
    expect(enlaceDeSeguimiento('https://anden.example', 'malo')).toBeNull();
  });
});

describe('mensajeDeSeguimiento', () => {
  const base = {
    destino: 'Boaco',
    placa: 'M 123-456',
    salida: '3:30 p. m.',
    viajeId: 'via_a',
  };

  it('con enlace web dice que se ve en vivo sin instalar nada', () => {
    const texto = mensajeDeSeguimiento({
      ...base,
      enlaceWeb: `https://anden.example/?t=${TOKEN}`,
    });
    expect(texto).toContain('Voy en el bus a Boaco');
    expect(texto).toContain('sin instalar nada');
    expect(texto).toContain(`https://anden.example/?t=${TOKEN}`);
  });

  it('sin enlace web usa el que abre la app', () => {
    const texto = mensajeDeSeguimiento({ ...base, enlaceWeb: null });
    expect(texto).toContain('anden://viaje/via_a');
    expect(texto).not.toContain('sin instalar');
  });

  it('nunca incluye el código del boleto', () => {
    expect(mensajeDeSeguimiento({ ...base, enlaceWeb: null })).not.toMatch(
      /K7RM|código/i,
    );
  });
});
