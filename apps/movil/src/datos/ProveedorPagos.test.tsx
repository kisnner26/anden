import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ProveedorPagos } from '@/datos/ProveedorPagos';
import { usePagos } from '@/datos/usePagos';

const envolver = ({ children }: { children: ReactNode }) => (
  <ProveedorPagos>{children}</ProveedorPagos>
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorPagos', () => {
  it('todo empieza pendiente', async () => {
    const { result } = await renderHook(() => usePagos(), {
      wrapper: envolver,
    });
    expect(result.current.estadoDe('bol_1')).toBe('pendiente');
  });

  it('marca y revierte un pago y lo recuerda', async () => {
    const { result } = await renderHook(() => usePagos(), {
      wrapper: envolver,
    });
    await act(async () => {
      await result.current.marcarPagado('bol_1', 'cho_2');
    });
    expect(result.current.estadoDe('bol_1')).toBe('pagado_efectivo');
    expect(result.current.registro.bol_1?.marcadoPor).toBe('cho_2');

    await act(async () => {
      await result.current.revertir('bol_1');
    });
    expect(result.current.estadoDe('bol_1')).toBe('pendiente');
  });

  it('recupera los pagos guardados', async () => {
    await AsyncStorage.setItem(
      'anden.pagos',
      JSON.stringify({ bol_9: { estado: 'pagado_efectivo' } }),
    );
    const { result } = await renderHook(() => usePagos(), {
      wrapper: envolver,
    });
    await waitFor(() =>
      expect(result.current.estadoDe('bol_9')).toBe('pagado_efectivo'),
    );
  });
});
