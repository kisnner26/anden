import { describe, expect, it } from 'vitest';

import {
  codificarPlus,
  completarPlus,
  decodificarPlus,
  enlaceDeMapa,
  esPlusCompleto,
  esPlusCorto,
  leerPlus,
} from './plusCode';

describe('codificarPlus', () => {
  it('da el código de la referencia pública de Zúrich', () => {
    expect(codificarPlus(47.36559, 8.524997)).toBe('8FVC9G8F+6X');
  });

  it('con 8 dígitos termina en el separador', () => {
    expect(codificarPlus(47.365562, 8.524813, 8)).toBe('8FVC9G8F+');
  });

  it('con 11 dígitos agrega uno de la rejilla', () => {
    expect(codificarPlus(47.365562, 8.524813, 11)).toHaveLength(12);
  });
});

describe('decodificarPlus', () => {
  it('vuelve a las coordenadas con menos de 15 metros de diferencia', () => {
    const lat = 12.4693;
    const lng = -85.6597;
    const punto = decodificarPlus(codificarPlus(lat, lng))!;
    expect(Math.abs(punto.lat - lat)).toBeLessThan(0.00015);
    expect(Math.abs(punto.lng - lng)).toBeLessThan(0.00015);
  });

  it('devuelve nulo con basura', () => {
    expect(decodificarPlus('hola')).toBeNull();
    expect(decodificarPlus('8FVC9G8F')).toBeNull();
  });
});

describe('validación', () => {
  it('distingue el código completo del corto', () => {
    expect(esPlusCompleto('8FVC9G8F+6X')).toBe(true);
    expect(esPlusCompleto('9G8F+6X')).toBe(false);
    expect(esPlusCorto('9G8F+6X')).toBe(true);
    expect(esPlusCorto('8FVC9G8F+6X')).toBe(false);
  });

  it('rechaza letras fuera del alfabeto', () => {
    expect(esPlusCompleto('8FVC9G8A+6X')).toBe(false);
  });
});

describe('completarPlus y leerPlus', () => {
  it('completa un corto con la referencia más cercana', () => {
    expect(completarPlus('9G8F+6X', [{ lat: 47.4, lng: 8.6 }])).toBe(
      '8FVC9G8F+6X',
    );
  });

  it('lee un código pegado con la localidad y en minúsculas', () => {
    expect(leerPlus('  8fvc9g8f+6x Zúrich, Suiza ')).toBe('8FVC9G8F+6X');
  });

  it('completa un corto de cada terminal de Nicaragua, aunque quede lejos de Managua', () => {
    for (const [lat, lng] of [
      [12.1364, -86.2514],
      [12.4693, -85.6597],
      [12.1062, -85.3636],
      [12.3, -85.9],
    ] as const) {
      const completo = codificarPlus(lat, lng);
      expect(leerPlus(`${completo.slice(4)} Nicaragua`)).toBe(completo);
    }
  });

  it('devuelve nulo si no hay código', () => {
    expect(leerPlus('andén 3')).toBeNull();
  });
});

describe('enlaceDeMapa', () => {
  it('arma el enlace de Google Maps con las coordenadas del punto', () => {
    expect(enlaceDeMapa('8FVC9G8F+6X')).toMatch(
      /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=47\.36\d+,8\.52\d+$/,
    );
    expect(enlaceDeMapa('xx')).toBeNull();
  });
});
