import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/datos/ubicacion', () => ({
  solicitarAccesoUbicacion: jest.fn(),
}));
jest.mock('@/datos/seguirUbicacion', () => ({
  seguirUbicacion: jest.fn(),
}));
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(async () => undefined),
  deactivateKeepAwake: jest.fn(async () => undefined),
}));

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { seguirUbicacion } from '@/datos/seguirUbicacion';
import {
  detenerTodas,
  detenerTransmision,
  iniciarTransmision,
} from '@/datos/transmisor';
import { solicitarAccesoUbicacion } from '@/datos/ubicacion';
import { TRANSMISION, type PosicionBus } from '@/servicios/transmision';

const POSICION: PosicionBus = {
  lat: 12.3,
  lng: -85.9,
  registradaEn: new Date().toISOString(),
  velocidadMs: 10,
};

let publicar: (posicion: PosicionBus) => void = () => undefined;
const parar = jest.fn();

beforeEach(() => {
  detenerTodas();
  jest.clearAllMocks();
  jest
    .mocked(solicitarAccesoUbicacion)
    .mockResolvedValue({ estado: 'otorgado' });
  jest.mocked(seguirUbicacion).mockImplementation(async (alPosicion) => {
    publicar = alPosicion;
    return parar;
  });
});

describe('transmisor', () => {
  it('con permiso empieza a publicar las posiciones del teléfono', async () => {
    expect(await iniciarTransmision('via_1', 'cho_1')).toBe('ok');
    expect(TRANSMISION.activos()).toContain('via_1');
    publicar(POSICION);
    expect(TRANSMISION.ultima('via_1')).toEqual(POSICION);
    expect(activateKeepAwakeAsync).toHaveBeenCalled();
    detenerTransmision('via_1');
  });

  it('no empieza si se niega el permiso', async () => {
    jest
      .mocked(solicitarAccesoUbicacion)
      .mockResolvedValue({ estado: 'denegado', puedePreguntar: false });
    expect(await iniciarTransmision('via_1', 'cho_1')).toBe('permiso-negado');
    expect(TRANSMISION.activos()).not.toContain('via_1');
    expect(seguirUbicacion).not.toHaveBeenCalled();
  });

  it('avisa si el servicio de ubicación está apagado', async () => {
    jest
      .mocked(solicitarAccesoUbicacion)
      .mockResolvedValue({ estado: 'desactivado' });
    expect(await iniciarTransmision('via_1', 'cho_1')).toBe('desactivado');
  });

  it('si el GPS falla deja el viaje sin transmitir', async () => {
    jest.mocked(seguirUbicacion).mockRejectedValue(new Error('sin GPS'));
    expect(await iniciarTransmision('via_1', 'cho_1')).toBe('error');
    expect(TRANSMISION.activos()).not.toContain('via_1');
  });

  it('iniciar dos veces el mismo viaje no escucha dos veces', async () => {
    await iniciarTransmision('via_1', 'cho_1');
    await iniciarTransmision('via_1', 'cho_1');
    expect(seguirUbicacion).toHaveBeenCalledTimes(1);
    detenerTransmision('via_1');
  });

  it('al detener deja de escuchar, borra la posición y suelta la pantalla', async () => {
    await iniciarTransmision('via_1', 'cho_1');
    publicar(POSICION);
    detenerTransmision('via_1');
    expect(parar).toHaveBeenCalledTimes(1);
    expect(TRANSMISION.ultima('via_1')).toBeNull();
    expect(deactivateKeepAwake).toHaveBeenCalled();
  });

  it('detenerTodas corta cada viaje', async () => {
    await iniciarTransmision('via_1', 'cho_1');
    await iniciarTransmision('via_2', 'cho_1');
    detenerTodas();
    expect(TRANSMISION.activos()).toEqual([]);
  });

  it('el viaje aparece activo al instante, sin esperar el permiso', async () => {
    let responder: (v: { estado: 'otorgado' }) => void = () => undefined;
    jest.mocked(solicitarAccesoUbicacion).mockReturnValue(
      new Promise((resolver) => {
        responder = resolver;
      }),
    );
    const promesa = iniciarTransmision('via_1', 'cho_1');
    expect(TRANSMISION.activos()).toContain('via_1');
    responder({ estado: 'otorgado' });
    expect(await promesa).toBe('ok');
    detenerTransmision('via_1');
  });

  it('si se termina el viaje mientras arranca el GPS, suelta el GPS', async () => {
    let responder: (v: { estado: 'otorgado' }) => void = () => undefined;
    jest.mocked(solicitarAccesoUbicacion).mockReturnValue(
      new Promise((resolver) => {
        responder = resolver;
      }),
    );
    const promesa = iniciarTransmision('via_1', 'cho_1');
    detenerTransmision('via_1');
    responder({ estado: 'otorgado' });
    expect(await promesa).toBe('ok');
    expect(parar).toHaveBeenCalled();
    expect(TRANSMISION.activos()).not.toContain('via_1');
  });
});
