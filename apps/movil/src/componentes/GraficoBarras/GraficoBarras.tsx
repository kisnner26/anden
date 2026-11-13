import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { movimiento } from '@/tema/movimiento';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface BarraDelGrafico {
  etiqueta: string;
  valor: number;
}

export interface PropiedadesGraficoBarras {
  barras: readonly BarraDelGrafico[];
  /** descripción para lectores de pantalla */
  descripcion: string;
  /** cada cuántas barras se escribe la etiqueta, para que no se amontonen */
  cadaEtiqueta?: number;
}

const ALTO_GRAFICO = 120;

function Barra({
  maximo,
  barra,
  etiquetar,
}: {
  barra: BarraDelGrafico;
  etiquetar: boolean;
  maximo: number;
}) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const altura = useRef(new Animated.Value(0)).current;
  const destino = maximo === 0 ? 0 : (barra.valor / maximo) * ALTO_GRAFICO;

  useEffect(() => {
    if (reducir) {
      altura.setValue(destino);
      return;
    }
    Animated.timing(altura, {
      duration: movimiento.crecimientoBarra,
      easing: Easing.out(Easing.cubic),
      toValue: destino,
      useNativeDriver: false,
    }).start();
  }, [altura, destino, reducir]);

  return (
    <View style={estilos.columna}>
      <View style={estilos.pista}>
        <Animated.View
          style={[
            estilos.barra,
            {
              backgroundColor:
                barra.valor > 0 ? colores.ambar : colores.tintaSuave,
              height: altura,
              opacity: barra.valor > 0 ? 1 : 0.25,
              minHeight: 3,
            },
          ]}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          tipografia.pequeno,
          estilos.etiqueta,
          { color: colores.tintaSuave },
        ]}
      >
        {etiquetar ? barra.etiqueta : ' '}
      </Text>
    </View>
  );
}

/** barras verticales que crecen al aparecer; la más alta marca el máximo del período */
export function GraficoBarras({
  barras,
  cadaEtiqueta = 1,
  descripcion,
}: PropiedadesGraficoBarras) {
  const maximo = Math.max(0, ...barras.map((barra) => barra.valor));
  return (
    <View
      accessibilityLabel={descripcion}
      accessibilityRole="image"
      style={estilos.contenedor}
    >
      {barras.map((barra, indice) => (
        <Barra
          barra={barra}
          etiquetar={indice % cadaEtiqueta === 0}
          key={`${barra.etiqueta}-${indice}`}
          maximo={maximo}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: { borderRadius: 4, width: '100%' },
  columna: { flex: 1, gap: espacios.cuatro },
  contenedor: { alignItems: 'flex-end', flexDirection: 'row', gap: 3 },
  etiqueta: { fontSize: 10, textAlign: 'center' },
  pista: { height: ALTO_GRAFICO, justifyContent: 'flex-end' },
});
