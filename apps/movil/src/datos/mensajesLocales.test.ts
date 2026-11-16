import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  guardarMensajeLocal,
  leerMensajesLocales,
  reiniciarMensajesLocales,
} from './mensajesLocales';
import type { MensajeViaje } from './mensajesViaje';

const mensaje: MensajeViaje = {
  de: 'pasajero',
  enviadoEn: '2026-11-16T10:00:00Z',
  hilo: 'bol_1',
  id: 'm1',
  texto: 'hola',
  viajeId: 'via_2',
};

beforeEach(reiniciarMensajesLocales);

describe('mensajes locales', () => {
  it('lo guardado se lee de la misma conversación', () => {
    guardarMensajeLocal(mensaje);
    expect(leerMensajesLocales('via_2', 'bol_1')).toEqual([mensaje]);
  });

  it('otra conversación no ve los mensajes', () => {
    guardarMensajeLocal(mensaje);
    expect(leerMensajesLocales('via_2', 'bol_2')).toEqual([]);
    expect(leerMensajesLocales('via_9', 'bol_1')).toEqual([]);
  });
});
