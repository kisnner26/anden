import { describe, expect, it, jest } from '@jest/globals';

import { emitirSenal, escucharSenales } from './senalesDeAyuda';

describe('senalesDeAyuda', () => {
  it('entrega la señal a quien escucha', () => {
    const oyente = jest.fn();
    const dejar = escucharSenales(oyente);
    emitirSenal('errorIngreso');
    expect(oyente).toHaveBeenCalledWith('errorIngreso');
    dejar();
  });

  it('al dejar de escuchar ya no recibe nada', () => {
    const oyente = jest.fn();
    escucharSenales(oyente)();
    emitirSenal('reservaFallida');
    expect(oyente).not.toHaveBeenCalled();
  });

  it('emitir sin oyentes no falla', () => {
    expect(() => emitirSenal('sinConexion')).not.toThrow();
  });
});
