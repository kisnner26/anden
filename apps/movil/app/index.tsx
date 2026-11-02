import { StyleSheet, Text, View } from 'react-native';

import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export default function Inicio() {
  const { colores } = useTema();

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <Text style={[tipografia.display, { color: colores.tinta }]}>Andén</Text>
      <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>
        06:30
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
