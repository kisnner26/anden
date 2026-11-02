import { afterEach, describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { VIAJE_GRANADA } from './muestra';
import { useMapaAsientos } from './useMapaAsientos';
import { reiniciarMuestra } from './useSalidas';

afterEach(() => reiniciarMuestra());

describe('useMapaAsientos', () => {
  it('arma el plano de la coaster de Granada con 26 asientos', async () => {
    const { result } = await renderHook(() => useMapaAsientos(VIAJE_GRANADA));
    expect(result.current?.asientos).toHaveLength(26);
  });

  it('marca vendidos y apartados según las ocupaciones', async () => {
    const { result } = await renderHook(() => useMapaAsientos(VIAJE_GRANADA));
    expect(result.current?.estados.get(2)).toBe('vendido');
    expect(result.current?.estados.get(6)).toBe('retenido');
    expect(result.current?.estados.get(8)).toBe('libre');
  });

  it('trae la tarifa de muestra del viaje', async () => {
    const { result } = await renderHook(() => useMapaAsientos(VIAJE_GRANADA));
    expect(result.current?.tarifa).toBe(46);
  });

  it('devuelve nulo si el viaje no existe', async () => {
    const { result } = await renderHook(() =>
      useMapaAsientos('via_inexistente'),
    );
    expect(result.current).toBeNull();
  });
});
