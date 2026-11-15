import { requireOptionalNativeModule } from 'expo';

interface ModuloAndenActividad {
  actualizar(
    id: string,
    puntoEncuentro: string,
    estado: string,
    fase: string,
  ): Promise<boolean>;
  disponible(): Promise<boolean>;
  iniciar(
    destino: string,
    salidaMs: number,
    puntoEncuentro: string,
    estado: string,
    origen: string,
    fase: string,
    llegadaMs: number,
    vehiculo: string,
  ): Promise<string>;
  terminar(id: string): Promise<void>;
}

/** el módulo nativo; nulo donde no existe (Android, web, pruebas) */
const modulo =
  requireOptionalNativeModule<ModuloAndenActividad>('AndenActividad');

export async function actividadesDisponibles(): Promise<boolean> {
  if (!modulo) return false;
  try {
    return await modulo.disponible();
  } catch {
    return false;
  }
}

/** inicia la actividad del viaje; nulo si no se puede */
export async function iniciarActividad(datos: {
  puntoEncuentro: string;
  destino: string;
  estado: string;
  /** momento del viaje: espera, abordando, atrasado, ruta o llego */
  fase?: string;
  /** cuándo se espera que llegue; sin esto se estima en dos horas */
  llegada?: Date;
  origen?: string;
  salida: Date;
  /** el vehículo de la persona: el id de un bus de Andén o de un vehículo Plus; sin esto, el clásico ámbar */
  vehiculo?: string;
}): Promise<string | null> {
  if (!modulo) return null;
  try {
    return await modulo.iniciar(
      datos.destino,
      datos.salida.getTime(),
      datos.puntoEncuentro,
      datos.estado,
      datos.origen ?? '',
      datos.fase ?? 'espera',
      (
        datos.llegada ?? new Date(datos.salida.getTime() + 2 * 3_600_000)
      ).getTime(),
      datos.vehiculo ?? 'clasico-ambar',
    );
  } catch {
    return null;
  }
}

export async function actualizarActividad(
  id: string,
  puntoEncuentro: string,
  estado: string,
  fase: string = 'espera',
): Promise<boolean> {
  if (!modulo) return false;
  try {
    return await modulo.actualizar(id, puntoEncuentro, estado, fase);
  } catch {
    return false;
  }
}

export async function terminarActividad(id: string): Promise<void> {
  if (!modulo) return;
  try {
    await modulo.terminar(id);
  } catch {
    // la actividad ya terminó
  }
}
