import * as AutenticacionLocal from 'expo-local-authentication';

export type TipoBiometria = 'rostro' | 'huella' | 'ninguna';

export interface EstadoBiometria {
  disponible: boolean;
  tipo: TipoBiometria;
}

/** si el teléfono tiene Face ID o huella y la persona ya la configuró */
export async function consultarBiometria(): Promise<EstadoBiometria> {
  try {
    const [hardware, registrada, tipos] = await Promise.all([
      AutenticacionLocal.hasHardwareAsync(),
      AutenticacionLocal.isEnrolledAsync(),
      AutenticacionLocal.supportedAuthenticationTypesAsync(),
    ]);
    if (!hardware || !registrada) return { disponible: false, tipo: 'ninguna' };
    const rostro = tipos.includes(
      AutenticacionLocal.AuthenticationType.FACIAL_RECOGNITION,
    );
    return { disponible: true, tipo: rostro ? 'rostro' : 'huella' };
  } catch {
    return { disponible: false, tipo: 'ninguna' };
  }
}

/** pide Face ID o huella; el código del teléfono queda como respaldo si falla */
export async function autenticar(motivo: string): Promise<boolean> {
  try {
    const resultado = await AutenticacionLocal.authenticateAsync({
      promptMessage: motivo,
    });
    return resultado.success;
  } catch {
    return false;
  }
}

/** cuánto vale una verificación de conductor antes de pedirla otra vez, para no molestar entre pantallas */
export const VENTANA_VERIFICACION_MS = 5 * 60_000;

let ultimaVerificacion: number | null = null;

/** si el conductor ya se identificó hace poco y no hace falta pedirlo de nuevo */
export function verificacionVigente(ahora: number = Date.now()): boolean {
  return (
    ultimaVerificacion !== null &&
    ahora - ultimaVerificacion < VENTANA_VERIFICACION_MS
  );
}

/** pide Face ID o huella al conductor y recuerda el resultado un rato; `exigir` obliga a pedirlo aunque haya una verificación reciente */
export async function verificarConductor(
  motivo: string,
  exigir = false,
): Promise<boolean> {
  if (!exigir && verificacionVigente()) return true;
  const ok = await autenticar(motivo);
  if (ok) ultimaVerificacion = Date.now();
  return ok;
}

export function olvidarVerificacion(): void {
  ultimaVerificacion = null;
}
