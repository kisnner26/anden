import { describe, expect, it } from 'vitest';

import { codigoDelPuente, direccionDelPuente } from './claude';

const CODIGO = 'a'.repeat(48);

describe('direccionDelPuente', () => {
  it('acepta un equipo con su puerto y le quita la barra final', () => {
    expect(direccionDelPuente(' http://192.168.1.52:4780/ ')).toBe(
      'http://192.168.1.52:4780',
    );
  });

  it('acepta esta misma Mac', () => {
    expect(direccionDelPuente('http://127.0.0.1:4780')).toBe(
      'http://127.0.0.1:4780',
    );
  });

  it('sin puerto no sirve', () => {
    expect(direccionDelPuente('http://192.168.1.52')).toBeNull();
  });

  it('otros protocolos no sirven', () => {
    expect(direccionDelPuente('ftp://192.168.1.52:4780')).toBeNull();
  });

  it('con una ruta o una consulta no sirve', () => {
    expect(direccionDelPuente('http://192.168.1.52:4780/x')).toBeNull();
    expect(direccionDelPuente('http://192.168.1.52:4780/?a=1')).toBeNull();
  });

  it('un texto que no es una dirección no sirve', () => {
    expect(direccionDelPuente('hola')).toBeNull();
  });
});

describe('codigoDelPuente', () => {
  it('acepta 48 caracteres hexadecimales y los pasa a minúscula', () => {
    expect(codigoDelPuente(` ${'A'.repeat(48)} `)).toBe(CODIGO);
  });

  it('con otro largo o con otros caracteres no sirve', () => {
    expect(codigoDelPuente('a'.repeat(47))).toBeNull();
    expect(codigoDelPuente('z'.repeat(48))).toBeNull();
  });
});
