import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { CUENTAS_CONDUCTOR_MUESTRA } from '@/servicios/cuentasMuestra';
import {
  crearSesionLocal,
  rolDe,
  type ServicioSesion,
  type Sesion,
} from '@/servicios/sesion';

import { ContextoSesion, type ValorSesion } from './useSesion';

const SERVICIO_LOCAL = crearSesionLocal(CUENTAS_CONDUCTOR_MUESTRA);

/** comparte quién está usando la app y con qué rol; sin sesión, la persona es pasajera */
export function ProveedorSesion({
  children,
  servicio = SERVICIO_LOCAL,
}: {
  children: ReactNode;
  servicio?: ServicioSesion;
}) {
  const [sesion, establecerSesion] = useState<Sesion | null>(null);
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    void servicio
      .actual()
      .then((actual) => {
        if (vigente) establecerSesion(actual);
      })
      .finally(() => {
        if (vigente) establecerCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [servicio]);

  const iniciarComoConductor = useCallback<ValorSesion['iniciarComoConductor']>(
    async (codigo, clave) => {
      const resultado = await servicio.iniciarComoConductor(codigo, clave);
      if (resultado.ok) establecerSesion(resultado.valor);
      return resultado;
    },
    [servicio],
  );

  const cerrar = useCallback(async () => {
    await servicio.cerrar();
    establecerSesion(null);
  }, [servicio]);

  const valor = useMemo<ValorSesion>(
    () => ({
      cargando,
      cerrar,
      iniciarComoConductor,
      rol: rolDe(sesion),
      sesion,
    }),
    [cargando, cerrar, iniciarComoConductor, sesion],
  );

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}
