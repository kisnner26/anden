import { StyleSheet, Text, View } from 'react-native';

export default function Inicio() {
  return (
    <View style={estilos.pantalla}>
      <Text>Andén</Text>
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
