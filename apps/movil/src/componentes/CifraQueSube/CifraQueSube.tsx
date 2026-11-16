import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { tipografia } from '@/tema/tipografia';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesCifraQueSube {
  etiqueta: string;
  /** lo que va después del número, como la meta de "2 / 3" */
  meta?: string;
  /** retraso antes de empezar a contar */
  retardo?: number;
  valor: number;
}

/** un número que sube desde cero hasta su valor, con su etiqueta; sin movimiento aparece ya completo */
export function CifraQueSube({
  etiqueta,
  meta,
  retardo = 0,
  valor,
}: PropiedadesCifraQueSube) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const avance = useRef(new Animated.Value(reducido ? valor : 0)).current;
  const [mostrado, establecerMostrado] = useState(reducido ? valor : 0);

  useEffect(() => {
    const oyente = avance.addListener(({ value }) =>
      establecerMostrado(Math.round(value)),
    );
    let animacion: Animated.CompositeAnimation | null = null;
    if (reducido) {
      avance.setValue(valor);
    } else {
      animacion = Animated.timing(avance, {
        delay: retardo,
        duration: movimiento.conteoCifra,
        toValue: valor,
        useNativeDriver: false,
      });
      animacion.start();
    }
    return () => {
      animacion?.stop();
      avance.removeListener(oyente);
    };
  }, [avance, reducido, retardo, valor]);

  return (
    <View
      accessible
      accessibilityLabel={`${etiqueta}: ${valor}${meta ? ` ${meta}` : ''}`}
      style={estilos.cifra}
    >
      <Text style={[tipografia.datoGrande, { color: colores.tinta }]}>
        {mostrado}
        {meta ? (
          <Text style={[tipografia.dato, { color: colores.tintaSuave }]}>
            {` ${meta}`}
          </Text>
        ) : null}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cifra: { alignItems: 'center', flex: 1, gap: 2 },
});
