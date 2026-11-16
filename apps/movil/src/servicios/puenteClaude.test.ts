import { describe, expect, it } from '@jest/globals';

import { codigoDelPuente, urlDelPuente } from './puenteClaude';

describe('urlDelPuente', () => {
  it('acepta una dirección de la red local con puerto', () => {
    expect(urlDelPuente('http://192.168.1.52:4780')).toBe(
      'http://192.168.1.52:4780',
    );
    expect(urlDelPuente('http://10.0.0.8:4780/')).toBe('http://10.0.0.8:4780');
    expect(urlDelPuente('http://172.20.1.1:4780')).toBe(
      'http://172.20.1.1:4780',
    );
  });

  it('acepta un nombre .local de la Mac', () => {
    expect(urlDelPuente('http://mi-mac.local:4780')).toBe(
      'http://mi-mac.local:4780',
    );
  });

  it('rechaza direcciones de internet', () => {
    expect(urlDelPuente('http://8.8.8.8:4780')).toBeNull();
    expect(urlDelPuente('https://ejemplo.com:443')).toBeNull();
    expect(urlDelPuente('http://172.32.0.1:4780')).toBeNull();
  });

  it('rechaza lo que no lleva puerto o no es una dirección', () => {
    expect(urlDelPuente('http://192.168.1.52')).toBeNull();
    expect(urlDelPuente('192.168.1.52:4780')).toBeNull();
    expect(urlDelPuente('')).toBeNull();
    expect(urlDelPuente('http://192.168.1.52:99999')).toBeNull();
  });

  it('rechaza direcciones con trucos en el nombre', () => {
    expect(urlDelPuente('http://192.168.1.52.evil.com:4780')).toBeNull();
    expect(urlDelPuente('http://user@192.168.1.52:4780')).toBeNull();
  });
});

describe('codigoDelPuente', () => {
  it('acepta el código de 48 caracteres y lo pasa a minúscula', () => {
    const c = 'ABCDEF0123456789'.repeat(3);
    expect(codigoDelPuente(` ${c} `)).toBe(c.toLowerCase());
  });
});
