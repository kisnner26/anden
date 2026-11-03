import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { conAlfa } from '@/tema/alfa';
import { radios } from '@/tema/espacios';
import { estilosRelieve, relieve } from '@/tema/relieve';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBloque {
  children?: ReactNode;
  /** estilo del contenedor externo: márgenes, ancho, flex */
  estilo?: StyleProp<ViewStyle>;
  /** estilo del contenido: relleno, dirección, separación */
  estiloContenido?: StyleProp<ViewStyle>;
  /** casilla hundida en lugar de relieve */
  hundido?: boolean;
  radio?: keyof typeof radios;
  testID?: string;
}

/** bloque blando de barro: degradado suave con luz arriba a la izquierda y sombra abajo a la derecha */
export function Bloque({
  children,
  estilo,
  estiloContenido,
  hundido = false,
  radio = 'bloque',
  testID,
}: PropiedadesBloque) {
  const { colores, modo } = useTema();
  const borde = radios[radio];

  if (hundido) {
    const sombraInterior = conAlfa(
      colores.sombraRelieve,
      relieve[modo].sombra.opacidad,
    );
    const luzInterior = conAlfa(colores.luzRelieve, relieve[modo].luz.opacidad);
    return (
      <View style={estilo} testID={testID}>
        <LinearGradient
          colors={[colores.barroOscuro, colores.barroClaro]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={[
            {
              borderBottomColor: luzInterior,
              borderLeftColor: sombraInterior,
              borderRadius: borde,
              borderRightColor: luzInterior,
              borderTopColor: sombraInterior,
              borderWidth: 2,
            },
            estiloContenido,
          ]}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  const { luz, sombra } = estilosRelieve(modo, colores);
  return (
    <View style={estilo} testID={testID}>
      <View
        style={[
          { backgroundColor: colores.barroClaro, borderRadius: borde },
          sombra,
        ]}
      >
        <View
          style={[
            { backgroundColor: colores.barroClaro, borderRadius: borde },
            luz,
          ]}
        >
          <LinearGradient
            colors={[colores.barroClaro, colores.barroOscuro]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[{ borderRadius: borde }, estiloContenido]}
          >
            {children}
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}
