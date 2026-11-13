import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  armarContacto,
  CLAVE_CONTACTO,
  guardarContacto,
  leerContacto,
  enlaceDeViaje,
  mensajeDeViaje,
  urlSms,
} from './contactoConfianza';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('armarContacto', () => {
  it('acepta un teléfono de Nicaragua con espacios o prefijo', () => {
    expect(armarContacto(' Mamá ', '+505 8888 1234')).toEqual({
      nombre: 'Mamá',
      telefono: '88881234',
    });
  });

  it('rechaza un teléfono inválido o un nombre vacío', () => {
    expect(armarContacto('Mamá', '1234')).toBeNull();
    expect(armarContacto('', '88881234')).toBeNull();
    expect(armarContacto('M', '88881234')).toBeNull();
  });
});

describe('mensaje y enlace', () => {
  const MENSAJE = mensajeDeViaje({
    chofer: 'Ernesto Calero',
    destino: 'Boaco',
    enlace: 'anden://viaje/via_2',
    llegada: '3:26 p. m.',
    placa: 'M 211-107',
    salida: '1:45 p. m.',
  });

  it('dice a dónde va, a qué hora y en qué unidad', () => {
    expect(MENSAJE).toContain('Boaco');
    expect(MENSAJE).toContain('1:45 p. m.');
    expect(MENSAJE).toContain('3:26 p. m.');
    expect(MENSAJE).toContain('M 211-107');
    expect(MENSAJE).toContain('Ernesto Calero');
  });

  it('incluye el enlace para seguir el viaje en Andén', () => {
    expect(MENSAJE).toContain('anden://viaje/via_2');
    expect(enlaceDeViaje('via_9')).toBe('anden://viaje/via_9');
  });

  it('arma el enlace de mensajes con el texto codificado', () => {
    const url = urlSms({ nombre: 'Mamá', telefono: '88881234' }, MENSAJE);
    expect(url.startsWith('sms:+50588881234&body=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Voy en el bus a Boaco'));
  });
});

describe('guardado', () => {
  it('empieza sin contacto', async () => {
    expect(await leerContacto()).toBeNull();
  });

  it('guarda y lee el contacto', async () => {
    await guardarContacto({ nombre: 'Mamá', telefono: '88881234' });
    expect(await leerContacto()).toEqual({
      nombre: 'Mamá',
      telefono: '88881234',
    });
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_CONTACTO, 'no es json');
    expect(await leerContacto()).toBeNull();
    await AsyncStorage.setItem(CLAVE_CONTACTO, JSON.stringify({ nombre: 1 }));
    expect(await leerContacto()).toBeNull();
  });
});
