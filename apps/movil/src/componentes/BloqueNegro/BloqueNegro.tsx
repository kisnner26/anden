import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { conAlfa } from '@/tema/alfa';
import { radios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBloqueNegro {
  children?: ReactNode;
  /** estilo del contenedor externo: márgenes, ancho, flex */
  estilo?: StyleProp<ViewStyle>;
  /** estilo del contenido: relleno, dirección, separación */
  estiloContenido?: StyleProp<ViewStyle>;
  testID?: string;
}

/** bloque negro del tablero, del próximo viaje y de la barra de pago */
export function BloqueNegro({
  children,
  estilo,
  estiloContenido,
  testID,
}: PropiedadesBloqueNegro) {
  const { colores } = useTema();

  return (
    <View
      style={[
        {
          backgroundColor: colores.bloqueNegro,
          borderRadius: radios.bloqueNegro,
          elevation: 8,
          shadowColor: colores.sombraRelieve,
          shadowOffset: { height: 14, width: 10 },
          shadowOpacity: 0.32,
          shadowRadius: 13,
        },
        estilo,
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
          {
            borderColor: conAlfa(colores.luzRelieve, 0.1),
            borderRadius: radios.bloqueNegro,
            borderWidth: 1,
          },
          estiloContenido,
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
