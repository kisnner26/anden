import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  CLAVE_BOLETO_CLASICO,
  guardarBoletoClasico,
  leerBoletoClasico,
  useBoletoClasico,
} from './boletoClasico';

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

describe('guardarBoletoClasico', () => {
  it('se enciende y se apaga', async () => {
    await guardarBoletoClasico(true);
    expect(await leerBoletoClasico()).toBe(true);
    await guardarBoletoClasico(false);
    expect(await leerBoletoClasico()).toBe(false);
  });
});

describe('useBoletoClasico', () => {
  it('lee lo guardado', async () => {
    await AsyncStorage.setItem(CLAVE_BOLETO_CLASICO, '1');
    const { result } = await renderHook(() => useBoletoClasico());
    await waitFor(() => expect(result.current.activo).toBe(true));
  });

  it('al cambiar se actualiza y queda guardado', async () => {
    const { result } = await renderHook(() => useBoletoClasico());
    await waitFor(() => expect(result.current.activo).toBe(false));
    await act(async () => {
      await result.current.cambiar(true);
    });
    expect(result.current.activo).toBe(true);
    expect(await leerBoletoClasico()).toBe(true);
  });

  it('otra pantalla que lo muestra se entera al instante', async () => {
    const a = await renderHook(() => useBoletoClasico());
    const b = await renderHook(() => useBoletoClasico());
    await waitFor(() => expect(b.result.current.activo).toBe(false));
    await act(async () => {
      await a.result.current.cambiar(true);
    });
    expect(b.result.current.activo).toBe(true);
  });
});
