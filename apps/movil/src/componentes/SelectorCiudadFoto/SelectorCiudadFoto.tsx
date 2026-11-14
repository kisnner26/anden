import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { FotoDestino } from '@/componentes/FotoDestino';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface OpcionCiudad<T extends string> {
  clave: T;
  etiqueta: string;
}

export interface PropiedadesSelectorCiudadFoto<T extends string> {
  alCambiar: (clave: T) => void;
  opciones: readonly OpcionCiudad<T>[];
  valor: T;
}

function Tarjeta<T extends string>({
  activa,
  alElegir,
  opcion,
}: {
  activa: boolean;
  alElegir: (clave: T) => void;
  opcion: OpcionCiudad<T>;
}) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const escala = useRef(new Animated.Value(activa ? 1 : 0.95)).current;

  useEffect(() => {
    if (reducido) {
      escala.setValue(activa ? 1 : 0.95);
      return;
    }
    Animated.spring(escala, {
      friction: 6,
      tension: 120,
      toValue: activa ? 1 : 0.95,
      useNativeDriver: true,
    }).start();
  }, [activa, escala, reducido]);

  return (
    <Animated.View
      style={[estilos.tarjeta, { transform: [{ scale: escala }] }]}
    >
      <Pressable
        accessibilityLabel={opcion.etiqueta}
        accessibilityRole="tab"
        accessibilityState={{ selected: activa }}
        onPress={() => {
          void impactAsync(ImpactFeedbackStyle.Light);
          alElegir(opcion.clave);
        }}
        style={[
          estilos.marco,
          {
            borderColor: activa ? colores.ambar : 'transparent',
            opacity: activa ? 1 : 0.72,
          },
        ]}
      >
        <FotoDestino
          destino={opcion.etiqueta}
          estilo={estilos.foto}
          radio="tarjeta"
        >
          <View style={estilos.texto}>
            <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
              {opcion.etiqueta}
            </Text>
          </View>
        </FotoDestino>
      </Pressable>
    </Animated.View>
  );
}

/** elegir la ciudad con su foto: la elegida se acerca y se enmarca en ámbar, la otra se aleja un poco */
export function SelectorCiudadFoto<T extends string>({
  alCambiar,
  opciones,
  valor,
}: PropiedadesSelectorCiudadFoto<T>) {
  return (
    <View accessibilityRole="tablist" style={estilos.fila}>
      {opciones.map((opcion) => (
        <Tarjeta
          activa={opcion.clave === valor}
          alElegir={alCambiar}
          key={opcion.clave}
          opcion={opcion}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: espacios.doce },
  foto: { height: 112, justifyContent: 'flex-end' },
  marco: {
    borderRadius: radios.tarjeta + 4,
    borderWidth: 2,
    padding: 2,
  },
  tarjeta: { flex: 1 },
  texto: { padding: espacios.doce },
});
