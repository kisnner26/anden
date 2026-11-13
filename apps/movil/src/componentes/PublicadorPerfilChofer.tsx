import { useEffect, useRef } from 'react';

import { nombreCompleto, nombrePropio } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { useSesion } from '@/datos/useSesion';
import { publicarPerfilChofer } from '@/servicios/supabase/perfilChoferSupabase';

/**
 * mantiene al día lo que los pasajeros ven del conductor: cuando cambia su nombre o su foto,
 * lo publica. No dibuja nada; vive dentro del modo conductor.
 */
export function PublicadorPerfilChofer() {
  const { sesion } = useSesion();
  const { cargando, perfil } = usePerfil();
  const publicado = useRef<string | null>(null);
  const choferId = sesion?.rol === 'conductor' ? sesion.choferId : undefined;
  const nombre = nombrePropio(nombreCompleto(perfil) || (sesion?.nombre ?? ''));
  const foto = perfil.fotoUri;

  useEffect(() => {
    if (!choferId || cargando || nombre === '') return;
    const huella = `${choferId}|${nombre}|${foto ?? ''}`;
    if (publicado.current === huella) return;
    publicado.current = huella;
    void publicarPerfilChofer(choferId, nombre, foto).then((resultado) => {
      // si no se pudo, la próxima vez que cambie algo se reintenta
      if (resultado === undefined) publicado.current = null;
    });
  }, [cargando, choferId, foto, nombre]);

  return null;
}
