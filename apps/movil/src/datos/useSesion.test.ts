import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useSesion } from './useSesion';

describe('useSesion por defecto', () => {
  it('no hay sesión y el rol es pasajero', async () => {
    const { result } = await renderHook(() => useSesion());
    expect(result.current.sesion).toBeNull();
    expect(result.current.rol).toBe('pasajero');
  });

  it('iniciar sesión responde que las credenciales no sirven', async () => {
    const { result } = await renderHook(() => useSesion());
    expect(await result.current.iniciar('ana', 'clave')).toEqual({
      error: 'credenciales',
      ok: false,
    });
  });

  it('registrar responde que no hay conexión', async () => {
    const { result } = await renderHook(() => useSesion());
    const resultado = await result.current.registrar({} as never);
    expect(resultado).toEqual({ error: 'conexion', ok: false });
  });
});
