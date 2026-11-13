import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { CUENTAS_MUESTRA } from '@/servicios/cuentasMuestra';
import {
  crearSesionLocal,
  rolDe,
  type ServicioSesion,
  type Sesion,
} from '@/servicios/sesion';

import { obtenerCliente } from '@/servicios/supabase/cliente';
import { crearSesionSupabase } from '@/servicios/supabase/sesionSupabase';

import { ContextoSesion, type ValorSesion } from './useSesion';

const SERVICIO_LOCAL = crearSesionLocal(CUENTAS_MUESTRA);

/** con Supabase configurado las cuentas son reales; sin él, las de muestra del teléfono */
function servicioPorDefecto(): ServicioSesion {
  const cliente = obtenerCliente();
  return cliente ? crearSesionSupabase(cliente) : SERVICIO_LOCAL;
}

let servicioElegido: ServicioSesion | null = null;

/** se decide la primera vez que se necesita, ya dentro de la app, y no al cargar el módulo */
function servicioPredeterminado(): ServicioSesion {
  servicioElegido ??= servicioPorDefecto();
  return servicioElegido;
}

/** comparte quién está usando la app y con qué rol; sin sesión, la persona es pasajera */
export function ProveedorSesion({
  children,
  servicio = servicioPredeterminado(),
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

  const iniciar = useCallback<ValorSesion['iniciar']>(
    async (identificador, clave) => {
      const resultado = await servicio.iniciar(identificador, clave);
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
      iniciar,
      rol: rolDe(sesion),
      sesion,
    }),
    [cargando, cerrar, iniciar, sesion],
  );

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}
