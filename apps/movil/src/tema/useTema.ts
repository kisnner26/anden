import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { coloresClaros, coloresOscuros } from './colores';

const clavePreferencia = 'anden.tema';

export type PreferenciaTema = 'claro' | 'oscuro' | 'sistema';

function esPreferenciaTema(valor: string | null): valor is PreferenciaTema {
  return valor === 'claro' || valor === 'oscuro' || valor === 'sistema';
}

export function useTema() {
  const esquemaSistema = useColorScheme();
  const [cargandoTema, establecerCargandoTema] = useState(true);
  const [preferencia, establecerPreferenciaInterna] =
    useState<PreferenciaTema>('sistema');

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

  const modoSistema = esquemaSistema === 'light' ? 'claro' : 'oscuro';
  const modo = preferencia === 'sistema' ? modoSistema : preferencia;
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
