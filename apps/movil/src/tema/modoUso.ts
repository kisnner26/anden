import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_MODO_USO = 'anden.modo-uso';

export const MODOS_USO = ['completo', 'sencillo', 'rapido'] as const;

export type ModoUso = (typeof MODOS_USO)[number];

export interface AjustesModoUso {
  /** multiplicador de todos los tamaños de letra */
  escalaTexto: number;
  /** sin animaciones de adorno, como si el sistema pidiera reducir movimiento */
  reducirMovimiento: boolean;
  /** muestra la mascota de bienvenida en Viajar, si la persona la tiene encendida */
  mostrarMascota: boolean;
}

/**
 * completo: todo encendido, es el modo base.
 * sencillo: letra más grande y sin animaciones, para quien prefiere pantallas tranquilas.
 * rapido: sin adornos ni mascota, para quien ya conoce la app y va directo.
 */
const AJUSTES: Record<ModoUso, AjustesModoUso> = {
  completo: { escalaTexto: 1, mostrarMascota: true, reducirMovimiento: false },
  rapido: { escalaTexto: 1, mostrarMascota: false, reducirMovimiento: true },
  sencillo: {
    escalaTexto: 1.25,
    mostrarMascota: true,
    reducirMovimiento: true,
  },
};

export function ajustesDeModo(modo: ModoUso): AjustesModoUso {
  return AJUSTES[modo];
}

export function esModoUso(valor: unknown): valor is ModoUso {
  return (
    typeof valor === 'string' &&
    (MODOS_USO as readonly string[]).includes(valor)
  );
}

/** lo guardado; cualquier valor desconocido o ausente vuelve al modo completo */
export async function leerModoUso(): Promise<ModoUso> {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE_MODO_USO);
    return esModoUso(guardado) ? guardado : 'completo';
  } catch {
    return 'completo';
  }
}

export async function guardarModoUso(modo: ModoUso): Promise<void> {
  await AsyncStorage.setItem(CLAVE_MODO_USO, modo);
}
