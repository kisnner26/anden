import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  elegirVoz,
  guardarRespuestaHablada,
  leerRespuestaHablada,
} from './voz';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('elegirVoz', () => {
  it('prefiere la voz en español de mejor calidad', () => {
    expect(
      elegirVoz([
        { identifier: 'en', language: 'en-US', quality: 'Premium' },
        { identifier: 'basica', language: 'es-MX', quality: 'Default' },
        { identifier: 'mejorada', language: 'es-ES', quality: 'Enhanced' },
      ]),
    ).toBe('mejorada');
  });

  it('a igual calidad prefiere la del idioma exacto', () => {
    expect(
      elegirVoz([
        { identifier: 'es', language: 'es-ES', quality: 'Enhanced' },
        { identifier: 'mx', language: 'es-MX', quality: 'Enhanced' },
      ]),
    ).toBe('mx');
  });

  it('sin voces en español no elige ninguna', () => {
    expect(
      elegirVoz([{ identifier: 'en', language: 'en-US' }]),
    ).toBeUndefined();
  });
});

describe('respuesta hablada', () => {
  it('arranca apagada y recuerda lo que se elige', async () => {
    expect(await leerRespuestaHablada()).toBe(false);
    await guardarRespuestaHablada(true);
    expect(await leerRespuestaHablada()).toBe(true);
  });
});
