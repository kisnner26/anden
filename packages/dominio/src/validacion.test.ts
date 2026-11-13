import { describe, expect, it } from 'vitest';

import {
  cedulaOpcionalValida,
  cedulaValida,
  formatearCedula,
  correoOpcionalValido,
  claveValida,
  nombrePersonaValido,
  normalizarUsuario,
  telefonoClave,
  usuarioValido,
} from './validacion';

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

describe('cedulaOpcionalValida', () => {
  it('acepta vacío y la estructura nicaragüense', () => {
    expect(cedulaOpcionalValida('')).toBe(true);
    expect(cedulaOpcionalValida('001-010190-0001a')).toBe(true);
  });

  it('rechaza longitudes, separadores y sufijos incorrectos', () => {
    expect(cedulaOpcionalValida('0010101900001A')).toBe(false);
    expect(cedulaOpcionalValida('001-010190-001A')).toBe(false);
    expect(cedulaOpcionalValida('001-010190-00011')).toBe(false);
  });
});

describe('cedulaValida', () => {
  it('acepta una cédula completa con fecha posible, sin importar mayúsculas ni espacios', () => {
    expect(cedulaValida('001-010190-0001A')).toBe(true);
    expect(cedulaValida('  001-010190-0001a ')).toBe(true);
  });

  it('es obligatoria: vacío no vale', () => {
    expect(cedulaValida('')).toBe(false);
    expect(cedulaValida('   ')).toBe(false);
  });

  it('rechaza la estructura incorrecta', () => {
    expect(cedulaValida('0010101900001A')).toBe(false);
    expect(cedulaValida('001-010190-0001')).toBe(false);
    expect(cedulaValida('001-010190-00011')).toBe(false);
  });

  it('rechaza una fecha de nacimiento imposible', () => {
    expect(cedulaValida('001-310290-0001A')).toBe(false);
    expect(cedulaValida('001-011390-0001A')).toBe(false);
    expect(cedulaValida('001-000190-0001A')).toBe(false);
  });

  it('acepta el 29 de febrero de un año bisiesto', () => {
    expect(cedulaValida('001-290200-0001A')).toBe(true);
  });
});

describe('formatearCedula', () => {
  it('pone los guiones y la mayúscula mientras se escribe', () => {
    expect(formatearCedula('0010101900001a')).toBe('001-010190-0001A');
    expect(formatearCedula('001010')).toBe('001-010');
    expect(formatearCedula('001')).toBe('001');
    expect(formatearCedula('')).toBe('');
  });

  it('ignora lo que no es letra ni número y no pasa de la longitud', () => {
    expect(formatearCedula('001-010190-0001A99')).toBe('001-010190-0001A');
    expect(formatearCedula('00 1.01')).toBe('001-01');
  });
});

describe('usuarioValido', () => {
  it('acepta de 3 a 20 caracteres en minúscula, con punto y guion bajo', () => {
    expect(usuarioValido('kis')).toBe(true);
    expect(usuarioValido(' Kisnner_26 ')).toBe(true);
    expect(usuarioValido('ana.ruiz')).toBe(true);
  });

  it('rechaza cortos, largos, con espacios, tildes, símbolos o arroba', () => {
    expect(usuarioValido('ab')).toBe(false);
    expect(usuarioValido('a'.repeat(21))).toBe(false);
    expect(usuarioValido('ana ruiz')).toBe(false);
    expect(usuarioValido('josé')).toBe(false);
    expect(usuarioValido('ana@correo.com')).toBe(false);
    expect(usuarioValido('_ana')).toBe(false);
  });

  it('normaliza a minúsculas', () => {
    expect(normalizarUsuario('  AnaRuiz ')).toBe('anaruiz');
  });
});

describe('claveValida', () => {
  it('pide 8 caracteres con letra y número', () => {
    expect(claveValida('andén2026')).toBe(true);
    expect(claveValida('corta1')).toBe(false);
    expect(claveValida('sinnumeros')).toBe(false);
    expect(claveValida('12345678')).toBe(false);
    expect(claveValida('a1'.repeat(37))).toBe(false);
  });
});

describe('telefonoClave', () => {
  it('deja los 8 dígitos con o sin prefijo y separadores', () => {
    expect(telefonoClave('8888 8888')).toBe('88888888');
    expect(telefonoClave('+505 8888-8888')).toBe('88888888');
  });

  it('devuelve vacío si no es un teléfono de Nicaragua', () => {
    expect(telefonoClave('1234')).toBe('');
    expect(telefonoClave('ana')).toBe('');
    expect(telefonoClave('1001')).toBe('');
  });
});
