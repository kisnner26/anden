import { useCallback, useEffect, useState } from 'react';

import {
  verGrupo,
  type EstadoDelGrupo,
} from '@/servicios/supabase/grupoSupabase';
import { iniciarSondeo } from './sondeo';

const CADA_MS = 8000;

/** el avance de un grupo, renovado cada pocos segundos mientras la pantalla está abierta; `existe` es falso si no hay tal grupo */
export function useGrupo(codigo: string | null): {
  cargando: boolean;
  estado: EstadoDelGrupo | null;
  existe: boolean;
  renovar: () => Promise<void>;
} {
  const [estado, establecerEstado] = useState<EstadoDelGrupo | null>(null);
  const [cargando, establecerCargando] = useState(codigo !== null);
  const [existe, establecerExiste] = useState(true);

  const traer = useCallback(async () => {
    if (!codigo) return;
    const leido = await verGrupo(codigo);
    // si falla una vez se conserva lo último que se vio
    if (leido) {
      establecerEstado(leido);
      establecerExiste(true);
    } else if (estado === null) {
      establecerExiste(false);
    }
    establecerCargando(false);
  }, [codigo, estado]);

  useEffect(() => {
    void traer();
    const pararSondeo = iniciarSondeo(() => void traer(), CADA_MS);
    return pararSondeo;
    // el temporizador se rearma solo cuando cambia el grupo
  }, [codigo]);

  return { cargando, estado, existe, renovar: traer };
}
