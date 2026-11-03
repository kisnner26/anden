import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ProveedorReserva } from './ProveedorReserva';
import { useReserva } from './useReserva';

function Envoltorio({ children }: { children: ReactNode }) {
  return <ProveedorReserva>{children}</ProveedorReserva>;
}

describe('ProveedorReserva', () => {
  it('empieza sin borrador', async () => {
    const { result } = await renderHook(() => useReserva(), {
      wrapper: Envoltorio,
    });
    expect(result.current.borrador).toBeNull();
  });

  it('guarda los pasajeros del viaje', async () => {
    const { result } = await renderHook(() => useReserva(), {
      wrapper: Envoltorio,
    });
    await act(async () => {
      result.current.establecerBorrador('via_2', [
        { asiento: 8, nombre: 'Ana Ruiz' },
      ]);
    });
    expect(result.current.borrador).toEqual({
      pasajeros: [{ asiento: 8, nombre: 'Ana Ruiz' }],
      viajeId: 'via_2',
    });
  });

  it('limpia el borrador', async () => {
    const { result } = await renderHook(() => useReserva(), {
      wrapper: Envoltorio,
    });
    await act(async () => {
      result.current.establecerBorrador('via_2', [
        { asiento: 8, nombre: 'Ana Ruiz' },
      ]);
    });
    await act(async () => result.current.limpiar());
    expect(result.current.borrador).toBeNull();
  });
});
