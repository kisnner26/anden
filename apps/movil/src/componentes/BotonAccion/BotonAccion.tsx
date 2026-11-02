import { LinearGradient } from 'expo-linear-gradient';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono, type NombreIcono } from '@/componentes/Icono';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBotonAccion {
  alPresionar: () => void;
  deshabilitado?: boolean;
  etiqueta: string;
  /** ícono dentro del círculo negro de la derecha */
  icono?: NombreIcono;
}

/** el botón ámbar de la pantalla: píldora con degradado y un círculo negro a la derecha; solo hay uno por pantalla */
export function BotonAccion({
  alPresionar,
  deshabilitado = false,
  etiqueta,
  icono = 'siguiente',
}: PropiedadesBotonAccion) {
  const { colores } = useTema();

  function presionar() {
    void impactAsync(ImpactFeedbackStyle.Light);
    alPresionar();
  }

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={presionar}
      style={({ pressed }) => [
        estilos.contenedor,
        { opacity: deshabilitado ? 0.5 : pressed ? 0.9 : 1 },
      ]}
    >
      <LinearGradient
        colors={[colores.ambar, colores.ambarProfundo]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={estilos.degradado}
      >
        <Text style={[tipografia.subtitulo, { color: colores.sobreAmbar }]}>
          {etiqueta}
        </Text>
        <LinearGradient
          colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={estilos.circulo}
        >
          <View>
            <Icono color={colores.sobreNegro} nombre={icono} tamano="grande" />
          </View>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  contenedor: { borderRadius: radios.pildora, overflow: 'hidden' },
  degradado: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'space-between',
    paddingLeft: espacios.veinticuatro,
    paddingRight: 7,
  },
});
