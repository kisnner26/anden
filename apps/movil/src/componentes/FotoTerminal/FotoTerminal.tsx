import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Loseta } from '@/componentes/Loseta';
import { fotoDeTerminal } from '@/datos/fotosTerminal';
import { conAlfa } from '@/tema/alfa';
import { radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesFotoTerminal {
  codigo: string;
  /** resaltada: la terminal elegida */
  elegida?: boolean;
  nombre: string;
  tamano?: number;
  terminalId: string;
}

/** la foto de la terminal en un cuadro redondeado; sin foto queda el código sobre un mosaico, como antes */
export function FotoTerminal({
  codigo,
  elegida = false,
  nombre,
  tamano = 56,
  terminalId,
}: PropiedadesFotoTerminal) {
  const { colores } = useTema();
  const foto = fotoDeTerminal(terminalId);
  if (!foto) {
    return (
      <Loseta tamano={tamano} variante={elegida ? 'ambar' : 'negra'}>
        <Text
          style={[
            tipografia.dato,
            { color: elegida ? colores.sobreAmbar : colores.sobreNegro },
          ]}
        >
          {codigo}
        </Text>
      </Loseta>
    );
  }
  return (
    <View
      accessibilityLabel={nombre}
      accessibilityRole="image"
      style={[
        estilos.marco,
        {
          borderColor: elegida ? colores.ambar : conAlfa(colores.tinta, 0.12),
          borderRadius: radios.loseta,
          height: tamano,
          width: tamano,
        },
      ]}
      testID={`foto-terminal-${terminalId}`}
    >
      <Image contentFit="cover" source={foto} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: { borderWidth: 2, overflow: 'hidden' },
});
