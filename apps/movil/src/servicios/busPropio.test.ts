import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import { CLAVE_BUS_PROPIO, guardarBusPropio, leerBusPropio } from './busPropio';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('busPropio', () => {
  it('sin nada guardado no hay bus propio', async () => {
    expect(await leerBusPropio()).toBeNull();
  });

  it('guarda y lee la variante elegida', async () => {
    await guardarBusPropio('coaster-turquesa');
    expect(await leerBusPropio()).toBe('coaster-turquesa');
  });

  it('quitarlo deja de nuevo el reparto por destino', async () => {
    await guardarBusPropio('micro-azul');
    await guardarBusPropio(null);
    expect(await leerBusPropio()).toBeNull();
  });

  it('una variante que ya no existe se ignora', async () => {
    await AsyncStorage.setItem(CLAVE_BUS_PROPIO, 'doble-ambar');
    expect(await leerBusPropio()).toBeNull();
  });
});
