import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { leerConfiguracion } from './configuracion';

let cliente: SupabaseClient | null | undefined;

/** el cliente de Supabase, creado una sola vez; nulo si el entorno no está configurado */
export function obtenerCliente(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const configuracion = leerConfiguracion();
  cliente = configuracion
    ? createClient(configuracion.url, configuracion.claveAnonima, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
          storage: AsyncStorage,
        },
      })
    : null;
  return cliente;
}

export function haySupabase(): boolean {
  return obtenerCliente() !== null;
}
