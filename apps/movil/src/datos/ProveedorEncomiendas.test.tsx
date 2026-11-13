import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { ServicioEncomiendas } from '@/servicios/servicioEncomiendas';

import type { DatosEncomienda, Encomienda } from './encomiendas';
import { ProveedorEncomiendas } from './ProveedorEncomiendas';
import { useEncomiendas } from './useEncomiendas';

const DATOS: DatosEncomienda = {
  choferId: 'cho_1',
  descripcion: 'caja chica',
  destinatario: 'Luis',
  destino: 'Boaco',
  origen: 'Managua',
  remitente: 'Ana',
  tamano: 'pequeno',
  telefonoDestinatario: '88881234',
  viajeId: 'via_x',
};

function servicioFalso() {
  let lista: Encomienda[] = [];
  const servicio: ServicioEncomiendas = {
    actualizar: jest.fn(async (e: Encomienda) => {
      lista = lista.map((p) => (p.id === e.id ? e : p));
      return true;
    }),
    guardar: jest.fn(async (e: Encomienda) => {
      lista = [e, ...lista];
      return true;
    }),
    listar: jest.fn(async () => lista),
  };
  return servicio;
}

function envoltura(servicio: ServicioEncomiendas) {
  return ({ children }: { children: ReactNode }) => (
    <ProveedorEncomiendas servicio={servicio}>{children}</ProveedorEncomiendas>
  );
}

describe('ProveedorEncomiendas', () => {
  it('envía una solicitud y la muestra', async () => {
    const servicio = servicioFalso();
    const { result } = await renderHook(() => useEncomiendas(), {
      wrapper: envoltura(servicio),
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    await act(async () => {
      await result.current.enviar(DATOS);
    });
    expect(result.current.encomiendas).toHaveLength(1);
    expect(servicio.guardar).toHaveBeenCalled();
  });

  it('el chofer la acepta y luego la rechaza no puede: ya no admite ese cambio', async () => {
    const servicio = servicioFalso();
    const { result } = await renderHook(() => useEncomiendas(), {
      wrapper: envoltura(servicio),
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    let id = '';
    await act(async () => {
      id = (await result.current.enviar(DATOS))!.id;
    });
    let ok = false;
    await act(async () => {
      ok = await result.current.cambiarEstado(id, 'aceptada');
    });
    expect(ok).toBe(true);
    expect(result.current.encomiendas[0]?.estado).toBe('aceptada');
    await act(async () => {
      ok = await result.current.cambiarEstado(id, 'cancelada');
    });
    expect(ok).toBe(false);
  });

  it('rechazar guarda el motivo para quien envía', async () => {
    const servicio = servicioFalso();
    const { result } = await renderHook(() => useEncomiendas(), {
      wrapper: envoltura(servicio),
    });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    let id = '';
    await act(async () => {
      id = (await result.current.enviar(DATOS))!.id;
    });
    await act(async () => {
      await result.current.cambiarEstado(id, 'rechazada', 'No hay espacio');
    });
    expect(result.current.encomiendas[0]).toMatchObject({
      estado: 'rechazada',
      motivoRechazo: 'No hay espacio',
    });
  });
});
