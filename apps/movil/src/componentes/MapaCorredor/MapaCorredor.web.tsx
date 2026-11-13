import { StyleSheet, View } from 'react-native';

import { radios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

interface PropiedadesWeb {
  etiquetaDestino?: string;
  simulacion?: unknown;
  variante?: string;
}

/**
 * versión para web y para el paso de servidor del empaquetado: react-native-maps
 * solo existe en iOS y Android, así que aquí queda solo el marco vacío.
 */
export function MapaCorredor(propiedades: PropiedadesWeb) {
  void propiedades;
  const { colores } = useTema();
  return (
    <View
      style={[estilos.marco, { borderColor: colores.linea }]}
      testID="mapa-corredor"
    />
  );
}

const estilos = StyleSheet.create({
  marco: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
  },
});
