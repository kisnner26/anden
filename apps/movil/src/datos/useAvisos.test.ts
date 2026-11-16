import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useAvisos } from './useAvisos';

describe('useAvisos por defecto', () => {
  it('no hay avisos ni sin leer', async () => {
    const { result } = await renderHook(() => useAvisos());
    expect(result.current.avisos).toEqual([]);
    expect(result.current.noLeidos).toBe(0);
    expect(result.current.leidos).toEqual([]);
  });

  it('las notificaciones empiezan apagadas y sin preguntar', async () => {
    const { result } = await renderHook(() => useAvisos());
    expect(result.current.activadas).toBe(false);
    expect(result.current.permiso).toBe('sin-preguntar');
  });

  it('activar responde que no quedó activo', async () => {
    const { result } = await renderHook(() => useAvisos());
    expect(await result.current.activar()).toBe(false);
  });

  it('las demás acciones no fallan', async () => {
    const { result } = await renderHook(() => useAvisos());
    await expect(result.current.desactivar()).resolves.toBeUndefined();
    await expect(result.current.eliminar('a')).resolves.toBeUndefined();
    await expect(result.current.eliminarTodos()).resolves.toBeUndefined();
    await expect(result.current.marcarLeido('a')).resolves.toBeUndefined();
    await expect(result.current.marcarTodos()).resolves.toBeUndefined();
  });
});
