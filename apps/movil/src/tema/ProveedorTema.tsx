import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { coloresClaros, coloresOscuros } from './colores';
import { modoPorHora } from './modoPorHora';
import { ContextoTema, type PreferenciaTema } from './useTema';

export const CLAVE_PREFERENCIA_TEMA = 'anden.tema';
const UN_MINUTO = 60_000;

function esPreferenciaTema(valor: string | null): valor is PreferenciaTema {
  return valor === 'automatico' || valor === 'claro' || valor === 'oscuro';
}

/** la hora actual, refrescada cada minuto para cambiar de modo al llegar a las 06:00 o las 18:00 */
function useAhora(): Date {
  const [ahora, establecerAhora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = setInterval(() => establecerAhora(new Date()), UN_MINUTO);
    return () => clearInterval(intervalo);
  }, []);
  return ahora;
}

/** comparte con toda la app el modo de color y la preferencia guardada; claro por defecto */
export function ProveedorTema({ children }: { children: ReactNode }) {
  const ahora = useAhora();
  const [cargandoTema, establecerCargandoTema] = useState(true);
  const [preferencia, establecerPreferenciaInterna] =
    useState<PreferenciaTema>('claro');

  useEffect(() => {
    let activo = true;
    AsyncStorage.getItem(CLAVE_PREFERENCIA_TEMA)
      .then((valor) => {
        if (activo && esPreferenciaTema(valor)) {
          establecerPreferenciaInterna(valor);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) establecerCargandoTema(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const modo = preferencia === 'automatico' ? modoPorHora(ahora) : preferencia;

  const establecerPreferencia = useCallback(async (nueva: PreferenciaTema) => {
    establecerPreferenciaInterna(nueva);
    await AsyncStorage.setItem(CLAVE_PREFERENCIA_TEMA, nueva);
  }, []);

  const valor = useMemo(
    () => ({
      cargandoTema,
      colores: modo === 'claro' ? coloresClaros : coloresOscuros,
      establecerPreferencia,
      modo,
      preferencia,
    }),
    [cargandoTema, establecerPreferencia, modo, preferencia],
  );

  return (
    <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>
  );
}
