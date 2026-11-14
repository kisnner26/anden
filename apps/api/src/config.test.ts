import { describe, expect, it } from 'vitest';

import { leerConfiguracion, origenesPermitidos } from './config';

describe('leerConfiguracion', () => {
  it('con un entorno vacío usa valores por defecto sensatos', () => {
    const c = leerConfiguracion({});
    expect(c).toMatchObject({
      NIVEL_DE_REGISTRO: 'info',
      NODE_ENV: 'development',
      PETICIONES_POR_MINUTO: 120,
      PUERTO: 3000,
    });
  });

  it('convierte el puerto a número', () => {
    expect(leerConfiguracion({ PUERTO: '8080' }).PUERTO).toBe(8080);
  });

  it('un puerto o una dirección inválida impide arrancar y dice cuál variable', () => {
    expect(() => leerConfiguracion({ PUERTO: 'abc' })).toThrow(/PUERTO/);
    expect(() => leerConfiguracion({ SUPABASE_URL: 'no es url' })).toThrow(
      /SUPABASE_URL/,
    );
  });
});

describe('origenesPermitidos', () => {
  it('separa por comas y quita espacios y vacíos', () => {
    const c = leerConfiguracion({
      ORIGENES_PERMITIDOS: ' https://a.example , ,https://b.example ',
    });
    expect(origenesPermitidos(c)).toEqual([
      'https://a.example',
      'https://b.example',
    ]);
  });

  it('sin nada configurado no permite ningún origen', () => {
    expect(origenesPermitidos(leerConfiguracion({}))).toEqual([]);
  });
});
