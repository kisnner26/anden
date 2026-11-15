import type { Coordenada } from './geometria';
import { posicionDelSol } from './sol';

export type MomentoDelCielo = 'amanecer' | 'atardecer' | 'dia' | 'noche';

/**
 * cómo está el cielo en un lugar y momento, según dónde esté el sol: de noche bajo el horizonte, amanecer o atardecer con
 * el sol bajo (de mañana o de tarde) y de día cuando ya está alto
 */
export function momentoDelCielo(
  momento: Date,
  lugar: Coordenada,
): MomentoDelCielo {
  const { azimut, elevacion } = posicionDelSol(momento, lugar);
  if (elevacion < -4) return 'noche';
  if (elevacion < 14) return azimut < 180 ? 'amanecer' : 'atardecer';
  return 'dia';
}

/** los momentos del cielo a lo largo de un viaje, de la salida a la llegada: tres puntos para pintar el degradado */
export function cieloDelViaje(
  salida: Date,
  duracionMin: number,
  lugar: Coordenada,
): [MomentoDelCielo, MomentoDelCielo, MomentoDelCielo] {
  const a = (fraccion: number) =>
    momentoDelCielo(
      new Date(salida.getTime() + fraccion * duracionMin * 60_000),
      lugar,
    );
  return [a(0), a(0.5), a(1)];
}
