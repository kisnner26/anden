import { useMemo } from 'react';

import { armarDetalle, armarPerfilChofer } from './detalle';
import { obtenerMuestra, useAhora } from './useSalidas';

/** el detalle de un viaje: unidad con su placa, chofer, paradas y llegada; nulo si no existe */
export function useDetalleViaje(viajeId: string) {
  const ahora = useAhora();
  return useMemo(
    () => armarDetalle(obtenerMuestra(), viajeId, ahora),
    [ahora, viajeId],
  );
}

/** el perfil de un chofer con su promedio y las etiquetas que más le dieron */
export function usePerfilChofer(choferId: string) {
  return useMemo(
    () => armarPerfilChofer(obtenerMuestra(), choferId),
    [choferId],
  );
}
