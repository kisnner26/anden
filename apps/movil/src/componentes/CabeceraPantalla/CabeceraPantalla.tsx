import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesCabeceraPantalla {
  alVolver: () => void;
  /** parte del titular que va en ámbar, por ejemplo el punto final */
  resalte?: string;
  titulo: string;
}

/** flecha de volver y titular condensado; la repiten todas las pantallas que se abren desde otra */
export function CabeceraPantalla({
  alVolver,
  resalte = '.',
  titulo,
}: PropiedadesCabeceraPantalla) {
  const { colores } = useTema();

  return (
    <View style={estilos.contenedor}>
      <Pressable
        accessibilityLabel={t('asientos.volver')}
        accessibilityRole="button"
        onPress={alVolver}
      >
        <Bloque
          estilo={estilos.volver}
          estiloContenido={estilos.circulo}
          radio="pildora"
        >
          <Icono nombre="volver" tamano="grande" />
        </Bloque>
      </Pressable>
      <Text
        accessibilityRole="header"
        style={[tipografia.titularPantalla, { color: colores.tinta }]}
      >
        {titulo}
        <Text style={{ color: colores.ambarTitular }}>{resalte}</Text>
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  contenedor: { gap: espacios.dieciseis },
  volver: { alignSelf: 'flex-start' },
});
