import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  cancelarRecordatorio,
  leerPermiso,
  pedirPermiso,
  programarRecordatorio,
} from './notificaciones';
import { CLAVE_AVISOS, ProveedorAvisos } from './ProveedorAvisos';
import type { BoletoGuardado } from './reserva';
import { armarSalidas } from './salidas';
import { ContextoBoletos, type ValorBoletos } from './useBoletos';
import { useAvisos } from './useAvisos';
import { obtenerMuestra, reiniciarMuestra } from './useSalidas';

jest.mock('./notificaciones', () => ({
  cancelarRecordatorio: jest.fn(async () => undefined),
  leerPermiso: jest.fn(async () => 'sin-preguntar'),
  mostrarAvisosConLaAppAbierta: jest.fn(),
  pedirPermiso: jest.fn(async () => 'concedido'),
  programarRecordatorio: jest.fn(async () => 'id-recordatorio'),
}));

interface Simulado {
  mockClear: () => void;
  mockResolvedValue: (valor: unknown) => void;
}
const permisoLeido = leerPermiso as unknown as Simulado;
const permisoPedido = pedirPermiso as unknown as Simulado;

/** un boleto vigente en la primera salida de hoy que sale en más de 35 minutos */
function boletoDeMuestra(
  estado: 'usado' | 'vigente' = 'vigente',
): BoletoGuardado {
  const salida = armarSalidas(obtenerMuestra(), new Date()).find(
    (candidata) =>
      candidata.estado === 'programado' &&
      candidata.salida.getTime() > Date.now() + 35 * 60_000,
  );
  if (!salida) throw new Error('la muestra no tiene una salida lejana');
  return {
    boleto: {
      asiento: 8,
      codigo: 'ABCD2345',
      compradoEn: new Date().toISOString(),
      duenoId: 'usu_yo',
      estado,
      id: 'bol_1',
      pasajero: { esMenorEnBrazos: false, nombre: 'Ana' },
      precio: 46,
      viajeId: salida.viajeId,
    },
    resumen: {
      anden: salida.anden,
      choferId: salida.choferId,
      choferNombre: 'Luis',
      cooperativa: 'Cooperativa',
      destino: salida.destino,
      metodoPago: 'efectivo-al-abordar',
      placa: salida.placa,
      salida: salida.salida.toISOString(),
      servicio: salida.servicio,
    },
  };
}

function conBoletos(boletos: BoletoGuardado[]) {
  const valor: ValorBoletos = {
    boletos,
    cancelar: async () => undefined,
    cargando: false,
    reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
  };
  return function Envoltura({ children }: { children: ReactNode }) {
    return (
      <ContextoBoletos.Provider value={valor}>
        <ProveedorAvisos>{children}</ProveedorAvisos>
      </ContextoBoletos.Provider>
    );
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  permisoLeido.mockResolvedValue('sin-preguntar');
  permisoPedido.mockResolvedValue('concedido');
});

afterEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

describe('ProveedorAvisos', () => {
  it('empieza apagado y sin pedir permiso', async () => {
    const { result } = await renderHook(() => useAvisos(), {
      wrapper: conBoletos([boletoDeMuestra()]),
    });
    await waitFor(() => expect(result.current.permiso).toBe('sin-preguntar'));
    expect(result.current.activadas).toBe(false);
    expect(pedirPermiso).not.toHaveBeenCalled();
  });

  it('al activar pide el permiso y programa el recordatorio del boleto vigente', async () => {
    const { result } = await renderHook(() => useAvisos(), {
      wrapper: conBoletos([boletoDeMuestra()]),
    });
    await waitFor(() => expect(result.current.permiso).toBe('sin-preguntar'));
    let activadas = false;
    await act(async () => {
      activadas = await result.current.activar();
    });
    expect(activadas).toBe(true);
    expect(pedirPermiso).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(programarRecordatorio).toHaveBeenCalledTimes(1));
  });

  it('con el permiso negado no activa ni programa nada', async () => {
    permisoPedido.mockResolvedValue('negado');
    const { result } = await renderHook(() => useAvisos(), {
      wrapper: conBoletos([boletoDeMuestra()]),
    });
    await waitFor(() => expect(result.current.permiso).toBe('sin-preguntar'));
    let activadas = true;
    await act(async () => {
      activadas = await result.current.activar();
    });
    expect(activadas).toBe(false);
    expect(result.current.permiso).toBe('negado');
    expect(programarRecordatorio).not.toHaveBeenCalled();
  });

  it('no programa recordatorios de boletos que ya no están vigentes', async () => {
    const { result } = await renderHook(() => useAvisos(), {
      wrapper: conBoletos([boletoDeMuestra('usado')]),
    });
    await waitFor(() => expect(result.current.permiso).toBe('sin-preguntar'));
    await act(async () => {
      await result.current.activar();
    });
    expect(programarRecordatorio).not.toHaveBeenCalled();
  });

  it('al desactivar cancela los recordatorios programados', async () => {
    const { result } = await renderHook(() => useAvisos(), {
      wrapper: conBoletos([boletoDeMuestra()]),
    });
    await waitFor(() => expect(result.current.permiso).toBe('sin-preguntar'));
    await act(async () => {
      await result.current.activar();
    });
    await waitFor(() => expect(programarRecordatorio).toHaveBeenCalled());
    await waitFor(async () =>
      expect(
        (
          JSON.parse((await AsyncStorage.getItem(CLAVE_AVISOS)) ?? '{}') as {
            programados: Record<string, string>;
          }
        ).programados.bol_1,
      ).toBe('id-recordatorio'),
    );
    await act(async () => {
      await result.current.desactivar();
    });
    expect(cancelarRecordatorio).toHaveBeenCalledWith('id-recordatorio');
    expect(result.current.activadas).toBe(false);
  });

  it('recuerda lo leído entre aperturas', async () => {
    await AsyncStorage.setItem(
      CLAVE_AVISOS,
      JSON.stringify({
        activadas: false,
        leidos: ['bol_1:pronto'],
        programados: {},
      }),
    );
    const { result } = await renderHook(() => useAvisos(), {
      wrapper: conBoletos([]),
    });
    await waitFor(() =>
      expect(result.current.leidos).toContain('bol_1:pronto'),
    );
  });
});
