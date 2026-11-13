import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export const MAXIMO_PASAJEROS = 6;

export interface PropiedadesContadorPasajeros {
  alCambiar: (cantidad: number) => void;
  cantidad: number;
}

/** cuántos pasajeros viajan: menos y más a los lados y la cifra grande al centro */
export function ContadorPasajeros({
  alCambiar,
  cantidad,
}: PropiedadesContadorPasajeros) {
  const { colores } = useTema();

  function cambiar(nueva: number) {
    if (nueva < 1 || nueva > MAXIMO_PASAJEROS) return;
    void Haptics.selectionAsync().catch(() => undefined);
    alCambiar(nueva);
  }

  return (
    <Bloque estiloContenido={estilos.fila}>
      <Pressable
        accessibilityLabel={t('rutas.menosPasajeros')}
        accessibilityRole="button"
        accessibilityState={{ disabled: cantidad <= 1 }}
        disabled={cantidad <= 1}
        onPress={() => cambiar(cantidad - 1)}
        style={[
          estilos.boton,
          { backgroundColor: colores.bloqueNegro },
          cantidad <= 1 && estilos.apagado,
        ]}
      >
        <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>−</Text>
      </Pressable>
      <View style={estilos.centro}>
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.display, { color: colores.tinta }]}
        >
          {cantidad}
        </Text>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {cantidad === 1 ? t('rutas.pasajero') : t('rutas.pasajeros')}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={t('rutas.masPasajeros')}
        accessibilityRole="button"
        accessibilityState={{ disabled: cantidad >= MAXIMO_PASAJEROS }}
        disabled={cantidad >= MAXIMO_PASAJEROS}
        onPress={() => cambiar(cantidad + 1)}
        style={[
          estilos.boton,
          { backgroundColor: colores.bloqueNegro },
          cantidad >= MAXIMO_PASAJEROS && estilos.apagado,
        ]}
      >
        <Text style={[tipografia.datoGrande, { color: colores.ambar }]}>+</Text>
      </Pressable>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  apagado: { opacity: 0.3 },
  boton: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.toqueMinimo + 8,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo + 8,
  },
  centro: { alignItems: 'center', flex: 1 },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: espacios.doce,
  },
});
