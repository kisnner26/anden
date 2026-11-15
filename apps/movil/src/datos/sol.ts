import { diferenciaDeRumbo, type Coordenada } from './geometria';

const aRadianes = (grados: number) => (grados * Math.PI) / 180;
const aGrados = (radianes: number) => (radianes * 180) / Math.PI;
const modulo = (n: number, m: number) => ((n % m) + m) % m;

export interface PosicionDelSol {
  /** grados desde el norte en el sentido del reloj, de 0 a 360 */
  azimut: number;
  /** grados sobre el horizonte; negativo es de noche */
  elevacion: number;
}

/** dónde está el sol en un momento y lugar: la fórmula astronómica simplificada, con error de menos de un grado */
export function posicionDelSol(
  momento: Date,
  lugar: Coordenada,
): PosicionDelSol {
  const diaJuliano = momento.getTime() / 86_400_000 + 2_440_587.5;
  const n = diaJuliano - 2_451_545;
  const media = modulo(280.46 + 0.9856474 * n, 360);
  const anomalia = aRadianes(modulo(357.528 + 0.9856003 * n, 360));
  const eclipticaLng = aRadianes(
    media + 1.915 * Math.sin(anomalia) + 0.02 * Math.sin(2 * anomalia),
  );
  const oblicuidad = aRadianes(23.439 - 4e-7 * n);
  const ascension = Math.atan2(
    Math.cos(oblicuidad) * Math.sin(eclipticaLng),
    Math.cos(eclipticaLng),
  );
  const declinacion = Math.asin(Math.sin(oblicuidad) * Math.sin(eclipticaLng));
  const tiempoSidereo = aRadianes(
    modulo(280.46061837 + 360.98564736629 * n + lugar.lng, 360),
  );
  const angulo = tiempoSidereo - ascension;
  const lat = aRadianes(lugar.lat);
  const elevacion = Math.asin(
    Math.sin(lat) * Math.sin(declinacion) +
      Math.cos(lat) * Math.cos(declinacion) * Math.cos(angulo),
  );
  const azimut = Math.atan2(
    -Math.sin(angulo),
    Math.tan(declinacion) * Math.cos(lat) - Math.sin(lat) * Math.cos(angulo),
  );
  return {
    azimut: modulo(aGrados(azimut), 360),
    elevacion: aGrados(elevacion),
  };
}

export type LadoDelSol = 'derecha' | 'izquierda' | 'ninguno';

/**
 * de qué lado del bus pega el sol mientras avanza con ese rumbo: el lado derecho o el izquierdo según miren al frente.
 * Si es de noche, está muy alto o queda justo adelante o atrás, no hay un lado peor que otro
 */
export function ladoDelSol(
  momento: Date,
  lugar: Coordenada,
  rumbo: number,
): LadoDelSol {
  const sol = posicionDelSol(momento, lugar);
  if (sol.elevacion < 8 || sol.elevacion > 65) return 'ninguno';
  const giro = diferenciaDeRumbo(rumbo, sol.azimut);
  // de frente o de espalda la luz cae sobre los dos lados por igual
  if (Math.abs(giro) < 20 || Math.abs(giro) > 160) return 'ninguno';
  return giro > 0 ? 'derecha' : 'izquierda';
}
