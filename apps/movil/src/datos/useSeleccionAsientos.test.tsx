import { afterEach, describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { VIAJE_BOACO } from './muestra';
import { useSeleccionAsientos } from './useSeleccionAsientos';
import { reiniciarMuestra } from './useSalidas';

afterEach(() => reiniciarMuestra());

describe('useSeleccionAsientos', () => {
  it('empieza sin asientos elegidos', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    expect(result.current.elegidos).toEqual([]);
    expect(result.current.aviso).toBeNull();
  });

  it('elige un asiento libre', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    await act(async () => result.current.alternar(8));
    expect(result.current.elegidos).toEqual([8]);
  });

  it('quita un asiento que ya estaba elegido', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    await act(async () => result.current.alternar(8));
    await act(async () => result.current.alternar(8));
    expect(result.current.elegidos).toEqual([]);
  });

  it('rechaza un asiento vendido con aviso', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    await act(async () => result.current.alternar(2));
    expect(result.current.elegidos).toEqual([]);
    expect(result.current.aviso).toBe('asiento-ocupado');
  });

  it('no deja pasar de seis asientos', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    for (const numero of [1, 4, 7, 8, 9, 12]) {
      await act(async () => result.current.alternar(numero));
    }
    expect(result.current.elegidos).toHaveLength(6);
    await act(async () => result.current.alternar(13));
    expect(result.current.elegidos).toHaveLength(6);
    expect(result.current.aviso).toBe('maximo-6');
  });

  it('avisa que la venta cerró en un viaje que ya salió', async () => {
    const { result } = await renderHook(() => useSeleccionAsientos('via_1'));
    await act(async () => result.current.alternar(7));
    expect(result.current.elegidos).toEqual([]);
    expect(result.current.aviso).toBe('venta-cerrada');
  });

  it('no hay total mientras no se elige ningún asiento', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    expect(result.current.total).toBeNull();
  });

  it('calcula el total de la tarifa de muestra por asiento', async () => {
    const { result } = await renderHook(() =>
      useSeleccionAsientos(VIAJE_BOACO),
    );
    await act(async () => result.current.alternar(8));
    await act(async () => result.current.alternar(9));
    expect(result.current.total).toEqual({ total: 132, unitario: 66 });
  });
});
