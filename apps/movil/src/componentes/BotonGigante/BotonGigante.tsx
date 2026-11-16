import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBotonGigante {
  alPresionar: () => void;
  /** una línea corta debajo, como la hora o el precio */
  detalle?: string;
  /** el que más importa de la pantalla: va oscuro con letras ámbar */
  destacado?: boolean;
  etiqueta: string;
  /** lo que lee el lector de pantalla; sin esto se lee la etiqueta con el detalle */
  etiquetaAccesible?: string;
  /** una palabra pequeña arriba, como "Tu boleto" */
  sobretitulo?: string;
}

/** el botón del modo simple: ocupa todo el ancho, mide más de 100 puntos y casi no tiene palabras */
export function BotonGigante({
  alPresionar,
  destacado = false,
  detalle,
  etiqueta,
  etiquetaAccesible,
  sobretitulo,
}: PropiedadesBotonGigante) {
  const { colores } = useTema();
  const contenido = (
    <View style={estilos.contenido}>
      {sobretitulo ? (
        <Text
          style={[
            tipografia.etiqueta,
            { color: destacado ? colores.ambar : colores.ambarTexto },
          ]}
        >
          {sobretitulo}
        </Text>
      ) : null}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        numberOfLines={2}
        style={[
          tipografia.titularResumen,
          { color: destacado ? colores.sobreNegro : colores.tinta },
        ]}
      >
        {etiqueta}
      </Text>
      {detalle ? (
        <Text
          style={[
            tipografia.cuerpo,
            { color: destacado ? colores.sobreNegro : colores.tintaSuave },
          ]}
        >
          {detalle}
        </Text>
      ) : null}
    </View>
  );
  return (
    <Pressable
      accessibilityLabel={
        etiquetaAccesible ?? (detalle ? `${etiqueta}. ${detalle}` : etiqueta)
      }
      accessibilityRole="button"
      onPress={alPresionar}
      style={estilos.raiz}
    >
      {destacado ? (
        <View
          style={[estilos.tarjeta, { backgroundColor: colores.bloqueNegro }]}
        >
          {contenido}
        </View>
      ) : (
        <Bloque estiloContenido={estilos.tarjeta}>{contenido}</Bloque>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.cuatro, justifyContent: 'center' },
  raiz: { minHeight: 112 },
  tarjeta: {
    borderRadius: radios.tarjeta,
    justifyContent: 'center',
    minHeight: 112,
    padding: espacios.veinticuatro,
  },
});
