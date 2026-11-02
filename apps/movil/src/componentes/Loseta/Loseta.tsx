import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { radios } from '@/tema/espacios';
import { estilosRelieve } from '@/tema/relieve';
import { useTema } from '@/tema/useTema';

export type VarianteLoseta = 'ambar' | 'claro' | 'negra';

export interface PropiedadesLoseta {
  children?: ReactNode;
  tamano?: number;
  testID?: string;
  variante?: VarianteLoseta;
}

/** cuadrado redondeado que aloja un ícono ilustrado o el código de una terminal */
export function Loseta({
  children,
  tamano = 50,
  testID,
  variante = 'claro',
}: PropiedadesLoseta) {
  const { colores, modo } = useTema();
  const relieve = estilosRelieve(modo, colores);
  const degradados = {
    ambar: [colores.ambar, colores.ambarProfundo],
    claro: [colores.superficieAlta, colores.barroOscuro],
    negra: [colores.bloqueNegroClaro, colores.bloqueNegro],
  } as const;

  return (
    <View
      style={[
        {
          backgroundColor: colores.barroClaro,
          borderRadius: radios.loseta,
          height: tamano,
          width: tamano,
        },
        relieve.sombra,
        { shadowOffset: { height: 5, width: 3 }, shadowRadius: 5 },
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={degradados[variante]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={{
          alignItems: 'center',
          borderRadius: radios.loseta,
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
