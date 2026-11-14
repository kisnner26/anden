import { describe, expect, it } from '@jest/globals';

import {
  fraseDeRespaldo,
  instruccionesDeRumbo,
  limpiarRespuestaDeRumbo,
  MAXIMO_RESPUESTA,
} from './mascotaIA';

describe('instruccionesDeRumbo', () => {
  it('incluye los datos reales y las reglas de no inventar', () => {
    const texto = instruccionesDeRumbo('- Boaco a las 3:00 p. m.');
    expect(texto).toContain('Boaco a las 3:00 p. m.');
    expect(texto).toMatch(/sin inventar/);
    expect(texto).toMatch(/voseo/);
  });
});

describe('limpiarRespuestaDeRumbo', () => {
  it('quita identificadores y marcas de formato', () => {
    expect(
      limpiarRespuestaDeRumbo('Tu viaje via_ab12 **sale** hoy.\nBuen viaje'),
    ).toBe('Tu viaje sale hoy. Buen viaje');
  });

  it('recorta lo largo en un final de frase', () => {
    const larga = `${'Salís hoy a las tres. '.repeat(12)}`;
    const salida = limpiarRespuestaDeRumbo(larga);
    expect(salida.length).toBeLessThanOrEqual(MAXIMO_RESPUESTA);
    expect(salida.endsWith('.')).toBe(true);
  });
});

describe('fraseDeRespaldo', () => {
  it('rota entre varias frases', () => {
    expect(fraseDeRespaldo(0)).not.toBe(fraseDeRespaldo(1));
    expect(fraseDeRespaldo(5)).toBe(fraseDeRespaldo(0));
  });
});
