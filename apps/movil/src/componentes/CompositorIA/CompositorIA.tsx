import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { OrbeIA, type EstadoOrbe } from '@/componentes/OrbeIA';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesCompositorIA {
  alCambiar: (texto: string) => void;
  alEnviar: () => void;
  alHablar: () => void;
  deshabilitado?: boolean;
  estado: EstadoOrbe;
  nivel: Animated.Value;
  texto: string;
}

/** la barra de abajo: el orbe para hablar, el campo para escribir y el botón de enviar */
export function CompositorIA({
  alCambiar,
  alEnviar,
  alHablar,
  deshabilitado = false,
  estado,
  nivel,
  texto,
}: PropiedadesCompositorIA) {
  const { colores } = useTema();
  const puedeEnviar = texto.trim() !== '' && !deshabilitado;

  return (
    <View style={estilos.barra}>
      <OrbeIA
        alPresionar={alHablar}
        estado={estado}
        etiquetaAccesible={
          estado === 'escuchando' ? t('ia.detener') : t('ia.hablar')
        }
        nivel={nivel}
        tamano={tamanosControl.toqueMinimo + 8}
      />
      <Bloque
        estilo={estilos.campo}
        estiloContenido={estilos.campoContenido}
        hundido
        radio="pildora"
      >
        <TextInput
          accessibilityLabel={t('asistenteRico.escribir')}
          blurOnSubmit={false}
          onChangeText={alCambiar}
          onSubmitEditing={() => puedeEnviar && alEnviar()}
          placeholder={t('asistenteRico.escribir')}
          placeholderTextColor={colores.tintaSuave}
          returnKeyType="send"
          selectionColor={colores.ambarTexto}
          style={[
            estilos.entrada,
            {
              color: colores.tinta,
              fontFamily: tipografia.cuerpo.fontFamily,
              fontSize: tipografia.cuerpo.fontSize,
            },
          ]}
          value={texto}
        />
      </Bloque>
      <Pressable
        accessibilityLabel={t('asistenteRico.enviar')}
        accessibilityRole="button"
        accessibilityState={{ disabled: !puedeEnviar }}
        disabled={!puedeEnviar}
        onPress={() => {
          void impactAsync(ImpactFeedbackStyle.Light);
          alEnviar();
        }}
        style={({ pressed }) => [
          estilos.enviar,
          { backgroundColor: colores.ambar, opacity: puedeEnviar ? 1 : 0.4 },
          pressed && estilos.presionado,
        ]}
      >
        <Icono color={colores.sobreAmbar} nombre="siguiente" tamano="mediano" />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.lateral,
    paddingVertical: espacios.ocho,
  },
  campo: { flex: 1 },
  campoContenido: { paddingHorizontal: espacios.dieciseis },
  enviar: {
    alignItems: 'center',
    borderRadius: 999,
    height: tamanosControl.toqueMinimo + 4,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo + 4,
  },
  entrada: { minHeight: 52, paddingVertical: espacios.doce },
  presionado: { transform: [{ scale: 0.95 }] },
});
