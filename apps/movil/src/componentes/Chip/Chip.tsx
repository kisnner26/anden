import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useResorte } from '@/componentes/Presionable';
import { Rebote } from '@/componentes/Rebote';
import { useSensaciones } from '@/datos/useSensaciones';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesChip {
  alCambiar: (seleccionado: boolean) => void;
  deshabilitado?: boolean;
  etiqueta: string;
  seleccionado?: boolean;
}

export function Chip({
  alCambiar,
  deshabilitado = false,
  etiqueta,
  seleccionado = false,
}: PropiedadesChip) {
  const { colores } = useTema();

  const resorte = useResorte(0.94);
  const sentir = useSensaciones();

  function cambiar() {
    sentir('seleccion');
    alCambiar(!seleccionado);
  }

  return (
    <Rebote activo={seleccionado} estilo={estilos.envoltura}>
      <Animated.View style={resorte.estilo}>
        <Pressable
          accessibilityLabel={etiqueta}
          accessibilityRole="button"
          accessibilityState={{
            disabled: deshabilitado,
            selected: seleccionado,
          }}
          disabled={deshabilitado}
          onPress={cambiar}
          onPressIn={resorte.alApretar}
          onPressOut={resorte.alSoltar}
          style={({ pressed }) => [
            estilos.base,
            {
              backgroundColor: seleccionado
                ? colores.fichaActiva
                : colores.barroClaro,
              borderColor: seleccionado ? colores.fichaActiva : colores.linea,
            },
            deshabilitado && estilos.deshabilitado,
            pressed && estilos.presionado,
          ]}
        >
          {!seleccionado && (
            <LinearGradient
              colors={[colores.barroClaro, colores.barroOscuro]}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={[StyleSheet.absoluteFill, estilos.fondoBarro]}
              testID="chip-fondo-barro"
            />
          )}
          {seleccionado && (
            <View
              style={[
                estilos.indicador,
                { backgroundColor: colores.sobreFichaActiva },
              ]}
              testID="chip-seleccionado-indicador"
            />
          )}
          <Text
            style={[
              tipografia.pequeno,
              {
                color: seleccionado ? colores.sobreFichaActiva : colores.tinta,
              },
            ]}
          >
            {etiqueta}
          </Text>
        </Pressable>
      </Animated.View>
    </Rebote>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radios.pildora,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    overflow: 'hidden',
    paddingHorizontal: espacios.dieciseis,
  },
  deshabilitado: { opacity: 0.45 },
  envoltura: { alignSelf: 'flex-start' },
  fondoBarro: { borderRadius: radios.pildora },
  indicador: {
    borderRadius: radios.pildora,
    height: espacios.doce,
    width: espacios.cuatro,
  },
  presionado: {
    opacity: 0.9,
    transform: [{ scale: movimiento.escalaPresion }],
  },
});
