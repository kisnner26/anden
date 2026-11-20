import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CLAVE_BOLETO_CLASICO, leerBoletoClasico } from './boletoClasico';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('leerBoletoClasico', () => {
  it('por defecto está apagado', async () => {
    expect(await leerBoletoClasico()).toBe(false);
  });

  it('lee lo que se guardó antes', async () => {
    await AsyncStorage.setItem(CLAVE_BOLETO_CLASICO, '1');
    expect(await leerBoletoClasico()).toBe(true);
  });

  it('cualquier valor distinto de 1 cuenta como apagado', async () => {
    await AsyncStorage.setItem(CLAVE_BOLETO_CLASICO, 'si');
    expect(await leerBoletoClasico()).toBe(false);
  });
});
