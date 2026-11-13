import { obtenerCliente } from './cliente';

export interface AlertaSeguridad {
  lat: number | null;
  lng: number | null;
  nombre: string;
  tipo: 'choque' | 'manual';
  viajeId: string | null;
}

/** deja la alerta en el servidor para que la cooperativa la vea; devuelve si llegó */
export async function publicarAlerta(
  alerta: AlertaSeguridad,
): Promise<boolean> {
  const cliente = obtenerCliente();
  if (!cliente) return false;
  try {
    const { error } = await cliente.from('alertas').insert({
      lat: alerta.lat,
      lng: alerta.lng,
      nombre: alerta.nombre,
      tipo: alerta.tipo,
      viaje_id: alerta.viajeId,
    });
    return error === null;
  } catch {
    return false;
  }
}
