import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_AJUSTES_CONDUCTOR = 'anden.ajustes-conductor';

export interface AjustesConductor {
  /** pedir Face ID o huella al abrir el panel y al iniciar o terminar un viaje; apagado por defecto */
  exigirBiometria: boolean;
  /** mantener la pantalla encendida mientras se comparte la ubicación */
  pantallaEncendida: boolean;
}

export const AJUSTES_CONDUCTOR_INICIALES: AjustesConductor = {
  exigirBiometria: false,
  pantallaEncendida: true,
};

/** lee lo guardado sin confiar en su forma; lo que falte toma el valor de siempre */
export function leerAjustesConductor(texto: string | null): AjustesConductor {
  if (!texto) return AJUSTES_CONDUCTOR_INICIALES;
  try {
    const valor = JSON.parse(texto) as Partial<AjustesConductor>;
    return {
      exigirBiometria:
        typeof valor.exigirBiometria === 'boolean'
          ? valor.exigirBiometria
          : AJUSTES_CONDUCTOR_INICIALES.exigirBiometria,
      pantallaEncendida:
        typeof valor.pantallaEncendida === 'boolean'
          ? valor.pantallaEncendida
          : AJUSTES_CONDUCTOR_INICIALES.pantallaEncendida,
    };
  } catch {
    return AJUSTES_CONDUCTOR_INICIALES;
  }
}

/** lo último que se cargó, para quien no está dentro de un componente (el GPS, la puerta biométrica) */
let actuales: AjustesConductor = AJUSTES_CONDUCTOR_INICIALES;

export function ajustesConductorActuales(): AjustesConductor {
  return actuales;
}

export function recordarAjustesConductor(ajustes: AjustesConductor): void {
  actuales = ajustes;
}

export async function cargarAjustesConductor(): Promise<AjustesConductor> {
  try {
    const ajustes = leerAjustesConductor(
      await AsyncStorage.getItem(CLAVE_AJUSTES_CONDUCTOR),
    );
    recordarAjustesConductor(ajustes);
    return ajustes;
  } catch {
    return AJUSTES_CONDUCTOR_INICIALES;
  }
}

export async function guardarAjustesConductor(
  ajustes: AjustesConductor,
): Promise<void> {
  recordarAjustesConductor(ajustes);
  await AsyncStorage.setItem(CLAVE_AJUSTES_CONDUCTOR, JSON.stringify(ajustes));
}
