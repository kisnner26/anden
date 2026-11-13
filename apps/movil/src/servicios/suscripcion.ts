import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_SUSCRIPCION = 'anden.suscripcion';

/** lo que cuesta Andén Plus, en dólares por mes */
export const PRECIO_PLUS_USD = 5;

export type Plan = 'gratis' | 'plus';

export interface EstadoSuscripcion {
  /** desde cuándo está activo, en ISO; nulo en el plan gratis */
  desde: string | null;
  plan: Plan;
}

export const ESTADO_GRATIS: EstadoSuscripcion = { desde: null, plan: 'gratis' };

/**
 * lo que necesita la app de un sistema de suscripción; hoy la guarda el teléfono sin cobrar y más
 * adelante la confirmará el servidor con la compra dentro de la app, con las mismas pruebas de contrato
 */
export interface ServicioSuscripcion {
  activar(ahora?: Date): Promise<EstadoSuscripcion>;
  cancelar(): Promise<EstadoSuscripcion>;
  leer(): Promise<EstadoSuscripcion>;
}

/** el punto único para preguntar si algo es de Plus; los beneficios futuros se enganchan acá */
export function esPlus(estado: EstadoSuscripcion): boolean {
  return estado.plan === 'plus';
}

export function leerEstado(guardado: string | null): EstadoSuscripcion {
  if (!guardado) return ESTADO_GRATIS;
  try {
    const valor = JSON.parse(guardado) as Partial<EstadoSuscripcion>;
    if (valor.plan === 'plus' && typeof valor.desde === 'string') {
      return { desde: valor.desde, plan: 'plus' };
    }
    return ESTADO_GRATIS;
  } catch {
    return ESTADO_GRATIS;
  }
}

/** cada cuenta guarda su plan aparte; sin cuenta se usa la clave de siempre del teléfono */
export function claveSuscripcionDe(cuenta: string | null): string {
  return cuenta ? `${CLAVE_SUSCRIPCION}.${cuenta}` : CLAVE_SUSCRIPCION;
}

export function crearSuscripcionLocal(
  cuenta: string | null = null,
): ServicioSuscripcion {
  const clave = claveSuscripcionDe(cuenta);
  return {
    async activar(ahora = new Date()) {
      const estado: EstadoSuscripcion = {
        desde: ahora.toISOString(),
        plan: 'plus',
      };
      await AsyncStorage.setItem(clave, JSON.stringify(estado));
      return estado;
    },
    async cancelar() {
      await AsyncStorage.removeItem(clave);
      return ESTADO_GRATIS;
    },
    async leer() {
      try {
        return leerEstado(await AsyncStorage.getItem(clave));
      } catch {
        return ESTADO_GRATIS;
      }
    },
  };
}
