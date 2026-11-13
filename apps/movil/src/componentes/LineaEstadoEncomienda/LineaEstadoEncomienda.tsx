import { StyleSheet, Text, View } from 'react-native';

import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ETAPAS = ['solicitada', 'confirmada', 'enElBus', 'entregada'] as const;

export interface PropiedadesLineaEstadoEncomienda {
  /** cuántas etapas se cumplieron; una solicitud recién hecha lleva 1 */
  cumplidas?: number;
}

/** las cuatro etapas de un envío en una línea: solicitada, confirmada, en el bus y entregada */
export function LineaEstadoEncomienda({
  cumplidas = 1,
}: PropiedadesLineaEstadoEncomienda) {
  const { colores } = useTema();
  return (
    <View
      accessibilityLabel={`${t(`encomiendas.etapa_${ETAPAS[Math.max(0, cumplidas - 1)] ?? 'solicitada'}`)}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: ETAPAS.length, min: 0, now: cumplidas }}
      accessible
      style={estilos.fila}
    >
      {ETAPAS.map((etapa, indice) => {
        const hecha = indice < cumplidas;
        return (
          <View key={etapa} style={estilos.etapa}>
            <View style={estilos.marcador}>
              <View
                style={[
                  estilos.tramo,
                  {
                    backgroundColor:
                      indice === 0
                        ? 'transparent'
                        : hecha
                          ? colores.ambar
                          : colores.linea,
                  },
                ]}
              />
              <View
                style={[
                  estilos.punto,
                  hecha
                    ? { backgroundColor: colores.ambar }
                    : {
                        backgroundColor: conAlfa(colores.tinta, 0.06),
                        borderColor: colores.linea,
                        borderWidth: 2,
                      },
                ]}
              />
              <View
                style={[
                  estilos.tramo,
                  {
                    backgroundColor:
                      indice === ETAPAS.length - 1
                        ? 'transparent'
                        : indice + 1 < cumplidas
                          ? colores.ambar
                          : colores.linea,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                tipografia.etiqueta,
                estilos.texto,
                { color: hecha ? colores.tinta : colores.tintaSuave },
              ]}
            >
              {t(`encomiendas.etapa_${etapa}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  etapa: { alignItems: 'center', flex: 1, gap: espacios.ocho },
  fila: { flexDirection: 'row' },
  marcador: { alignItems: 'center', flexDirection: 'row', width: '100%' },
  punto: { borderRadius: radios.pildora, height: 16, width: 16 },
  texto: { fontSize: 10, lineHeight: 13, textAlign: 'center' },
  tramo: { flex: 1, height: 3 },
});
