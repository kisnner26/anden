import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Chip } from '@/componentes/Chip';
import { Icono } from '@/componentes/Icono';
import { OrbeIA } from '@/componentes/OrbeIA';
import { useIA } from '@/datos/useIA';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesBarraPreguntaIA {
  /** lleva la pregunta al asistente, que la responde con los datos reales */
  alPreguntar: (pregunta: string) => void;
  /** preguntas listas para tocar, armadas con lo que hay en pantalla */
  sugerencias: readonly string[];
}

/**
 * un campo para preguntarle al asistente desde donde estás, con preguntas sugeridas; no aparece si la
 * IA del teléfono no está activada o disponible
 */
export function BarraPreguntaIA({
  alPreguntar,
  sugerencias,
}: PropiedadesBarraPreguntaIA) {
  const { colores } = useTema();
  const { nombre, usable } = useIA();
  const [texto, establecerTexto] = useState('');
  if (!usable) return null;

  function enviar(pregunta: string) {
    const limpia = pregunta.trim();
    if (limpia === '') return;
    void impactAsync(ImpactFeedbackStyle.Light);
    establecerTexto('');
    alPreguntar(limpia);
  }

  return (
    <View style={estilos.contenedor} testID="barra-pregunta-ia">
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {rellenar(t('preguntaIA.titulo'), { nombre })}
      </Text>
      <Bloque estiloContenido={estilos.fila} hundido radio="pildora">
        <OrbeIA tamano={30} />
        <TextInput
          accessibilityLabel={t('preguntaIA.campo')}
          blurOnSubmit
          onChangeText={establecerTexto}
          onSubmitEditing={() => enviar(texto)}
          placeholder={t('preguntaIA.marcador')}
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
        <Pressable
          accessibilityLabel={t('preguntaIA.enviar')}
          accessibilityRole="button"
          accessibilityState={{ disabled: texto.trim() === '' }}
          disabled={texto.trim() === ''}
          onPress={() => enviar(texto)}
          style={{ opacity: texto.trim() === '' ? 0.4 : 1 }}
        >
          <Icono
            color={colores.ambarTexto}
            nombre="siguiente"
            tamano="mediano"
          />
        </Pressable>
      </Bloque>
      <View style={estilos.sugerencias}>
        {sugerencias.map((pregunta) => (
          <Chip
            alCambiar={() => enviar(pregunta)}
            etiqueta={pregunta}
            key={pregunta}
          />
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacios.ocho },
  entrada: { flex: 1, minHeight: 52, paddingVertical: espacios.doce },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.doce,
  },
  sugerencias: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
});
