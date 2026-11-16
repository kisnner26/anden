import { describe, expect, it } from 'vitest';

import {
  codigoDeCabecera,
  cabecerasCors,
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

  it('acepta direcciones IPv4 mapeadas y las de enlace local', () => {
    expect(esRedLocal('::ffff:192.168.0.20')).toBe(true);
    expect(esRedLocal('169.254.10.1')).toBe(true);
    expect(esRedLocal('fe80::1')).toBe(true);
    expect(esRedLocal('::1')).toBe(true);
  });

  it('rechaza direcciones públicas', () => {
    for (const d of [
      '8.8.8.8',
      '172.32.0.1',
      '172.15.0.1',
      '192.169.1.1',
      '200.1.2.3',
    ])
      expect(esRedLocal(d)).toBe(false);
  });

  it('rechaza lo que no es una dirección', () => {
    expect(esRedLocal(undefined)).toBe(false);
    expect(esRedLocal('')).toBe(false);
    expect(esRedLocal('192.168.1')).toBe(false);
    expect(esRedLocal('300.1.1.1')).toBe(false);
  });
});

describe('codigoValido', () => {
  it('acepta el código correcto', () => {
    expect(codigoValido('abc123', 'abc123')).toBe(true);
  });

  it('rechaza uno distinto, uno de otro largo y la falta de código', () => {
    expect(codigoValido('abc124', 'abc123')).toBe(false);
    expect(codigoValido('abc', 'abc123')).toBe(false);
    expect(codigoValido(undefined, 'abc123')).toBe(false);
  });
});

describe('codigoDeCabecera', () => {
  it('saca el código de una cabecera Bearer', () => {
    expect(codigoDeCabecera('Bearer 0123456789abcdef0123')).toBe(
      '0123456789abcdef0123',
    );
  });

  it('rechaza cabeceras mal formadas', () => {
    expect(codigoDeCabecera(undefined)).toBeUndefined();
    expect(codigoDeCabecera('Basic 0123456789abcdef0123')).toBeUndefined();
    expect(codigoDeCabecera('Bearer corto')).toBeUndefined();
    expect(codigoDeCabecera('Bearer 0123456789abcdef0123; rm')).toBeUndefined();
  });
});

describe('crearLimite', () => {
  it('deja pasar hasta el máximo de pedidos en la ventana', () => {
    const permitido = crearLimite(2, 1000, () => 0);
    expect([permitido(), permitido(), permitido()]).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('vuelve a dejar pasar cuando termina la ventana', () => {
    let ahora = 0;
    const permitido = crearLimite(1, 1000, () => ahora);
    expect(permitido()).toBe(true);
    expect(permitido()).toBe(false);
    ahora = 1500;
    expect(permitido()).toBe(true);
  });
});

describe('cabecerasCors', () => {
  it('deja que la página mande el código en la cabecera de autorización', () => {
    expect(cabecerasCors()['Access-Control-Allow-Headers']).toContain(
      'authorization',
    );
  });

  it('solo permite consultar y preguntar', () => {
    expect(cabecerasCors()['Access-Control-Allow-Methods']).toBe(
      'GET, POST, OPTIONS',
    );
  });

  it('acepta el permiso de red privada que pide el navegador', () => {
    expect(cabecerasCors()['Access-Control-Allow-Private-Network']).toBe(
      'true',
    );
  });
});
