import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  AJUSTES_CONDUCTOR_INICIALES,
  cargarAjustesConductor,
  guardarAjustesConductor,
  type AjustesConductor,
} from '@/servicios/ajustesConductor';

import { ContextoAjustesConductor } from './useAjustesConductor';

/** comparte los ajustes del conductor y los guarda en el teléfono */
export function ProveedorAjustesConductor({
  children,
}: {
  children: ReactNode;
}) {
  const [ajustes, establecerAjustes] = useState<AjustesConductor>(
    AJUSTES_CONDUCTOR_INICIALES,
  );

  useEffect(() => {
    let vigente = true;
    void cargarAjustesConductor().then((leidos) => {
      if (vigente) establecerAjustes(leidos);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = useCallback(
    async (cambios: Partial<AjustesConductor>) => {
      const nuevos = { ...ajustes, ...cambios };
      establecerAjustes(nuevos);
      await guardarAjustesConductor(nuevos);
    },
    [ajustes],
  );

  const valor = useMemo(() => ({ ajustes, cambiar }), [ajustes, cambiar]);

  return (
    <ContextoAjustesConductor.Provider value={valor}>
      {children}
    </ContextoAjustesConductor.Provider>
  );
}
