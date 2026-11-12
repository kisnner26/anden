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
