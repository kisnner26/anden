import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

export interface PropiedadesTarjeta extends PropsWithChildren {
  etiquetaAccesible?: string;
}

export function Tarjeta({
  children,
  etiquetaAccesible,
}: PropiedadesTarjeta) {
  const { colores } = useTema();
  return (
    <View
      accessibilityLabel={etiquetaAccesible}
      accessible={etiquetaAccesible !== undefined}
      style={[
        estilos.base,
        { backgroundColor: colores.superficie, borderColor: colores.linea },
      ]}
    >
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espacios.ocho,
    padding: espacios.dieciseis,
  },
});
