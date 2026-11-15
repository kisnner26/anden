import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type TextStyle } from 'react-native';

import { useSensaciones } from '@/datos/useSensaciones';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface PropiedadesDigitosGiratorios {
  /** el estilo del texto; necesita `lineHeight`, que es el alto de cada dígito */
  estilo: TextStyle & { lineHeight: number };
  valor: number;
}

function Columna({
  alto,
  digito,
  estilo,
}: {
  alto: number;
  digito: number;
  estilo: TextStyle;
}) {
  const reducido = useMovimientoReducido();
  const posicion = useRef(new Animated.Value(digito)).current;
  const anterior = useRef(digito);

  useEffect(() => {
    if (anterior.current === digito) return;
    anterior.current = digito;
    if (reducido) posicion.setValue(digito);
    else
      Animated.spring(posicion, {
        friction: 7,
        tension: 120,
        toValue: digito,
        useNativeDriver: true,
      }).start();
  }, [digito, posicion, reducido]);

  return (
    <View style={{ height: alto, overflow: 'hidden' }}>
      <Animated.View
        style={{
          transform: [
            {
              translateY: posicion.interpolate({
                inputRange: [0, 9],
                outputRange: [0, -9 * alto],
              }),
            },
          ],
        }}
      >
        {DIGITOS.map((d) => (
          <Text key={d} style={[estilo, { height: alto }]}>
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * un número cuyos dígitos giran como en un tablero de salidas cada vez que cambia, con un toque de vibración por cada giro;
 * para el lector de pantalla es solo el número
 */
export function DigitosGiratorios({
  estilo,
  valor,
}: PropiedadesDigitosGiratorios) {
  const sentir = useSensaciones();
  const previo = useRef(valor);
  const texto = String(Math.max(0, Math.trunc(valor)));
  const alto = estilo.lineHeight;

  useEffect(() => {
    if (previo.current !== valor) sentir('seleccion');
    previo.current = valor;
  }, [sentir, valor]);

  return (
    <View
      accessibilityLabel={texto}
      accessible
      style={estilos.fila}
      testID="digitos-giratorios"
    >
      {texto.split('').map((digito, indice) => (
        <Columna
          alto={alto}
          digito={Number(digito)}
          estilo={estilo}
          // la posición se cuenta desde la derecha para que las unidades sigan siendo la misma columna
          key={texto.length - indice}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({ fila: { flexDirection: 'row' } });
