import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { disposicionPantalla, espacios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

export interface PropiedadesMarcoPestana {
  children: ReactNode;
  estiloContenido?: StyleProp<ViewStyle>;
  testID?: string;
}

/** lienzo común de las pestañas: fondo cálido, cuadrícula móvil y espacio seguro para la barra */
export function MarcoPestana({
  children,
  estiloContenido,
  testID,
}: PropiedadesMarcoPestana) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <LinearGradient
        colors={[colores.fondo, colores.fondoProfundo]}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={estilos.desplazamiento}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID={testID}
      >
        <View
          style={[
            estilos.contenido,
            {
              paddingBottom:
                disposicionPantalla.espacioBarraPestanas + margenes.bottom,
              paddingHorizontal:
                espacios.lateral + Math.max(margenes.left, margenes.right),
              paddingTop: disposicionPantalla.rellenoSuperior + margenes.top,
            },
            estiloContenido,
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignSelf: 'center',
    maxWidth: disposicionPantalla.anchoMaximo,
    width: '100%',
  },
  desplazamiento: { flexGrow: 1 },
  pantalla: { flex: 1 },
});
