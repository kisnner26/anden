import { StyleSheet, View } from 'react-native';

import { useTema } from '@/tema/useTema';

/** react-native-maps solo existe en iOS y Android: en web queda el fondo vacío */
export function MapaConductor(propiedades: Record<string, unknown>) {
  void propiedades;
  const { colores } = useTema();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colores.fondoProfundo },
      ]}
      testID="mapa-conductor"
    />
  );
}
