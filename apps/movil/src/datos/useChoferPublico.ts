import { useEffect, useState } from 'react';

import {
  leerPerfilChofer,
  type PerfilPublicoChofer,
} from '@/servicios/supabase/perfilChoferSupabase';

const cache = new Map<string, PerfilPublicoChofer>();

/** limpia lo recordado; solo para pruebas */
export function reiniciarChoferesPublicos(): void {
  cache.clear();
}

/** lo que el chofer publicó de sí mismo (nombre y foto); nulo si no publicó nada o no hay servidor */
export function useChoferPublico(choferId: string): PerfilPublicoChofer | null {
  const [publico, establecerPublico] = useState<PerfilPublicoChofer | null>(
    cache.get(choferId) ?? null,
  );

  useEffect(() => {
    if (choferId === '') return;
    let vigente = true;
    void leerPerfilChofer(choferId).then((leido) => {
      if (!vigente || leido === null) return;
      cache.set(choferId, leido);
      establecerPublico(leido);
    });
    return () => {
      vigente = false;
    };
  }, [choferId]);

  return publico;
}
