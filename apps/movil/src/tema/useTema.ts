import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { coloresClaros, coloresOscuros } from './colores';
import { modoPorHora } from './modoPorHora';

const clavePreferencia = 'anden.tema';

export type PreferenciaTema = 'automatico' | 'claro' | 'oscuro';

function esPreferenciaTema(valor: string | null): valor is PreferenciaTema {
  return valor === 'automatico' || valor === 'claro' || valor === 'oscuro';
}

const UN_MINUTO = 60_000;

/** la hora actual, refrescada cada minuto para cambiar de modo al llegar a las 06:00 o las 18:00 */
function useAhora(): Date {
  const [ahora, establecerAhora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = setInterval(() => establecerAhora(new Date()), UN_MINUTO);
    return () => clearInterval(intervalo);
  }, []);
  return ahora;
}

export function useTema() {
  const ahora = useAhora();
  const [cargandoTema, establecerCargandoTema] = useState(true);
  const [preferencia, establecerPreferenciaInterna] =
    useState<PreferenciaTema>('automatico');

  useEffect(() => {
    let activo = true;

    void AsyncStorage.getItem(clavePreferencia).then((valor) => {
      if (activo && esPreferenciaTema(valor)) {
        establecerPreferenciaInterna(valor);
      }

      if (activo) {
        establecerCargandoTema(false);
      }
    });

    return () => {
      activo = false;
    };
  }, []);

  const modo = preferencia === 'automatico' ? modoPorHora(ahora) : preferencia;
  const colores = modo === 'claro' ? coloresClaros : coloresOscuros;

  const establecerPreferencia = useCallback(
    async (nuevaPreferencia: PreferenciaTema) => {
      establecerPreferenciaInterna(nuevaPreferencia);
      await AsyncStorage.setItem(clavePreferencia, nuevaPreferencia);
    },
    [],
  );

  return useMemo(
    () => ({
      cargandoTema,
      colores,
      establecerPreferencia,
      modo,
      preferencia,
    }),
    [cargandoTema, colores, establecerPreferencia, modo, preferencia],
  );
}
