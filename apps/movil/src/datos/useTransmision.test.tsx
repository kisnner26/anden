import { afterEach, describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { TRANSMISION } from '@/servicios/transmision';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { useTransmision, useViajesEnVivo } from '@/datos/useTransmision';

afterEach(() => {
  TRANSMISION.detener('via_1');
  reiniciarMuestra();
});

describe('useTransmision', () => {
  it('empieza sin transmisión', async () => {
    const { result } = await renderHook(() => useTransmision('via_1'));
    expect(result.current.activa).toBe(false);
    expect(result.current.posicion).toBeNull();
  });

  it('se entera cuando el conductor empieza y publica una posición', async () => {
    const { result } = await renderHook(() => useTransmision('via_1'));
    await act(async () => {
      TRANSMISION.iniciar('via_1', 'cho_1');
      TRANSMISION.publicar('via_1', {
        lat: 12.3,
        lng: -85.9,
        registradaEn: new Date().toISOString(),
        velocidadMs: 8,
      });
    });
    expect(result.current.activa).toBe(true);
    expect(result.current.posicion?.lat).toBe(12.3);
    expect(result.current.sinSenal).toBe(false);
  });

  it('marca sin señal si la última posición es vieja', async () => {
    const { result } = await renderHook(() => useTransmision('via_1'));
    await act(async () => {
      TRANSMISION.iniciar('via_1', 'cho_1');
      TRANSMISION.publicar('via_1', {
        lat: 12.3,
        lng: -85.9,
        registradaEn: new Date(Date.now() - 10 * 60_000).toISOString(),
        velocidadMs: 8,
      });
    });
    expect(result.current.activa).toBe(true);
    expect(result.current.sinSenal).toBe(true);
  });

  it('la lista de viajes en vivo se actualiza', async () => {
    const { result } = await renderHook(() => useViajesEnVivo());
    expect(result.current).toEqual([]);
    await act(async () => {
      TRANSMISION.iniciar('via_1', 'cho_1');
    });
    expect(result.current).toEqual(['via_1']);
  });
});
