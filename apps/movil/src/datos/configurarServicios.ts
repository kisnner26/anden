import { obtenerCliente } from '@/servicios/supabase/cliente';
import { crearTransmisionSupabase } from '@/servicios/supabase/transmisionSupabase';
import {
  configurarTransmision,
  crearTransmisionLocal,
} from '@/servicios/transmision';

/** la transmisión se comparte por Supabase si está configurado; la fábrica corre la primera vez que se usa */
configurarTransmision(() => {
  const cliente = obtenerCliente();
  return cliente ? crearTransmisionSupabase(cliente) : crearTransmisionLocal();
});
