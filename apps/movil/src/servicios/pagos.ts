import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_PAGOS = 'anden.pagos';

export type EstadoPago = 'pagado_efectivo' | 'pendiente';

export interface RegistroPago {
  estado: EstadoPago;
  marcadoEn?: string;
  /** el chofer que lo marcó */
  marcadoPor?: string;
}

export type RegistroPagos = Readonly<Record<string, RegistroPago>>;

/**
 * lo que necesita la app para llevar el pago en efectivo de cada boleto; hoy lo cumple
 * `crearPagosLocal` y más adelante Supabase, con las mismas pruebas de contrato
 */
export interface ServicioPagos {
  leer(): Promise<RegistroPagos>;
  marcarPagado(
    boletoId: string,
    choferId: string,
    ahora?: Date,
  ): Promise<RegistroPagos>;
  revertir(boletoId: string): Promise<RegistroPagos>;
}

export function estadoDePago(
  registro: RegistroPagos,
  boletoId: string,
): EstadoPago {
  return registro[boletoId]?.estado ?? 'pendiente';
}

/** cuántos boletos pagaron y cuánto se cobró, sobre los boletos de un viaje */
export function resumenDeCobro(
  boletos: readonly { id: string; precio: number }[],
  registro: RegistroPagos,
): { cobrado: number; pagados: number; pendiente: number; total: number } {
  const total = boletos.reduce((suma, boleto) => suma + boleto.precio, 0);
  const pagados = boletos.filter(
    (boleto) => estadoDePago(registro, boleto.id) === 'pagado_efectivo',
  );
  const cobrado = pagados.reduce((suma, boleto) => suma + boleto.precio, 0);
  return {
    cobrado,
    pagados: pagados.length,
    pendiente: total - cobrado,
    total,
  };
}

async function leerRegistro(): Promise<Record<string, RegistroPago>> {
  try {
    const valor: unknown = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_PAGOS)) ?? '{}',
    );
    return valor && typeof valor === 'object' && !Array.isArray(valor)
      ? (valor as Record<string, RegistroPago>)
      : {};
  } catch {
    return {};
  }
}

export function crearPagosLocal(): ServicioPagos {
  return {
    leer: leerRegistro,
    async marcarPagado(boletoId, choferId, ahora = new Date()) {
      const registro = await leerRegistro();
      registro[boletoId] = {
        estado: 'pagado_efectivo',
        marcadoEn: ahora.toISOString(),
        marcadoPor: choferId,
      };
      await AsyncStorage.setItem(CLAVE_PAGOS, JSON.stringify(registro));
      return registro;
    },
    async revertir(boletoId) {
      const registro = await leerRegistro();
      delete registro[boletoId];
      await AsyncStorage.setItem(CLAVE_PAGOS, JSON.stringify(registro));
      return registro;
    },
  };
}
