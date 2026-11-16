import { act, renderHook, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/servicios/supabase/cliente', () => ({
  obtenerCliente: jest.fn(() => null),
}));
jest.mock('@/servicios/supabase/mensajesSupabase', () => ({
  enviarMensaje: jest.fn(async () => false),
  leerMensajes: jest.fn(async () => null),
}));

import {
  guardarMensajeLocal,
  reiniciarMensajesLocales,
} from './mensajesLocales';
import { useMensajesViaje } from './useMensajesViaje';

beforeEach(reiniciarMensajesLocales);

describe('useMensajesViaje', () => {
  it('sin servidor, lo enviado aparece en la conversación', async () => {
    const { result } = await renderHook(() =>
      useMensajesViaje('via_2', 'bol_1', 'pasajero', true),
    );
    await act(async () => {
      expect(await result.current.enviar('  ya   estoy  aquí ')).toBe(true);
    });
    await waitFor(() => expect(result.current.mensajes).toHaveLength(1));
    expect(result.current.mensajes[0]?.texto).toBe('ya estoy aquí');
  });

  it('un mensaje vacío no se envía', async () => {
    const { result } = await renderHook(() =>
      useMensajesViaje('via_2', 'bol_1', 'pasajero', true),
    );
    await act(async () => {
      expect(await result.current.enviar('   ')).toBe(false);
    });
    expect(result.current.mensajes).toHaveLength(0);
  });

  it('con la conversación inactiva no se envía nada', async () => {
    const { result } = await renderHook(() =>
      useMensajesViaje('via_2', 'bol_1', 'pasajero', false),
    );
    await act(async () => {
      expect(await result.current.enviar('hola')).toBe(false);
    });
  });

  it('lo escrito por el chofer cuenta como sin leer hasta marcarlo visto', async () => {
    guardarMensajeLocal({
      de: 'chofer',
      enviadoEn: '2026-11-16T10:00:00Z',
      hilo: 'bol_1',
      id: 'm1',
      texto: 'voy a llegar en 10',
      viajeId: 'via_2',
    });
    const { result } = await renderHook(() =>
      useMensajesViaje('via_2', 'bol_1', 'pasajero', true),
    );
    await waitFor(() => expect(result.current.sinLeer).toBe(1));
    await act(async () => result.current.marcarVisto());
    expect(result.current.sinLeer).toBe(0);
  });
});
