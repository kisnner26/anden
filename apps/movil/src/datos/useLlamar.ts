import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import {
  telefonoDelChofer,
  telefonoDelPasajero,
} from '@/servicios/supabase/comunicacionSupabase';

/** abre la llamada del teléfono; devuelve falso si no pudo abrirla */
async function marcar(numero: string): Promise<boolean> {
  try {
    await Linking.openURL(`tel:${numero.replace(/[^\d+]/g, '')}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * llamar al chofer o al pasajero sin mostrar su número: el servidor lo entrega solo si hay boleto vigente y el viaje está
 * en la ventana de tiempo, y la app lo pasa directo a la llamada. `fallo` es verdadero si no había número que darle
 */
export function useLlamar(): {
  alChofer: (viajeId: string) => Promise<void>;
  alPasajero: (boletoId: string) => Promise<void>;
  fallo: boolean;
} {
  const [fallo, establecerFallo] = useState(false);

  const llamar = useCallback(async (pedir: () => Promise<string | null>) => {
    establecerFallo(false);
    const numero = await pedir();
    if (!numero || !(await marcar(numero))) establecerFallo(true);
  }, []);

  const alChofer = useCallback(
    (viajeId: string) => llamar(() => telefonoDelChofer(viajeId)),
    [llamar],
  );
  const alPasajero = useCallback(
    (boletoId: string) => llamar(() => telefonoDelPasajero(boletoId)),
    [llamar],
  );
  return { alChofer, alPasajero, fallo };
}
