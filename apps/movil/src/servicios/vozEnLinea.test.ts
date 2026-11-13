import { describe, expect, it } from '@jest/globals';

import {
  direccionDeVoz,
  limpiarParaVoz,
  MAXIMO_POR_TROZO,
  trozosDeTexto,
} from './vozEnLinea';

describe('trozosDeTexto', () => {
  it('un texto corto queda en un solo trozo', () => {
    expect(trozosDeTexto('Sale a las 2:30.')).toEqual(['Sale a las 2:30.']);
  });

  it('parte en frases sin pasar del límite', () => {
    const texto = `${'Primera frase larga. '.repeat(6)}${'Otra más para pasar el límite. '.repeat(5)}`;
    const trozos = trozosDeTexto(texto);
    expect(trozos.length).toBeGreaterThan(1);
    for (const trozo of trozos) {
      expect(trozo.length).toBeLessThanOrEqual(MAXIMO_POR_TROZO);
    }
    expect(trozos.join(' ').replace(/\s+/g, ' ')).toBe(
      texto.trim().replace(/\s+/g, ' '),
    );
  });

  it('una frase gigante se parte por palabras', () => {
    const texto = Array.from({ length: 80 }, () => 'palabra').join(' ');
    for (const trozo of trozosDeTexto(texto)) {
      expect(trozo.length).toBeLessThanOrEqual(MAXIMO_POR_TROZO);
    }
  });

  it('un texto vacío no da trozos', () => {
    expect(trozosDeTexto('   ')).toEqual([]);
  });
});

describe('direccionDeVoz', () => {
  it('codifica el texto y pide español', () => {
    const url = direccionDeVoz('¿Qué hay?');
    expect(url).toContain('tl=es');
    expect(url).toContain(encodeURIComponent('¿Qué hay?'));
  });
});

describe('limpiarParaVoz', () => {
  it('quita las marcas de formato y dice los córdobas', () => {
    expect(limpiarParaVoz('**Sale** a las 2:30. Cuesta C$ 66.')).toBe(
      'Sale a las 2:30. Cuesta 66 córdobas.',
    );
  });
});
