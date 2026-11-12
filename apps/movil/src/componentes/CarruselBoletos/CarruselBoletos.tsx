import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { TarjetaBoleto } from '@/componentes/TarjetaBoleto';
import type { BoletoGuardado } from '@/datos/reserva';
import { espacios, radios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

/** lo que asoma de la tarjeta siguiente para que se note que hay más */
const ASOMO = 28;
const SEPARACION = espacios.doce;

export interface PropiedadesCarruselBoletos {
  ahora: Date;
  alAbrirBoleto: (boletoId: string) => void;
  boletos: readonly BoletoGuardado[];
}

/** los boletos próximos, uno por pantalla y deslizables, con puntos que dicen cuál se ve */
export function CarruselBoletos({
  ahora,
  alAbrirBoleto,
  boletos,
}: PropiedadesCarruselBoletos) {
  const { colores } = useTema();
  const { width } = useWindowDimensions();
  const [actual, establecerActual] = useState(0);
  const solo = boletos.length === 1;
  const ancho = solo
    ? width - 2 * espacios.lateral
    : width - 2 * espacios.lateral - ASOMO;
  const paso = ancho + SEPARACION;

  function alTerminarDeDeslizar(
    evento: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    establecerActual(Math.round(evento.nativeEvent.contentOffset.x / paso));
  }

  return (
    <View>
      <ScrollView
        contentContainerStyle={estilos.pista}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={alTerminarDeDeslizar}
        showsHorizontalScrollIndicator={false}
        snapToInterval={paso}
        style={estilos.recorte}
      >
        {boletos.map((guardado) => (
          <TarjetaBoleto
            ahora={ahora}
            alPresionar={alAbrirBoleto}
            ancho={ancho}
            guardado={guardado}
            key={guardado.boleto.id}
          />
        ))}
      </ScrollView>
      {!solo && (
        <View accessibilityElementsHidden style={estilos.puntos}>
          {boletos.map((guardado, indice) => (
            <View
              key={guardado.boleto.id}
              style={[
                estilos.punto,
                {
                  backgroundColor:
                    indice === actual ? colores.ambar : colores.linea,
                  width: indice === actual ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pista: { gap: SEPARACION, paddingHorizontal: espacios.lateral },
  punto: { borderRadius: radios.pildora, height: 8 },
  puntos: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.cuatro,
    justifyContent: 'center',
    marginTop: espacios.doce,
  },
  recorte: { marginHorizontal: -espacios.lateral },
});
