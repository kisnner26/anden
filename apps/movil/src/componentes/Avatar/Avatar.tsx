import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesAvatar {
  /** texto para lectores de pantalla */
  descripcion: string;
  /** hasta dos letras que se muestran sin foto */
  iniciales: string;
  tamano?: number;
  uri?: string | null;
}

/** la foto de la persona en un círculo de barro; sin foto o si falla, sus iniciales */
export function Avatar({
  descripcion,
  iniciales,
  tamano = 72,
  uri = null,
}: PropiedadesAvatar) {
  const { colores } = useTema();
  const [fallo, establecerFallo] = useState(false);
  const mostrarFoto = uri !== null && !fallo;

  return (
    <Bloque
      estiloContenido={[estilos.circulo, { height: tamano, width: tamano }]}
      radio="pildora"
    >
      <View
        accessible
        accessibilityLabel={descripcion}
        accessibilityRole="image"
        style={estilos.contenido}
      >
        {mostrarFoto ? (
          <Image
            onError={() => establecerFallo(true)}
            source={{ uri }}
            style={{ borderRadius: tamano / 2, height: tamano, width: tamano }}
            testID="avatar-foto"
          />
        ) : (
          <Text
            style={[
              tipografia.titulo,
              { color: colores.tinta, fontSize: tamano * 0.38 },
            ]}
          >
            {iniciales === '' ? '·' : iniciales}
          </Text>
        )}
      </View>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contenido: { alignItems: 'center', justifyContent: 'center' },
});
