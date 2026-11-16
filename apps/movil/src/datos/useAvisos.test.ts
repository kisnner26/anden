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
});
