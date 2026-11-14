import { describe, expect, it } from '@jest/globals';

import { ayudaPorDefecto, descripcionDelApuro } from './ayudaDeRumbo';
import type { SenalDeAyuda } from './senalesDeAyuda';

const TODAS: SenalDeAyuda[] = [
  'errorFormulario',
  'errorIngreso',
  'reservaFallida',
  'sinConexion',
  'toquesRepetidos',
];

describe('ayudaDeRumbo', () => {
  it('hay una ayuda escrita y una descripción para cada motivo', () => {
    for (const motivo of TODAS) {
      expect(ayudaPorDefecto(motivo).length).toBeGreaterThan(20);
      expect(descripcionDelApuro(motivo).length).toBeGreaterThan(20);
    }
  });
});
