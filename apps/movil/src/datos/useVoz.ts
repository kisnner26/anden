import { createContext, useContext } from 'react';

import { crearVozDelSistema, type ServicioVoz } from '@/servicios/voz';

const VOZ_DEL_SISTEMA = crearVozDelSistema();

export const ContextoVoz = createContext<ServicioVoz>(VOZ_DEL_SISTEMA);

export function useVoz(): ServicioVoz {
  return useContext(ContextoVoz);
}
