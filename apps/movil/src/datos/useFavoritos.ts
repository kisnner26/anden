import { createContext, useContext } from 'react';

export interface ValorFavoritos {
  alternar: (id: string) => Promise<void>;
  esFavorito: (id: string) => boolean;
  favoritos: readonly string[];
}

export const ContextoFavoritos = createContext<ValorFavoritos>({
  alternar: async () => undefined,
  esFavorito: () => false,
  favoritos: [],
});

export function useFavoritos(): ValorFavoritos {
  return useContext(ContextoFavoritos);
}
