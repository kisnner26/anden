import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, expect, it } from '@jest/globals';

import {
  CLAVE_UBICACION_AUTOMATICA,
  guardarUbicacionAutomatica,
  leerUbicacionAutomatica,
} from './preferenciaUbicacion';

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('recupera la preferencia activada sin guardar coordenadas', async () => {
  await guardarUbicacionAutomatica(true);

  expect(await leerUbicacionAutomatica()).toBe(true);
  expect(await AsyncStorage.getItem(CLAVE_UBICACION_AUTOMATICA)).toBe('1');
  expect(JSON.stringify(await AsyncStorage.getAllKeys())).not.toMatch(
    /lat|lng|coordenada/,
  );
});

it('permanece desactivada al inicio y después de apagarla', async () => {
  expect(await leerUbicacionAutomatica()).toBe(false);

  await guardarUbicacionAutomatica(true);
  await guardarUbicacionAutomatica(false);

  expect(await leerUbicacionAutomatica()).toBe(false);
  expect(await AsyncStorage.getItem(CLAVE_UBICACION_AUTOMATICA)).toBe('0');
});
