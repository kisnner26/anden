import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  franjaDelDia,
  guardarMascotaActiva,
  leerMascotaActiva,
} from './mascota';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('franjaDelDia', () => {
  it('las 5 ya son mañana', () => {
    expect(franjaDelDia(5)).toBe('manana');
  });

  it('las 11 siguen siendo mañana y las 12 son tarde', () => {
    expect(franjaDelDia(11)).toBe('manana');
    expect(franjaDelDia(12)).toBe('tarde');
  });

  it('las 18 son tarde y las 19 son noche', () => {
    expect(franjaDelDia(18)).toBe('tarde');
    expect(franjaDelDia(19)).toBe('noche');
  });

  it('de medianoche a las 4 es madrugada', () => {
    expect(franjaDelDia(0)).toBe('madrugada');
    expect(franjaDelDia(4)).toBe('madrugada');
  });
});

describe('preferencia de la mascota', () => {
  it('viene encendida', async () => {
    expect(await leerMascotaActiva()).toBe(true);
  });

  it('recuerda que se apagó', async () => {
    await guardarMascotaActiva(false);
    expect(await leerMascotaActiva()).toBe(false);
  });

  it('recuerda que se volvió a encender', async () => {
    await guardarMascotaActiva(false);
    await guardarMascotaActiva(true);
    expect(await leerMascotaActiva()).toBe(true);
  });
});
