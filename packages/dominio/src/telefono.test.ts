import { describe, expect, it } from 'vitest';

import {
  digitosTelefonoNi,
  formatearTelefonoNi,
  telefonoNiValido,
} from './telefono';

describe('digitosTelefonoNi', () => {
  it('acepta ocho dígitos de celular', () => {
    expect(digitosTelefonoNi('88881234')).toBe('88881234');
  });

  it('acepta el prefijo +505 con espacios', () => {
    expect(digitosTelefonoNi('+505 8888 1234')).toBe('88881234');
  });

  it('acepta el prefijo 505 sin signo y los guiones', () => {
    expect(digitosTelefonoNi('505-7777-1234')).toBe('77771234');
  });

  it('acepta un fijo que empieza en 2', () => {
    expect(digitosTelefonoNi('2266 1234')).toBe('22661234');
  });

  it('rechaza menos de ocho dígitos', () => {
    expect(digitosTelefonoNi('8888123')).toBeNull();
  });

  it('rechaza más de ocho dígitos sin el prefijo del país', () => {
    expect(digitosTelefonoNi('888812345')).toBeNull();
  });

  it('rechaza un primer dígito que no existe en Nicaragua', () => {
    expect(digitosTelefonoNi('18881234')).toBeNull();
  });

  it('rechaza letras', () => {
    expect(digitosTelefonoNi('8888abcd')).toBeNull();
  });

  it('rechaza el texto vacío', () => {
    expect(digitosTelefonoNi('')).toBeNull();
  });
});

describe('telefonoNiValido', () => {
  it('dice si el teléfono sirve', () => {
    expect(telefonoNiValido('+505 8888 1234')).toBe(true);
    expect(telefonoNiValido('123')).toBe(false);
  });
});

describe('formatearTelefonoNi', () => {
  it('muestra +505 con dos grupos de cuatro', () => {
    expect(formatearTelefonoNi('88881234')).toBe('+505 8888 1234');
  });

  it('devuelve nulo si no es válido', () => {
    expect(formatearTelefonoNi('123')).toBeNull();
  });
});
