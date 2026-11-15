import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesOpcionDeLista {
  alPresionar: () => void;
  detalle?: string;
  /** lo que va a la izquierda: un código, un ícono, una foto */
  izquierda?: ReactNode;
  etiquetaAccesible?: string;
  seleccionada?: boolean;
  titulo: string;
  /** una nota corta al final, como cuántas salidas hay */
  nota?: string;
}

/**
 * una fila para elegir dentro de una hoja o de un listado corto: todas miden lo mismo, el título nunca baja de línea, la
 * elegida se pinta de ámbar con una marca y no lleva sombras que la hoja recortaría
 */
export function OpcionDeLista({
  alPresionar,
  detalle,
  etiquetaAccesible,
  izquierda,
  nota,
  seleccionada = false,
  titulo,
}: PropiedadesOpcionDeLista) {
  const { colores } = useTema();
  return (
    <Pressable
      accessibilityLabel={etiquetaAccesible ?? titulo}
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionada }}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.fila,
        {
          backgroundColor: seleccionada
            ? conAlfa(colores.ambar, 0.16)
            : conAlfa(colores.tinta, 0.05),
          borderColor: seleccionada ? colores.ambar : colores.linea,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {izquierda ? <View style={estilos.izquierda}>{izquierda}</View> : null}
      <View style={estilos.textos}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          numberOfLines={1}
          style={[tipografia.subtitulo, { color: colores.tinta }]}
        >
          {titulo}
        </Text>
        {detalle ? (
          <Text
            numberOfLines={1}
            style={[tipografia.pequeno, { color: colores.tintaSuave }]}
          >
            {detalle}
          </Text>
        ) : null}
      </View>
      {nota ? (
        <Text
          numberOfLines={1}
          style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
        >
          {nota}
        </Text>
      ) : null}
      <View style={estilos.marca}>
        {seleccionada ? (
          <Svg height={26} viewBox="0 0 26 26" width={26}>
            <Circle cx={13} cy={13} fill={colores.ambar} r={12} />
            <Path
              d="M7.5 13.4 L11.4 17.2 L18.6 9.4"
              fill="none"
              stroke={colores.sobreAmbar}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.6}
            />
          </Svg>
        ) : (
          <View
            style={[
              estilos.vacia,
              { borderColor: conAlfa(colores.tinta, 0.25) },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    borderRadius: radios.bloque,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: 72,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  izquierda: { alignItems: 'center', justifyContent: 'center' },
  marca: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  textos: { flex: 1, gap: 2 },
  vacia: { borderRadius: 13, borderWidth: 2, height: 26, width: 26 },
});
