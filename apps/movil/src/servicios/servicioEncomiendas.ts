import {
  CLAVE_ENCOMIENDAS,
  guardarEncomienda,
  leerEncomiendas,
  type Encomienda,
} from '@/datos/encomiendas';

import { obtenerCliente } from './supabase/cliente';
import { crearEncomiendasSupabase } from './supabase/encomiendasSupabase';

import AsyncStorage from '@react-native-async-storage/async-storage';

/** lo que necesita la app para enviar y seguir encomiendas; con servidor las ve también el chofer */
export interface ServicioEncomiendas {
  /** las encomiendas de esta persona o, si es chofer, las de sus viajes; nulo si el servidor no respondió */
  listar(): Promise<Encomienda[] | null>;
  guardar(encomienda: Encomienda): Promise<boolean>;
  /** guarda el cambio de estado que hizo el chofer o el remitente */
  actualizar(encomienda: Encomienda): Promise<boolean>;
}

export function crearEncomiendasLocal(): ServicioEncomiendas {
  return {
    async actualizar(encomienda) {
      const lista = (await leerEncomiendas()).map((previa) =>
        previa.id === encomienda.id ? encomienda : previa,
      );
      await AsyncStorage.setItem(CLAVE_ENCOMIENDAS, JSON.stringify(lista));
      return true;
    },
    async guardar(encomienda) {
      await guardarEncomienda(encomienda);
      return true;
    },
    listar: leerEncomiendas,
  };
}

let servicio: ServicioEncomiendas | null = null;

/** con Supabase configurado las encomiendas viven en el servidor; sin él, en el teléfono */
export function servicioDeEncomiendas(): ServicioEncomiendas {
  if (servicio) return servicio;
  const cliente = obtenerCliente();
  servicio = cliente
    ? crearEncomiendasSupabase(cliente)
    : crearEncomiendasLocal();
  return servicio;
}

/** para las pruebas */
export function reiniciarServicioEncomiendas(): void {
  servicio = null;
}
