import { describe, expect, it } from 'vitest';

import {
  codigoDeCabecera,
  codigoValido,
  crearLimite,
  esRedLocal,
} from './seguridad.ts';

describe('esRedLocal', () => {
  it('acepta las direcciones privadas de una casa u oficina', () => {
    for (const d of [
      '192.168.1.52',
      '10.0.0.8',
      '172.16.4.1',
      '172.31.255.1',
      '127.0.0.1',
    ])
      expect(esRedLocal(d)).toBe(true);
  });
});
