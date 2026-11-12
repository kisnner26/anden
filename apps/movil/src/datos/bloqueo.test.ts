import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  guardarBloqueoActivo,
  debeBloquear,
  leerBloqueoActivo,
  SEGUNDOS_GRACIA,
} from './bloqueo';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('debeBloquear', () => {
  it('no bloquea si el bloqueo está apagado', () => {
    expect(debeBloquear(false, 9999)).toBe(false);
  });

  it('no bloquea antes del tiempo de gracia', () => {
    expect(debeBloquear(true, SEGUNDOS_GRACIA - 1)).toBe(false);
  });

  it('bloquea justo en el tiempo de gracia', () => {
    expect(debeBloquear(true, SEGUNDOS_GRACIA)).toBe(true);
  });
});

describe('bloqueo guardado', () => {
  it('arranca apagado', async () => {
    expect(await leerBloqueoActivo()).toBe(false);
  });

  it('recuerda que se activó', async () => {
    await guardarBloqueoActivo(true);
    expect(await leerBloqueoActivo()).toBe(true);
  });

  it('recuerda que se apagó', async () => {
    await guardarBloqueoActivo(true);
    await guardarBloqueoActivo(false);
    expect(await leerBloqueoActivo()).toBe(false);
  });
});
