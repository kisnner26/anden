import { StyleSheet, Text, View } from 'react-native';

import { formatoHora } from '@/datos/formato';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface ParadaLinea {
  hora: Date;
  nombre: string;
}

export interface PropiedadesLineaRuta {
  paradas: readonly ParadaLinea[];
}

/** el recorrido en vertical: la hora a la izquierda, una línea ámbar con un nodo por parada y el nombre */
export function LineaRuta({ paradas }: PropiedadesLineaRuta) {
  const { colores } = useTema();

  return (
    <View testID="linea-ruta">
      {paradas.map((parada, indice) => {
        const ultima = indice === paradas.length - 1;
        return (
          <View
            accessible
            accessibilityLabel={`${parada.nombre}, ${formatoHora(parada.hora)}`}
            key={`${parada.nombre}${indice}`}
            style={estilos.fila}
          >
            <Text
              style={[
                tipografia.dato,
                estilos.hora,
                { color: colores.ambarTexto },
              ]}
            >
              {formatoHora(parada.hora)}
            </Text>
            <View style={estilos.riel}>
              <View
                style={[
                  estilos.nodo,
                  {
                    backgroundColor:
                      indice === 0 ? colores.ambar : colores.fondo,
                    borderColor: colores.ambarProfundo,
                  },
                ]}
              />
              {!ultima && (
                <View
                  style={[
                    estilos.tramo,
                    { backgroundColor: colores.ambarProfundo },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                tipografia.nombreLinea,
                estilos.nombre,
                { color: colores.tinta },
              ]}
            >
              {parada.nombre}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: 56,
  },
  hora: { paddingTop: 1, width: 58 },
  nodo: { borderRadius: 999, borderWidth: 3, height: 16, width: 16 },
  nombre: { flex: 1 },
  riel: { alignItems: 'center', alignSelf: 'stretch', width: 16 },
  tramo: { flex: 1, width: 3 },
});
