import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresAura, coloresOro } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesOndaDeVoz {
  /** dorada mientras Andén habla, con el aura mientras escucha */
  tono?: 'escucha' | 'habla';
  alto?: number;
}

/** cuánto sube cada barra y con qué desfase, para que la onda no se vea pareja */
const BARRAS = [
  { demora: 0, tope: 0.55 },
  { demora: 120, tope: 0.9 },
  { demora: 40, tope: 1 },
  { demora: 180, tope: 0.75 },
  { demora: 80, tope: 0.5 },
] as const;

function Barra({
  alto,
  color,
  demora,
  reducir,
  tope,
}: {
  alto: number;
  color: string;
  demora: number;
  reducir: boolean;
  tope: number;
}) {
  const escala = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    if (reducir) {
      escala.setValue(tope);
      return;
    }
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.delay(demora),
        Animated.timing(escala, {
          duration: movimiento.ondaVoz,
          easing: Easing.inOut(Easing.quad),
          toValue: tope,
          useNativeDriver: true,
        }),
        Animated.timing(escala, {
          duration: movimiento.ondaVoz,
          easing: Easing.inOut(Easing.quad),
          toValue: 0.25,
          useNativeDriver: true,
        }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [demora, escala, reducir, tope]);

  return (
    <Animated.View
      style={[
        estilos.barra,
        {
          backgroundColor: color,
          height: alto,
          transform: [{ scaleY: escala }],
        },
      ]}
    />
  );
}

/** cinco barras que suben y bajan como una onda de voz; solo usa transformaciones, así no carga el hilo de JS */
export function OndaDeVoz({
  alto = 22,
  tono = 'escucha',
}: PropiedadesOndaDeVoz) {
  const reducir = useMovimientoReducido();
  const paleta = tono === 'habla' ? coloresOro : coloresAura;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[estilos.fila, { height: alto }]}
    >
      {BARRAS.map((barra, indice) => (
        <Barra
          alto={alto}
          color={paleta[indice % paleta.length] ?? paleta[0]}
          demora={barra.demora}
          key={indice}
          reducir={reducir}
          tope={barra.tope}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: { borderRadius: 3, width: 4 },
  fila: { alignItems: 'center', flexDirection: 'row', gap: 3 },
});
