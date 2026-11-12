import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_SUSCRIPCION,
  ESTADO_GRATIS,
  PRECIO_PLUS_USD,
  crearSuscripcionLocal,
  esPlus,
  leerEstado,
} from './suscripcion';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('suscripción', () => {
  it('cuesta 5 dólares al mes', () => {
    expect(PRECIO_PLUS_USD).toBe(5);
  });

  it('sin nada guardado es plan gratis', async () => {
    const estado = await crearSuscripcionLocal().leer();
    expect(estado).toEqual(ESTADO_GRATIS);
    expect(esPlus(estado)).toBe(false);
  });

  it('activar guarda Plus con la fecha', async () => {
    const servicio = crearSuscripcionLocal();
    const ahora = new Date('2026-11-12T10:00:00Z');
    const estado = await servicio.activar(ahora);
    expect(esPlus(estado)).toBe(true);
    expect(await servicio.leer()).toEqual({
      desde: ahora.toISOString(),
      plan: 'plus',
    });
  });

  it('cancelar vuelve al plan gratis', async () => {
    const servicio = crearSuscripcionLocal();
    await servicio.activar();
    expect(await servicio.cancelar()).toEqual(ESTADO_GRATIS);
    expect(await AsyncStorage.getItem(CLAVE_SUSCRIPCION)).toBeNull();
  });

  it('un valor roto o incompleto se lee como gratis', () => {
    expect(leerEstado('{no es json')).toEqual(ESTADO_GRATIS);
    expect(leerEstado(JSON.stringify({ plan: 'plus' }))).toEqual(ESTADO_GRATIS);
  });
});
