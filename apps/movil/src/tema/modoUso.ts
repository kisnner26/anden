import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_MODO_USO = 'anden.modo-uso';

export const MODOS_USO = ['completo', 'sencillo', 'rapido'] as const;

export type ModoUso = (typeof MODOS_USO)[number];

export interface AjustesModoUso {
  /** multiplicador de todos los tamaños de letra */
  escalaTexto: number;
  /** sin animaciones de adorno, como si el sistema pidiera reducir movimiento */
  reducirMovimiento: boolean;
  /** menos adornos y atajos: lo esencial a la vista y botones directos */
  simplificado: boolean;
}

/**
 * completo: todo encendido, es el modo base.
 * sencillo: letra más grande y sin animaciones, para quien prefiere pantallas tranquilas.
 * rapido: sin adornos, para quien ya conoce la app y va directo.
 */
const AJUSTES: Record<ModoUso, AjustesModoUso> = {
  completo: { escalaTexto: 1, reducirMovimiento: false, simplificado: false },
  rapido: { escalaTexto: 1, reducirMovimiento: true, simplificado: false },
  sencillo: {
    escalaTexto: 1.25,
    reducirMovimiento: true,
    simplificado: true,
  },
};

/** ajustes para una persona mayor que no eligió otro modo: letra legible, sin animaciones y flujo simple */
const AJUSTES_MAYOR: AjustesModoUso = {
  escalaTexto: 1.2,
  reducirMovimiento: true,
  simplificado: true,
};

/** el modo elegido manda; sin elegir (completo), una persona mayor recibe la interfaz adaptada */
export function ajustesPara(modo: ModoUso, mayor: boolean): AjustesModoUso {
  if (mayor && modo === 'completo') return AJUSTES_MAYOR;
  return AJUSTES[modo];
}

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
