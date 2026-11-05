import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BloqueNegro } from '@/componentes/BloqueNegro';
import { disposicionPantalla, espacios } from '@/tema/espacios';

export interface PropiedadesPieReserva {
  children: ReactNode;
  estiloContenido?: StyleProp<ViewStyle>;
}

/** pie flotante compartido por la reserva, separado del indicador de inicio */
export function PieReserva({
  children,
  estiloContenido,
}: PropiedadesPieReserva) {
  const margenes = useSafeAreaInsets();

  return (
    <View style={[estilos.pie, { bottom: margenes.bottom + espacios.ocho }]}>
      <BloqueNegro estiloContenido={estiloContenido}>{children}</BloqueNegro>
    </View>
  );
}

const estilos = StyleSheet.create({
  pie: {
    left: disposicionPantalla.margenFlotante,
    position: 'absolute',
    right: disposicionPantalla.margenFlotante,
  },
});
