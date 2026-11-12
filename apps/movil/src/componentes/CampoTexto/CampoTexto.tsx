import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

/** sin interlínea fija: en iOS un lineHeight menor que la letra recorta las colas de g, y, p */
const textoCampo = {
  fontFamily: tipografia.cuerpo.fontFamily,
  fontSize: tipografia.cuerpo.fontSize,
};

export interface PropiedadesCampoTexto {
  alCambiar: (valor: string) => void;
  etiqueta: string;
  error?: string;
  marcador?: string;
  teclado?: KeyboardTypeOptions;
  valor: string;
}

/** campo de texto hundido con su rótulo arriba */
export function CampoTexto({
  alCambiar,
  etiqueta,
  error,
  marcador,
  teclado = 'default',
  valor,
}: PropiedadesCampoTexto) {
  const { colores } = useTema();

  return (
    <View style={estilos.contenedor}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Bloque estiloContenido={estilos.caja} hundido radio="loseta">
        <TextInput
          accessibilityLabel={etiqueta}
          accessibilityHint={error}
          aria-invalid={error !== undefined}
          keyboardType={teclado}
          onChangeText={alCambiar}
          placeholder={marcador}
          placeholderTextColor={colores.tintaSuave}
          selectionColor={colores.ambarTexto}
          style={[textoCampo, estilos.entrada, { color: colores.tinta }]}
          value={valor}
        />
      </Bloque>
      {error !== undefined && (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { paddingHorizontal: espacios.dieciseis },
  contenedor: { gap: espacios.ocho },
  entrada: { minHeight: 56, paddingVertical: espacios.dieciseis },
});
