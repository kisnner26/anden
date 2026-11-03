import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { coloresOscuros as negro } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';

export interface PropiedadesFichaFlap {
  caracter: string;
  color: string;
}

/** una ficha independiente del tablero; el separador no gira ni lleva bisagra */
export function FichaFlap({ caracter, color }: PropiedadesFichaFlap) {
  const esSeparador = caracter === ':';
  const anterior = useRef(caracter);
  const reducirMovimiento = useReducedMotion();
  const caida = useSharedValue(1);
  const estiloCaida = useAnimatedStyle(() => ({
    transform: [{ scaleY: caida.value }],
  }));

  // la ficha nueva cae en su lugar; sin animación si el sistema pide reducir movimiento
  useEffect(() => {
    if (anterior.current === caracter) return;
    anterior.current = caracter;
    if (reducirMovimiento || esSeparador) return;
    caida.value = 0;
    caida.value = withTiming(1, { duration: movimiento.cambioEstado });
  }, [caracter, esSeparador, caida, reducirMovimiento]);

  return (
    <View
      style={[estilos.ficha, esSeparador && estilos.separador]}
      testID="ficha-flap"
    >
      <Animated.Text style={[estilos.letra, { color }, estiloCaida]}>
        {caracter}
      </Animated.Text>
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
