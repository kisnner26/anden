import { requireOptionalNativeModule } from 'expo';

interface ModuloAndenActividad {
  actualizar(id: string, anden: number, estado: string): Promise<boolean>;
  disponible(): Promise<boolean>;
  iniciar(
    destino: string,
    salidaMs: number,
    anden: number,
    estado: string,
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
  anden: number;
  destino: string;
  estado: string;
  salida: Date;
}): Promise<string | null> {
  if (!modulo) return null;
  try {
    return await modulo.iniciar(
      datos.destino,
      datos.salida.getTime(),
      datos.anden,
      datos.estado,
    );
  } catch {
    return null;
  }
}

export async function actualizarActividad(
  id: string,
  anden: number,
  estado: string,
): Promise<boolean> {
  if (!modulo) return false;
  try {
    return await modulo.actualizar(id, anden, estado);
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
