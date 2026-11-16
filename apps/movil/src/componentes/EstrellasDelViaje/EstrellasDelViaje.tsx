import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { TRAZO_ESTRELLA } from '@/componentes/CalificarViaje/CalificarViaje';
import { Presionable } from '@/componentes/Presionable';
import { espacios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesEstrellasDelViaje {
  /** se llama con las estrellas elegidas, de 1 a 5; se puede volver a tocar para cambiarlas */
  alElegir: (estrellas: number) => void;
  /** las estrellas ya elegidas; 0 si todavía no */
  valor: number;
}

/** cinco estrellas grandes para calificar de un toque, sin salir del viaje */
export function EstrellasDelViaje({
  alElegir,
  valor,
}: PropiedadesEstrellasDelViaje) {
  const { colores } = useTema();
  return (
    <View accessibilityRole="radiogroup" style={estilos.fila}>
      {[1, 2, 3, 4, 5].map((n) => {
        const activa = n <= valor;
        return (
          <Presionable
            accessibilityLabel={rellenar(t('viajeEnCurso.estrella'), { n })}
            accessibilityRole="radio"
            accessibilityState={{ selected: n === valor }}
            escala={0.88}
            hitSlop={6}
            key={n}
            onPress={() => alElegir(n)}
            sensacion="seleccion"
          >
            <Svg height={44} viewBox="0 0 48 48" width={44}>
              <Path
                d={TRAZO_ESTRELLA}
                fill={activa ? colores.ambar : colores.linea}
                stroke={activa ? colores.ambar : colores.linea}
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
            </Svg>
          </Presionable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'center',
  },
});
