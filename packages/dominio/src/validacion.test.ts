import { describe, expect, it } from 'vitest';

import { correoOpcionalValido, nombrePersonaValido } from './validacion';

describe('nombrePersonaValido', () => {
  it('acepta nombres reales con tildes y espacios', () => {
    expect(nombrePersonaValido('  Kísito Obando  ')).toBe(true);
    expect(nombrePersonaValido("María D'León")).toBe(true);
  });

  it('rechaza nombres vacíos, mínimos, excesivos o con símbolos', () => {
    expect(nombrePersonaValido('')).toBe(false);
    expect(nombrePersonaValido('A')).toBe(false);
    expect(nombrePersonaValido('A'.repeat(81))).toBe(false);
    expect(nombrePersonaValido('Luis 123')).toBe(false);
  });
});

describe('correoOpcionalValido', () => {
  it('acepta vacío y una dirección normalizada', () => {
    expect(correoOpcionalValido('')).toBe(true);
    expect(correoOpcionalValido(' kisnner@correo.com ')).toBe(true);
  });

  it('rechaza dominio incompleto, espacios y puntos dobles', () => {
    expect(correoOpcionalValido('kisnner@correo')).toBe(false);
    expect(correoOpcionalValido('kis nner@correo.com')).toBe(false);
    expect(correoOpcionalValido('kisnner..obando@correo.com')).toBe(false);
  });
});
