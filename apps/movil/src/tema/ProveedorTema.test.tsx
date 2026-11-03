import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { coloresClaros, coloresOscuros } from './colores';
import { CLAVE_PREFERENCIA_TEMA, ProveedorTema } from './ProveedorTema';
import { useTema } from './useTema';

function Envoltorio({ children }: { children: ReactNode }) {
  return <ProveedorTema>{children}</ProveedorTema>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProveedorTema', () => {
  it('arranca en claro por defecto', async () => {
    const { result } = await renderHook(() => useTema(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargandoTema).toBe(false));
    expect(result.current.modo).toBe('claro');
    expect(result.current.colores).toBe(coloresClaros);
  });

  it('cambia a oscuro y lo guarda', async () => {
    const { result } = await renderHook(() => useTema(), {
      wrapper: Envoltorio,
    });
    await act(async () => result.current.establecerPreferencia('oscuro'));
    expect(result.current.modo).toBe('oscuro');
    expect(result.current.colores).toBe(coloresOscuros);
    expect(await AsyncStorage.getItem(CLAVE_PREFERENCIA_TEMA)).toBe('oscuro');
  });

  it('recupera la preferencia guardada al abrir', async () => {
    await AsyncStorage.setItem(CLAVE_PREFERENCIA_TEMA, 'oscuro');
    const { result } = await renderHook(() => useTema(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.preferencia).toBe('oscuro'));
  });

  it('ignora una preferencia guardada que no existe', async () => {
    await AsyncStorage.setItem(CLAVE_PREFERENCIA_TEMA, 'sistema');
    const { result } = await renderHook(() => useTema(), {
      wrapper: Envoltorio,
    });
    await waitFor(() => expect(result.current.cargandoTema).toBe(false));
    expect(result.current.preferencia).toBe('claro');
  });
});
