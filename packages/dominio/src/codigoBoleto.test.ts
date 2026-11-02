import { describe, expect, it } from 'vitest';

import { codigoValido, generarCodigo } from './codigoBoleto';

describe('código de boleto', () => {
  it('genera un código determinista válido', () => {
    expect(generarCodigo(() => 0)).toBe('AAAAAAA8');
    expect(codigoValido(generarCodigo(() => 0))).toBe(true);
  });

  it('rechaza caracteres ambiguos y una longitud incorrecta', () => {
    expect(codigoValido('AAAAAAO8')).toBe(false);
    expect(codigoValido('AAAAAA8')).toBe(false);
  });

  it('rechaza un carácter alterado', () => {
    expect(codigoValido('BAAAAAA8')).toBe(false);
  });
});
