import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useBoletoEnCurso } from '@/datos/useBoletoEnCurso';

/**
 * cuando el chofer inicia el viaje de la persona, la app abre sola la pantalla del viaje en curso, una sola vez por
 * viaje: si la persona la cierra, no se le vuelve a abrir (la tarjeta del inicio sigue ahí para volver)
 */
export function AbridorViajeEnCurso() {
  const router = useRouter();
  const ruta = usePathname();
  const enCurso = useBoletoEnCurso();
  const abiertos = useRef(new Set<string>());
  const boletoId = enCurso?.boleto.id ?? null;

  useEffect(() => {
    if (boletoId === null || abiertos.current.has(boletoId)) return;
    abiertos.current.add(boletoId);
    if (ruta.startsWith('/en-curso/')) return;
    router.push({ params: { id: boletoId }, pathname: '/en-curso/[id]' });
  }, [boletoId, ruta, router]);

  return null;
}
