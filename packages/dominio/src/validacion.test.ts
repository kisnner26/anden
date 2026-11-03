import { describe, expect, it } from 'vitest';

import { nombrePersonaValido } from './validacion';

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
