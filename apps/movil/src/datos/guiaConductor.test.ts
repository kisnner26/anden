import { describe, expect, it } from '@jest/globals';

import { avanceDeGuia, pasosDeGuia, type EstadoDeGuia } from './guiaConductor';

const VACIO: EstadoDeGuia = {
  cerrados: 0,
  conFoto: false,
  nombreListo: true,
  viajesPublicados: 0,
  vioPasajeros: false,
};

describe('guía del conductor', () => {
  it('al empezar solo el nombre está listo y no hay avance', () => {
    const pasos = pasosDeGuia(VACIO);
    expect(pasos.map((p) => p.hecho)).toEqual([false, false, false, false]);
    expect(avanceDeGuia(pasos)).toBe(0);
  });

  it('el perfil necesita foto y nombre', () => {
    expect(pasosDeGuia({ ...VACIO, conFoto: true })[0]?.hecho).toBe(true);
  });

  it('va marcando cada paso y llega al cien por ciento', () => {
    const pasos = pasosDeGuia({
      cerrados: 1,
      conFoto: true,
      nombreListo: true,
      viajesPublicados: 2,
      vioPasajeros: true,
    });
    expect(avanceDeGuia(pasos)).toBe(1);
  });

  it('un viaje publicado marca el segundo paso', () => {
    expect(pasosDeGuia({ ...VACIO, viajesPublicados: 1 })[1]?.hecho).toBe(true);
    expect(avanceDeGuia(pasosDeGuia({ ...VACIO, viajesPublicados: 1 }))).toBe(
      0.25,
    );
  });
});
