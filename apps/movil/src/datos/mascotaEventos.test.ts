import { describe, expect, it, jest } from '@jest/globals';

import { emitirMascota, escucharMascota } from './mascotaEventos';

describe('mascotaEventos', () => {
  it('entrega el evento a quien escucha', () => {
    const oyente = jest.fn();
    const dejar = escucharMascota(oyente);
    emitirMascota({ destino: 'Boaco', tipo: 'reserva' });
    expect(oyente).toHaveBeenCalledWith({ destino: 'Boaco', tipo: 'reserva' });
    dejar();
  });

  it('al dejar de escuchar ya no recibe nada', () => {
    const oyente = jest.fn();
    escucharMascota(oyente)();
    emitirMascota({ tipo: 'calificacion' });
    expect(oyente).not.toHaveBeenCalled();
  });

  it('emitir sin oyentes no falla', () => {
    expect(() => emitirMascota({ tipo: 'conexion' })).not.toThrow();
  });
});
