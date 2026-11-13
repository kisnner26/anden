import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockReproducir = jest.fn<(nombre: string) => Promise<void>>(
  async () => undefined,
);
jest.mock('./sonidos', () => ({
  reproducirSonido: (nombre: string) => mockReproducir(nombre),
}));

import { ajustesDeModo } from '@/tema/modoUso';
import { ContextoModoUso } from '@/tema/useModoUso';

import { useSonidos } from './useSonidos';

function conModo(modo: 'completo' | 'rapido' | 'sencillo') {
  return function Envoltorio({ children }: { children: ReactNode }) {
    return (
      <ContextoModoUso.Provider
        value={{
          ajustes: ajustesDeModo(modo),
          establecerModo: async () => undefined,
          modo,
        }}
      >
        {children}
      </ContextoModoUso.Provider>
    );
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSonidos', () => {
  it('suena en el modo completo', async () => {
    const { result } = await renderHook(() => useSonidos(), {
      wrapper: conModo('completo'),
    });
    result.current('boleto');
    expect(mockReproducir).toHaveBeenCalledWith('boleto');
  });

  it('en los modos sencillo y rápido queda en silencio', async () => {
    for (const modo of ['sencillo', 'rapido'] as const) {
      const { result } = await renderHook(() => useSonidos(), {
        wrapper: conModo(modo),
      });
      result.current('boleto');
    }
    expect(mockReproducir).not.toHaveBeenCalled();
  });
});
