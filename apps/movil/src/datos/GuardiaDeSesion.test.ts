import { describe, expect, it } from '@jest/globals';

import { esRutaPublica } from './GuardiaDeSesion';

describe('esRutaPublica', () => {
  it('deja ver la portada, el ingreso y los registros', () => {
    for (const ruta of ['/', '/ingresar', '/cuenta', '/registro-conductor']) {
      expect(esRutaPublica(ruta)).toBe(true);
    }
  });

  it('todo lo demás pide cuenta', () => {
    for (const ruta of [
      '/viajar',
      '/boletos',
      '/ajustes',
      '/plus',
      '/conductor',
    ]) {
      expect(esRutaPublica(ruta)).toBe(false);
    }
  });
});
