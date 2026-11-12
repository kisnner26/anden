import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  ajustesDeModo,
  ajustesPara,
  CLAVE_MODO_USO,
  esModoUso,
  guardarModoUso,
  leerModoUso,
  MODOS_USO,
} from './modoUso';

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('ajustesDeModo', () => {
  it('el modo completo no cambia nada', () => {
    expect(ajustesDeModo('completo')).toEqual({
      escalaTexto: 1,
      reducirMovimiento: false,
      simplificado: false,
    });
  });

  it('el modo sencillo agranda la letra y quita animaciones', () => {
    const sencillo = ajustesDeModo('sencillo');
    expect(sencillo.escalaTexto).toBeGreaterThan(1);
    expect(sencillo.reducirMovimiento).toBe(true);
  });

  it('el modo rápido quita animaciones sin agrandar la letra', () => {
    const rapido = ajustesDeModo('rapido');
    expect(rapido.escalaTexto).toBe(1);
    expect(rapido.reducirMovimiento).toBe(true);
  });

  it('todos los modos tienen ajustes', () => {
    for (const modo of MODOS_USO) {
      expect(ajustesDeModo(modo)).toBeDefined();
    }
  });
});

describe('esModoUso', () => {
  it('reconoce los tres modos', () => {
    expect(MODOS_USO.every(esModoUso)).toBe(true);
  });

  it('rechaza cualquier otra cosa', () => {
    expect(esModoUso('experto')).toBe(false);
    expect(esModoUso(null)).toBe(false);
    expect(esModoUso(3)).toBe(false);
  });
});

describe('modo guardado', () => {
  it('arranca en completo', async () => {
    expect(await leerModoUso()).toBe('completo');
  });

  it('recuerda el modo elegido', async () => {
    await guardarModoUso('sencillo');
    expect(await leerModoUso()).toBe('sencillo');
  });

  it('ignora un valor guardado que no existe', async () => {
    await AsyncStorage.setItem(CLAVE_MODO_USO, 'inventado');
    expect(await leerModoUso()).toBe('completo');
  });
});

describe('ajustesPara', () => {
  it('una persona mayor sin modo elegido recibe la interfaz adaptada', () => {
    const ajustes = ajustesPara('completo', true);
    expect(ajustes.escalaTexto).toBeGreaterThan(1);
    expect(ajustes.simplificado).toBe(true);
    expect(ajustes.reducirMovimiento).toBe(true);
  });

  it('si eligió otro modo, ese manda', () => {
    expect(ajustesPara('rapido', true)).toEqual(ajustesDeModo('rapido'));
  });

  it('una persona menor no cambia nada', () => {
    expect(ajustesPara('completo', false)).toEqual(ajustesDeModo('completo'));
  });
});
