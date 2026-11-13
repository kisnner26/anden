import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { guardarIAActivada, leerIAActivada } from '@/servicios/ajustesIA';
import {
  iaDelSistema,
  type DisponibilidadIA,
  type ServicioIA,
} from '@/servicios/ia';

import { ContextoIA, type ValorIA } from './useIA';

let servicioElegido: ServicioIA | null = null;

/** se decide la primera vez que se necesita: Apple Intelligence en iPhone, Gemini en Android */
function servicioPredeterminado(): ServicioIA {
  servicioElegido ??= iaDelSistema();
  return servicioElegido;
}

/** comparte si la IA del teléfono se puede usar y si la persona la activó; el modelo corre en el teléfono */
export function ProveedorIA({
  children,
  servicio = servicioPredeterminado(),
}: {
  children: ReactNode;
  servicio?: ServicioIA;
}) {
  const [activada, establecerActivada] = useState(false);
  const [disponibilidad, establecerDisponibilidad] =
    useState<DisponibilidadIA>('sin-modulo');
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    void Promise.all([leerIAActivada(), servicio.disponibilidad()])
      .then(([encendida, estado]) => {
        if (!vigente) return;
        establecerActivada(encendida);
        establecerDisponibilidad(estado);
      })
      .finally(() => {
        if (vigente) establecerCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [servicio]);

  const cambiar = useCallback(
    async (encender: boolean) => {
      establecerActivada(encender);
      await guardarIAActivada(encender);
      // al encenderla se vuelve a mirar: la persona pudo activar Apple Intelligence hace un momento
      if (encender) establecerDisponibilidad(await servicio.disponibilidad());
    },
    [servicio],
  );

  const valor = useMemo<ValorIA>(
    () => ({
      activada,
      cambiar,
      cargando,
      disponibilidad,
      nombre: servicio.nombre,
      preguntar: servicio.preguntar,
      usable: activada && disponibilidad === 'disponible',
    }),
    [activada, cambiar, cargando, disponibilidad, servicio],
  );

  return <ContextoIA.Provider value={valor}>{children}</ContextoIA.Provider>;
}
