import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { CLAVE_BOLETOS, ProveedorBoletos } from './ProveedorBoletos';
import { VIAJE_BOACO } from './muestra';
import { obtenerMuestra, reiniciarMuestra } from './useSalidas';
import { useBoletos } from './useBoletos';

function Envoltorio({ children }: { children: ReactNode }) {
  return <ProveedorBoletos>{children}</ProveedorBoletos>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});
afterEach(() => reiniciarMuestra());

const PASAJEROS = [{ asiento: 8, nombre: 'Ana Ruiz' }];

describe('ProveedorBoletos', () => {
  it('empieza sin boletos', async () => {
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.boletos).toEqual([]);
  });

  it('reserva y guarda el boleto en el teléfono', async () => {
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    let resultado;
    await act(async () => {
      resultado = await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    expect(resultado).toMatchObject({ ok: true });
    expect(result.current.boletos).toHaveLength(1);
    const guardado = await AsyncStorage.getItem(CLAVE_BOLETOS);
    expect(guardado).toContain('Ana Ruiz');
  });

  it('reserva un viaje de otro día y guarda su fecha y su hora', async () => {
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    const manana = obtenerMuestra().viajes.find(
      (viaje) => viaje.id === 'via_d1_0_0',
    )!;
    let resultado;
    await act(async () => {
      resultado = await result.current.reservar(manana.id, PASAJEROS);
    });
    expect(resultado).toMatchObject({ ok: true });
    expect(result.current.boletos[0]?.resumen.salida).toBe(manana.salida);
    expect(result.current.boletos[0]?.boleto.viajeId).toBe(manana.id);
  });

  it('marca el asiento reservado como vendido en la muestra', async () => {
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    const ocupacion = obtenerMuestra().ocupaciones.find(
      (o) => o.viajeId === VIAJE_BOACO && o.asiento === 8,
    );
    expect(ocupacion?.estado).toBe('vendido');
  });

  it('no reserva dos veces el mismo asiento', async () => {
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    let segundo;
    await act(async () => {
      segundo = await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    expect(segundo).toEqual({ error: 'asiento-ocupado', ok: false });
    expect(result.current.boletos).toHaveLength(1);
  });

  it('cancela un boleto, libera el asiento y conserva su estado', async () => {
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    const id = result.current.boletos[0]?.boleto.id ?? '';
    await act(async () => {
      await result.current.cancelar(id);
    });
    expect(result.current.boletos[0]?.boleto.estado).toBe('cancelado');
    expect(
      obtenerMuestra().ocupaciones.some(
        (o) => o.estado === 'vendido' && o.boletoId === id,
      ),
    ).toBe(false);
    expect(await AsyncStorage.getItem(CLAVE_BOLETOS)).toContain(
      '"estado":"cancelado"',
    );
  });

  it('recupera los boletos guardados al abrir la app', async () => {
    const primero = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(primero.result.current.cargando).toBe(false));
    await act(async () => {
      await primero.result.current.reservar(VIAJE_BOACO, PASAJEROS);
    });
    reiniciarMuestra();
    const segundo = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(segundo.result.current.boletos).toHaveLength(1));
  });

  it('ignora un contenido guardado que no se puede leer', async () => {
    await AsyncStorage.setItem(CLAVE_BOLETOS, 'esto no es json');
    const { result } = await renderHook(() => useBoletos(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.boletos).toEqual([]);
  });
});
