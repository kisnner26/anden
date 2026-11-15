import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesTalonRasgado {
  children: ReactNode;
  /** el boleto ya se usó: el talón se rasga por la mitad; antes de eso se ve entero */
  rasgado: boolean;
}

/** el alto de cada diente del borde rasgado y cuántos dientes caben a lo ancho */
const DIENTE = 7;
const DIENTES = 22;

/** una línea de dientes de sierra del ancho del talón: la tapa que dibuja el borde roto sobre cada mitad */
function Dientes({
  ancho,
  arriba,
  color,
}: {
  ancho: number;
  arriba: boolean;
  color: string;
}) {
  const paso = ancho / DIENTES;
  let camino = arriba
    ? `M0 0 L${ancho} 0 L${ancho} ${DIENTE}`
    : `M0 ${DIENTE} L${ancho} ${DIENTE} L${ancho} 0`;
  for (let i = DIENTES; i > 0; i -= 1) {
    const x = i * paso;
    const hondo = i % 2 === 0;
    const y = arriba ? (hondo ? DIENTE : 0) : hondo ? 0 : DIENTE;
    camino += ` L${x - paso / 2} ${y}`;
    camino += ` L${x - paso} ${arriba ? DIENTE : 0}`;
  }
  return (
    <Svg height={DIENTE} width={ancho}>
      <Path d={`${camino} Z`} fill={color} />
    </Svg>
  );
}

/**
 * un boleto usado se rasga: el talón se parte por la mitad con un borde de papel roto y las dos mitades se separan un poco,
 * como el recorte que queda de un viaje. Al usarse en pantalla la rotura se anima; si ya estaba usado se ve rasgado de una vez
 */
export function TalonRasgado({ children, rasgado }: PropiedadesTalonRasgado) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const [medida, establecerMedida] = useState({ alto: 0, ancho: 0 });
  const apertura = useRef(new Animated.Value(rasgado ? 1 : 0)).current;
  const eraRasgado = useRef(rasgado);

  useEffect(() => {
    if (rasgado && !eraRasgado.current) {
      if (reducido) apertura.setValue(1);
      else
        Animated.spring(apertura, {
          friction: 5,
          tension: 70,
          toValue: 1,
          useNativeDriver: true,
        }).start();
    }
    if (!rasgado) apertura.setValue(0);
    eraRasgado.current = rasgado;
  }, [apertura, rasgado, reducido]);

  if (!rasgado) return <>{children}</>;

  function alMedir(evento: LayoutChangeEvent) {
    const { height, width } = evento.nativeEvent.layout;
    establecerMedida({ alto: height, ancho: width });
  }

  const { alto, ancho } = medida;
  const mitad = alto / 2;
  const listo = alto > 0 && ancho > 0;

  return (
    <View onLayout={alMedir} testID="talon-rasgado">
      {/* la copia entera marca el tamaño y es la que lee el lector de pantalla */}
      <View style={listo ? estilos.oculto : undefined}>{children}</View>
      {listo ? (
        <>
          <Animated.View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[
              estilos.mitad,
              {
                height: mitad,
                top: 0,
                transform: [
                  {
                    translateY: apertura.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -7],
                    }),
                  },
                  {
                    rotate: apertura.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-1.4deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[estilos.copia, { height: alto, width: ancho }]}>
              {children}
            </View>
            <View style={estilos.bordeAbajo}>
              <Dientes ancho={ancho} arriba={false} color={colores.fondo} />
            </View>
          </Animated.View>
          <Animated.View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[
              estilos.mitad,
              {
                height: mitad,
                top: mitad,
                transform: [
                  {
                    translateY: apertura.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 7],
                    }),
                  },
                  {
                    rotate: apertura.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '1.1deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                estilos.copia,
                { height: alto, top: -mitad, width: ancho },
              ]}
            >
              {children}
            </View>
            <View style={estilos.bordeArriba}>
              <Dientes ancho={ancho} arriba color={colores.fondo} />
            </View>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  bordeAbajo: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  bordeArriba: { left: 0, position: 'absolute', right: 0, top: 0 },
  copia: { left: 0, position: 'absolute' },
  mitad: { left: 0, overflow: 'hidden', position: 'absolute', right: 0 },
  oculto: { opacity: 0 },
});
