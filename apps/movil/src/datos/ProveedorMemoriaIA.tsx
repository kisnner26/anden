import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { claveDeCuenta } from '@/servicios/sesion';

import {
  MEMORIA_VACIA,
  borrarMemoria,
  guardarMemoria,
  guardarMemoriaActiva,
  leerMemoriaActiva,
  leerMemoriaGuardada,
  registrarPregunta,
  type MemoriaIA,
} from './memoriaIA';
import { useIA } from './useIA';
import { ContextoMemoriaIA, type ValorMemoriaIA } from './useMemoriaIA';
import { useSesion } from './useSesion';

/**
 * lo que la IA recuerda de cada cuenta para mejorar las sugerencias. Todo queda en el teléfono y
 * solo se guarda con la IA activada y si la persona lo permite; puede borrarlo cuando quiera.
 */
export function ProveedorMemoriaIA({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const { usable } = useIA();
  const cuenta = claveDeCuenta(sesion);
  const [memoria, establecerMemoria] = useState<MemoriaIA>(MEMORIA_VACIA);
  const [permitida, establecerPermitida] = useState(true);
  const activa = usable && permitida;

  useEffect(() => {
    let vigente = true;
    establecerMemoria(MEMORIA_VACIA);
    void Promise.all([leerMemoriaGuardada(cuenta), leerMemoriaActiva()]).then(
      ([guardada, permiso]) => {
        if (!vigente) return;
        establecerMemoria(guardada);
        establecerPermitida(permiso);
      },
    );
    return () => {
      vigente = false;
    };
  }, [cuenta]);

  const recordarPregunta = useCallback<ValorMemoriaIA['recordarPregunta']>(
    (pregunta, destinos) => {
      if (!activa) return;
      establecerMemoria((previa) => {
        const nueva = registrarPregunta(previa, pregunta, destinos, new Date());
        void guardarMemoria(cuenta, nueva);
        return nueva;
      });
    },
    [activa, cuenta],
  );

  const olvidar = useCallback(async () => {
    establecerMemoria(MEMORIA_VACIA);
    await borrarMemoria(cuenta);
  }, [cuenta]);

  const cambiarPermiso = useCallback(
    async (permiso: boolean) => {
      establecerPermitida(permiso);
      await guardarMemoriaActiva(permiso);
      // al apagar el permiso también se borra lo que había recordado
      if (!permiso) await olvidar();
    },
    [olvidar],
  );

  const valor = useMemo(
    () => ({
      activa,
      cambiarPermiso,
      memoria: activa ? memoria : MEMORIA_VACIA,
      olvidar,
      permitida,
      recordarPregunta,
    }),
    [activa, cambiarPermiso, memoria, olvidar, permitida, recordarPregunta],
  );

  return (
    <ContextoMemoriaIA.Provider value={valor}>
      {children}
    </ContextoMemoriaIA.Provider>
  );
}
