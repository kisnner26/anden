import { createContext, useContext } from 'react';

export interface ValorConexion {
  /** hay internet; se asume que sí hasta que se sepa lo contrario */
  enLinea: boolean;
  /** acaba de volver la señal: dura unos segundos para poder avisarlo */
  recienVuelta: boolean;
  /** cuándo se actualizaron las salidas por última vez, con el servidor o con lo guardado */
  ultimaSincronizacion: Date | null;
}

export const ContextoConexion = createContext<ValorConexion>({
  enLinea: true,
  recienVuelta: false,
  ultimaSincronizacion: null,
});

export function useConexion(): ValorConexion {
  return useContext(ContextoConexion);
}
