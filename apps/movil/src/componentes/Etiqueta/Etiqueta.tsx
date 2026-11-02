import { StyleSheet, Text } from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesEtiqueta {
  texto: string;
  enCaja?: boolean;
  tono?: 'normal' | 'acento';
}

export function Etiqueta({
  texto,
  enCaja = false,
  tono = 'normal',
}: PropiedadesEtiqueta) {
  const { colores } = useTema();
  return (
    <Text
      style={[
        tipografia.etiqueta,
        estilos.base,
        { color: tono === 'acento' ? colores.ambar : colores.tintaSuave },
        enCaja && {
          borderColor: colores.linea,
          borderRadius: radios.cuadrado,
          borderWidth: 1,
          paddingHorizontal: espacios.ocho,
          paddingVertical: espacios.cuatro,
        },
      ]}
    >
      {texto}
    </Text>
  );
}

const estilos = StyleSheet.create({
  base: { alignSelf: 'flex-start' },
});
