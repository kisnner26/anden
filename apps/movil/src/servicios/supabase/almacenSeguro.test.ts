import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import { almacenSeguro } from './almacenSeguro';

beforeEach(async () => {
  await AsyncStorage.clear();
  await almacenSeguro.removeItem('sb-demo-auth-token');
});

describe('almacenSeguro', () => {
  it('guarda y devuelve un valor corto', async () => {
    await almacenSeguro.setItem('sb-demo-auth-token', 'hola');
    expect(await almacenSeguro.getItem('sb-demo-auth-token')).toBe('hola');
  });

  it('parte y junta un valor más largo que el límite del Llavero', async () => {
    const largo = 'x'.repeat(5000) + 'fin';
    await almacenSeguro.setItem('sb-demo-auth-token', largo);
    expect(await almacenSeguro.getItem('sb-demo-auth-token')).toBe(largo);
  });

  it('no deja la sesión en el almacenamiento común', async () => {
    await almacenSeguro.setItem('sb-demo-auth-token', 'secreto');
    expect(await AsyncStorage.getItem('sb-demo-auth-token')).toBeNull();
  });

  it('pasa una sesión vieja del almacenamiento común al Llavero', async () => {
    await AsyncStorage.setItem('sb-demo-auth-token', 'sesion-vieja');
    expect(await almacenSeguro.getItem('sb-demo-auth-token')).toBe(
      'sesion-vieja',
    );
    expect(await AsyncStorage.getItem('sb-demo-auth-token')).toBeNull();
    expect(await SecureStore.getItemAsync('sb-demo-auth-token.n')).toBe('1');
  });

  it('al borrar no queda nada en ningún lado', async () => {
    await almacenSeguro.setItem('sb-demo-auth-token', 'secreto');
    await almacenSeguro.removeItem('sb-demo-auth-token');
    expect(await almacenSeguro.getItem('sb-demo-auth-token')).toBeNull();
  });
});
