import { StyleSheet, Text, View } from 'react-native';

import { coloresOscuros as negro } from '@/tema/colores';

export interface PropiedadesFichaFlap {
  caracter: string;
  color: string;
}

/** una ficha independiente del tablero; el separador no gira ni lleva bisagra */
export function FichaFlap({ caracter, color }: PropiedadesFichaFlap) {
  const esSeparador = caracter === ':';
  return (
    <View
      style={[estilos.ficha, esSeparador && estilos.separador]}
      testID="ficha-flap"
    >
      <Text style={[estilos.letra, { color }]}>{caracter}</Text>
      {!esSeparador && <View style={estilos.bisagra} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  bisagra: {
    backgroundColor: negro.bloqueNegro,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 14,
  },
  ficha: {
    alignItems: 'center',
    backgroundColor: negro.barroOscuro,
    borderRadius: 3,
    height: 28,
    justifyContent: 'center',
    width: 15,
  },
  letra: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 17,
    lineHeight: 20,
  },
  separador: { backgroundColor: 'transparent', width: 6 },
});
