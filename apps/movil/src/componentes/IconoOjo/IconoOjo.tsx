import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

const PathAnimado = Animated.createAnimatedComponent(Path);
const CirculoAnimado = Animated.createAnimatedComponent(Circle);

const LARGO_TACHADO = 24;

export interface PropiedadesIconoOjo {
  /** el ojo abierto significa que lo escondido se está viendo */
  abierto: boolean;
  tamano?: number;
}

/**
 * un ojo dibujado a mano para mostrar u ocultar la contraseña: al abrirse la raya que lo tacha se retira, la pupila crece
 * y el ojo parpadea una vez; al cerrarse, la raya vuelve a cruzarlo
 */
export function IconoOjo({ abierto, tamano = 26 }: PropiedadesIconoOjo) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const progreso = useRef(new Animated.Value(abierto ? 1 : 0)).current;
  const parpadeo = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducido) {
      progreso.setValue(abierto ? 1 : 0);
      return;
    }
    Animated.parallel([
      Animated.timing(progreso, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
        toValue: abierto ? 1 : 0,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(parpadeo, {
          duration: 90,
          toValue: 0.12,
          useNativeDriver: true,
        }),
        Animated.timing(parpadeo, {
          duration: 140,
          easing: Easing.out(Easing.back(2)),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [abierto, parpadeo, progreso, reducido]);

  return (
    <Animated.View style={{ transform: [{ scaleY: parpadeo }] }}>
      <Svg
        height={tamano}
        testID="icono-ojo"
        viewBox="0 0 24 24"
        width={tamano}
      >
        <Path
          d="M2 12 C 5 6.6, 8.6 4.6, 12 4.6 C 15.4 4.6, 19 6.6, 22 12 C 19 17.4, 15.4 19.4, 12 19.4 C 8.6 19.4, 5 17.4, 2 12 Z"
          fill="none"
          stroke={colores.tinta}
          strokeLinejoin="round"
          strokeWidth={1.9}
        />
        <CirculoAnimado
          cx={12}
          cy={12}
          fill={colores.ambarTexto}
          r={progreso.interpolate({
            inputRange: [0, 1],
            outputRange: [2.2, 3.8],
          })}
        />
        <Circle cx={13.1} cy={10.9} fill={colores.fondo} r={0.9} />
        <PathAnimado
          d="M4.5 20 L19.5 4"
          fill="none"
          stroke={colores.cancelado}
          strokeDasharray={`${LARGO_TACHADO} ${LARGO_TACHADO}`}
          strokeDashoffset={progreso.interpolate({
            inputRange: [0, 1],
            outputRange: [0, LARGO_TACHADO],
          })}
          strokeLinecap="round"
          strokeWidth={2.2}
        />
      </Svg>
    </Animated.View>
  );
}
