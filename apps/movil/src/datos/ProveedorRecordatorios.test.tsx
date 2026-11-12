import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

jest.mock('@/datos/notificaciones', () => ({
  cancelarRecordatorio: jest.fn(),
  leerPermiso: jest.fn(),
  pedirPermiso: jest.fn(),
  programarRecordatorio: jest.fn(),
}));

import {
  cancelarRecordatorio,
  leerPermiso,
  pedirPermiso,
  programarRecordatorio,
} from '@/datos/notificaciones';
import { ProveedorRecordatorios } from '@/datos/ProveedorRecordatorios';
import { CLAVE_RECORDATORIOS } from '@/datos/recordatorios';
import type { Salida } from '@/datos/salidas';
import { useRecordatorios } from '@/datos/useRecordatorios';

function salidaEn(minutos: number, viajeId = 'via_1'): Salida {
  return {
    anden: 3,
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 000000',
    rutaId: 'rut_1',
    salida: new Date(Date.now() + minutos * 60_000),
    servicio: 'ordinario',
    tarifa: 100,
    ventaAbierta: true,
    viajeId,
  };
}

const envolver = ({ children }: { children: ReactNode }) => (
  <ProveedorRecordatorios>{children}</ProveedorRecordatorios>
);

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  jest.mocked(leerPermiso).mockResolvedValue('concedido');
  jest.mocked(pedirPermiso).mockResolvedValue('concedido');
  jest.mocked(programarRecordatorio).mockResolvedValue('notif_1');
  jest.mocked(cancelarRecordatorio).mockResolvedValue(undefined);
});

describe('ProveedorRecordatorios', () => {
  it('programa el aviso, lo guarda y lo encuentra por salida', async () => {
    const { result } = await renderHook(() => useRecordatorios(), {
      wrapper: envolver,
    });
    let resultado = '';
    await act(async () => {
      resultado = await result.current.programar(salidaEn(120), 30);
    });

    expect(resultado).toBe('listo');
    expect(programarRecordatorio).toHaveBeenCalledTimes(1);
    expect(
      jest.mocked(programarRecordatorio).mock.calls[0]?.[0].texto.titulo,
    ).toBe('Tu bus a Boaco sale en 30 min');
    expect(result.current.de('via_1')?.identificador).toBe('notif_1');
    expect(
      JSON.parse((await AsyncStorage.getItem(CLAVE_RECORDATORIOS)) ?? '[]'),
    ).toHaveLength(1);
  });

  it('pide el permiso si todavía no lo tiene y respeta un no', async () => {
    jest.mocked(leerPermiso).mockResolvedValue('sin-preguntar');
    jest.mocked(pedirPermiso).mockResolvedValue('negado');
    const { result } = await renderHook(() => useRecordatorios(), {
      wrapper: envolver,
    });
    let resultado = '';
    await act(async () => {
      resultado = await result.current.programar(salidaEn(120), 30);
    });

    expect(resultado).toBe('permiso-negado');
    expect(programarRecordatorio).not.toHaveBeenCalled();
    expect(result.current.recordatorios).toEqual([]);
  });

  it('no programa un aviso que ya habría sonado', async () => {
    const { result } = await renderHook(() => useRecordatorios(), {
      wrapper: envolver,
    });
    let resultado = '';
    await act(async () => {
      resultado = await result.current.programar(salidaEn(10), 30);
    });

    expect(resultado).toBe('ya-paso');
    expect(programarRecordatorio).not.toHaveBeenCalled();
  });

  it('al cambiar los minutos reemplaza el aviso anterior', async () => {
    const { result } = await renderHook(() => useRecordatorios(), {
      wrapper: envolver,
    });
    await act(async () => {
      await result.current.programar(salidaEn(120), 30);
    });
    jest.mocked(programarRecordatorio).mockResolvedValue('notif_2');
    await act(async () => {
      await result.current.programar(salidaEn(120), 60);
    });

    expect(cancelarRecordatorio).toHaveBeenCalledWith('notif_1');
    expect(result.current.recordatorios).toHaveLength(1);
    expect(result.current.de('via_1')?.minutosAntes).toBe(60);
  });

  it('quita el aviso del teléfono y de la lista', async () => {
    const { result } = await renderHook(() => useRecordatorios(), {
      wrapper: envolver,
    });
    await act(async () => {
      await result.current.programar(salidaEn(120), 30);
    });
    await act(async () => {
      await result.current.quitar('via_1');
    });

    expect(cancelarRecordatorio).toHaveBeenCalledWith('notif_1');
    expect(result.current.recordatorios).toEqual([]);
  });

  it('recupera los guardados y descarta los de salidas que ya pasaron', async () => {
    const base = {
      anden: 3,
      destino: 'Boaco',
      identificador: 'x',
      minutosAntes: 30,
    };
    await AsyncStorage.setItem(
      CLAVE_RECORDATORIOS,
      JSON.stringify([
        {
          ...base,
          salida: new Date(Date.now() + 3_600_000).toISOString(),
          viajeId: 'futuro',
        },
        {
          ...base,
          salida: new Date(Date.now() - 3_600_000).toISOString(),
          viajeId: 'pasado',
        },
      ]),
    );
    const { result } = await renderHook(() => useRecordatorios(), {
      wrapper: envolver,
    });

    await waitFor(() => expect(result.current.recordatorios).toHaveLength(1));
    expect(result.current.de('futuro')).toBeDefined();
    expect(result.current.de('pasado')).toBeUndefined();
  });
});
