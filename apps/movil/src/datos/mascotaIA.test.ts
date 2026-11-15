import { describe, expect, it } from '@jest/globals';

import {
  instruccionesDeAyuda,
  limpiarRespuestaDeRumbo,
  MAXIMO_RESPUESTA,
} from './mascotaIA';

describe('instruccionesDeAyuda', () => {
  it('pide una sola frase directa, sin presentarse, y lleva la pantalla, el apuro y los datos', () => {
    const texto = instruccionesDeAyuda({
      apuro: 'no logra iniciar sesión',
      datos: '- Boaco a las 3:00 p. m.',
      pantalla: 'el ingreso a la cuenta',
    });
    expect(texto).toContain('el ingreso a la cuenta');
    expect(texto).toContain('no logra iniciar sesión');
    expect(texto).toContain('Boaco a las 3:00 p. m.');
    expect(texto).toMatch(/UNA sola frase/);
    expect(texto).toMatch(/No te presentes/);
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
