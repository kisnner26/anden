import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';

import { fotoDeDestino } from '@/datos/fotosDestino';
import { conAlfa } from '@/tema/alfa';
import { radios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesFotoDestino {
  /** lo que se dibuja encima de la foto, abajo */
  children?: ReactNode;
  destino: string;
  estilo?: StyleProp<ViewStyle>;
  /** si el destino no tiene foto se usa la de la ciudad de salida */
  origen?: string;
  radio?: keyof typeof radios;
  testID?: string;
}

/**
 * la foto de la ciudad de destino con esquinas redondeadas, un velo ámbar y un degradado oscuro abajo
 * para que el texto se lea; sin foto queda el mismo marco con el degradado de la marca
 */
export function FotoDestino({
  children,
  destino,
  estilo,
  origen,
  radio = 'bloque',
  testID,
}: PropiedadesFotoDestino) {
  const { colores } = useTema();
  const foto =
    fotoDeDestino(destino) ?? (origen ? fotoDeDestino(origen) : null);
  const borde = radios[radio];

  return (
    <View
      accessibilityLabel={
        foto ? rellenar(t('fotoDestino.descripcion'), { destino }) : undefined
      }
      accessibilityRole={foto ? 'image' : undefined}
      style={[
        estilos.marco,
        { backgroundColor: colores.bloqueNegro, borderRadius: borde },
        estilo,
      ]}
      testID={testID}
    >
      {foto ? (
        <Image resizeMode="cover" source={foto} style={estilos.relleno} />
      ) : (
        <LinearGradient
          colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={estilos.relleno}
        />
      )}
      <View
        pointerEvents="none"
        style={[
          estilos.relleno,
          { backgroundColor: conAlfa(colores.ambar, 0.16) },
        ]}
      />
      <LinearGradient
        colors={[
          conAlfa(colores.bloqueNegro, 0),
          conAlfa(colores.bloqueNegro, 0.82),
        ]}
        pointerEvents="none"
        style={estilos.relleno}
      />
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: { overflow: 'hidden' },
  relleno: { ...StyleSheet.absoluteFill },
});
