export interface MuestraAcelerometro {
  /** aceleración en g en cada eje */
  x: number;
  y: number;
  z: number;
  /** marca de tiempo en milisegundos */
  t: number;
}

/** el golpe a partir del cual se sospecha de un choque: bastante más que un frenazo fuerte o un bache */
export const UMBRAL_CHOQUE_G = 4;
/** después del golpe, el teléfono tiene que quedarse casi quieto o con movimiento muy distinto al del viaje */
const VENTANA_POSGOLPE_MS = 1500;
const QUIETUD_G = 0.35;

/** la fuerza total en g, sin importar hacia dónde apunte el teléfono */
export function fuerzaG(m: Pick<MuestraAcelerometro, 'x' | 'y' | 'z'>): number {
  return Math.sqrt(m.x * m.x + m.y * m.y + m.z * m.z);
}

/**
 * un golpe fuerte seguido de quietud: eso separa un choque de un bache, un portazo o un teléfono
 * que se cae al piso y la persona lo recoge. Recibe las muestras en orden, de más vieja a más nueva.
 */
export function esPosibleChoque(
  muestras: readonly MuestraAcelerometro[],
): boolean {
  for (let i = 0; i < muestras.length; i += 1) {
    const golpe = muestras[i];
    if (!golpe || fuerzaG(golpe) < UMBRAL_CHOQUE_G) continue;
    const despues = muestras.filter(
      (m) => m.t > golpe.t + 200 && m.t <= golpe.t + VENTANA_POSGOLPE_MS,
    );
    // hace falta ver qué pasó después: sin muestras todavía no se puede decidir
    if (despues.length < 5) continue;
    const quieto = despues.every((m) => Math.abs(fuerzaG(m) - 1) <= QUIETUD_G);
    if (quieto) return true;
  }
  return false;
}

/** los segundos que tiene la persona para decir que está bien antes de avisar */
export const SEGUNDOS_PARA_CONFIRMAR = 20;

/** el número al que se ofrece llamar; en Nicaragua la Policía Nacional atiende el 118 */
export const NUMERO_EMERGENCIA = '118';

export interface DatosAlerta {
  lat: number | null;
  lng: number | null;
  /** el nombre de quien viaja */
  nombre: string;
  viajeId: string | null;
}

/** el mensaje para el contacto de emergencia, con un enlace al mapa si hay ubicación */
export function mensajeDeAlerta(datos: DatosAlerta): string {
  const lugar =
    datos.lat !== null && datos.lng !== null
      ? ` Su ubicación: https://maps.apple.com/?ll=${datos.lat.toFixed(5)},${datos.lng.toFixed(5)}`
      : ' No se pudo obtener la ubicación.';
  return `ALERTA de Andén: ${datos.nombre} pudo haber sufrido un accidente en el bus y no respondió a tiempo.${lugar} Llamalo o avisá a emergencias.`;
}
