import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useBoletoEnCurso } from '@/datos/useBoletoEnCurso';

/** lo que se espera tras abrir la app antes de abrir viajes solos: lo que ya estaba en curso no cuenta como "nuevo" */
export const ESPERA_INICIAL_MS = 15_000;

/**
 * cuando el chofer inicia el viaje de la persona mientras usa la app, se abre sola la pantalla del viaje en curso, una
 * sola vez por viaje. Un viaje que ya iba en curso al abrir la app no se abre solo (la tarjeta del inicio sigue ahí
 * para entrar), porque la app todavía está cargando y la persona no pidió nada
 */
export function AbridorViajeEnCurso() {
  const router = useRouter();
  const ruta = usePathname();
  const enCurso = useBoletoEnCurso();
  const abiertos = useRef(new Set<string>());
  const armado = useRef(false);
  const boletoId = enCurso?.boleto.id ?? null;

  useEffect(() => {
    const espera = setTimeout(() => {
      armado.current = true;
    }, ESPERA_INICIAL_MS);
    return () => clearTimeout(espera);
  }, []);

  useEffect(() => {
    if (boletoId === null || abiertos.current.has(boletoId)) return;
    // mientras la app arranca, los viajes que ya van en curso solo se anotan como vistos
    if (!armado.current) {
      abiertos.current.add(boletoId);
      return;
    }
    abiertos.current.add(boletoId);
    if (ruta.startsWith('/en-curso/')) return;
    router.push({ params: { id: boletoId }, pathname: '/en-curso/[id]' });
  }, [boletoId, ruta, router]);

  return null;
}
