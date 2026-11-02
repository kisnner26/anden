import { precioOficial, puedeRetener } from '@anden/dominio';
import { useCallback, useMemo, useState } from 'react';

import { useAhora, useSalidas } from './useSalidas';

/** persona que usa la app; hasta que haya cuentas (T-053) es un identificador fijo */
const DUENO = 'usu_yo';

const PASAJERO = { esMenorEnBrazos: false, nombre: 'pasajero' } as const;

export type AvisoSeleccion = 'asiento-ocupado' | 'maximo-6' | 'venta-cerrada';

export function useSeleccionAsientos(viajeId: string) {
  const ahora = useAhora();
  const { datos } = useSalidas();
  const [elegidos, establecerElegidos] = useState<number[]>([]);
  const [aviso, establecerAviso] = useState<AvisoSeleccion | null>(null);

  const viaje = useMemo(
    () => datos.viajes.find((candidato) => candidato.id === viajeId),
    [datos, viajeId],
  );
  const bus = useMemo(
    () => datos.buses.find((candidato) => candidato.id === viaje?.busId),
    [datos, viaje],
  );

  const total = useMemo(() => {
    const ruta = datos.rutas.find(
      (candidata) => candidata.id === viaje?.rutaId,
    );
    if (!ruta || !bus || elegidos.length === 0) return null;
    const precio = precioOficial(
      datos.tarifario,
      ruta.id,
      bus.servicio,
      { desde: 0, hasta: ruta.paradas.length - 1 },
      elegidos.map(() => PASAJERO),
    );
    return precio.ok ? precio.valor : null;
  }, [bus, datos, elegidos, viaje]);

  const alternar = useCallback(
    (numero: number) => {
      if (!viaje || !bus) return;
      if (elegidos.includes(numero)) {
        establecerElegidos(elegidos.filter((elegido) => elegido !== numero));
        establecerAviso(null);
        return;
      }
      const propuesta = [...elegidos, numero];
      const ocupaciones = datos.ocupaciones.filter(
        (ocupacion) => ocupacion.viajeId === viaje.id,
      );
      const resultado = puedeRetener(
        viaje,
        bus.configuracion,
        ocupaciones,
        propuesta,
        DUENO,
        ahora,
      );
      if (resultado.ok) {
        establecerElegidos(propuesta);
        establecerAviso(null);
      } else if (
        resultado.error === 'maximo-6' ||
        resultado.error === 'venta-cerrada' ||
        resultado.error === 'asiento-ocupado'
      ) {
        establecerAviso(resultado.error);
      }
    },
    [ahora, bus, datos, elegidos, viaje],
  );

  return { alternar, aviso, elegidos, total };
}
