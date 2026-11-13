import {
  crearSolicitudLocal,
  type ServicioSolicitud,
} from '@/servicios/solicitudConductor';
import { obtenerCliente } from '@/servicios/supabase/cliente';
import { crearSolicitudSupabase } from '@/servicios/supabase/solicitudSupabase';

let elegido: ServicioSolicitud | null = null;

/** con Supabase configurado la solicitud viaja al servidor; sin él se guarda en el teléfono */
export function servicioSolicitud(): ServicioSolicitud {
  if (!elegido) {
    const cliente = obtenerCliente();
    elegido = cliente ? crearSolicitudSupabase(cliente) : crearSolicitudLocal();
  }
  return elegido;
}
