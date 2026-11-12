import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_ABORDAJE = 'anden.abordaje';

/** los boletos cuyo pasajero ya subió al bus, con la hora en que se marcó */
export type RegistroAbordaje = Readonly<Record<string, string>>;

/**
 * lo que necesita la app para llevar quién ya abordó; hoy lo cumple `crearAbordajeLocal` y más
 * adelante Supabase, con las mismas pruebas de contrato
 */
export interface ServicioAbordaje {
  leer(): Promise<RegistroAbordaje>;
  /** marca que subió; si ya estaba marcado lo desmarca */
  alternar(boletoId: string, ahora?: Date): Promise<RegistroAbordaje>;
}

export function abordo(registro: RegistroAbordaje, boletoId: string): boolean {
  return registro[boletoId] !== undefined;
}

export function cuantosAbordaron(
  registro: RegistroAbordaje,
  boletoIds: readonly string[],
): number {
  return boletoIds.filter((id) => abordo(registro, id)).length;
}

async function leerRegistro(): Promise<Record<string, string>> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_ABORDAJE)) ?? '{}',
    );
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return {};
    return Object.fromEntries(
      Object.entries(valor).filter(
        (entrada): entrada is [string, string] =>
          typeof entrada[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

export function crearAbordajeLocal(): ServicioAbordaje {
  return {
    async alternar(boletoId, ahora = new Date()) {
      const registro = await leerRegistro();
      if (registro[boletoId] !== undefined) delete registro[boletoId];
      else registro[boletoId] = ahora.toISOString();
      await AsyncStorage.setItem(CLAVE_ABORDAJE, JSON.stringify(registro));
      return registro;
    },
    leer: leerRegistro,
  };
}
