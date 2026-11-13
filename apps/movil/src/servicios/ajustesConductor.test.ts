import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  AJUSTES_CONDUCTOR_INICIALES,
  ajustesConductorActuales,
  cargarAjustesConductor,
  guardarAjustesConductor,
  leerAjustesConductor,
} from './ajustesConductor';

beforeEach(async () => {
  await AsyncStorage.clear();
  await guardarAjustesConductor(AJUSTES_CONDUCTOR_INICIALES);
});

describe('ajustes del conductor', () => {
  it('por defecto no pide Face ID y mantiene la pantalla encendida', () => {
    expect(AJUSTES_CONDUCTOR_INICIALES).toEqual({
      exigirBiometria: false,
      pantallaEncendida: true,
    });
  });

  it('lee lo guardado y completa lo que falta', () => {
    expect(leerAjustesConductor('{"exigirBiometria":true}')).toEqual({
      exigirBiometria: true,
      pantallaEncendida: true,
    });
    expect(leerAjustesConductor('no es json')).toEqual(
      AJUSTES_CONDUCTOR_INICIALES,
    );
    expect(leerAjustesConductor(null)).toEqual(AJUSTES_CONDUCTOR_INICIALES);
  });

  it('guardar los recuerda para quien no está en un componente y sobreviven al reinicio', async () => {
    await guardarAjustesConductor({
      exigirBiometria: true,
      pantallaEncendida: false,
    });
    expect(ajustesConductorActuales().exigirBiometria).toBe(true);
    await guardarAjustesConductor(AJUSTES_CONDUCTOR_INICIALES);
    await AsyncStorage.setItem(
      'anden.ajustes-conductor',
      '{"exigirBiometria":true,"pantallaEncendida":false}',
    );
    expect(await cargarAjustesConductor()).toEqual({
      exigirBiometria: true,
      pantallaEncendida: false,
    });
  });
});
