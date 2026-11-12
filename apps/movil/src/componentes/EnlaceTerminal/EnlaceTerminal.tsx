import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { abrirIndicacionesAppleMaps, type LugarMapa } from '@/datos/mapas';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesEnlaceTerminal {
  terminal: LugarMapa;
}

/** terminal de salida con acceso a Apple Maps: el teléfono pide la ubicación por su cuenta, la app nunca la lee */
export function EnlaceTerminal({ terminal }: PropiedadesEnlaceTerminal) {
  const { colores } = useTema();
  const [fallo, establecerFallo] = useState(false);

  const abrir = async () => {
    void impactAsync(ImpactFeedbackStyle.Light);
    establecerFallo(false);
    const abierto = await abrirIndicacionesAppleMaps(terminal);
    if (!abierto) establecerFallo(true);
  };

  return (
    <View>
      <Pressable
        accessibilityHint={t('viajar.comoLlegarAyuda').replace(
          '{{terminal}}',
          terminal.nombre,
        )}
        accessibilityLabel={`${t('viajar.comoLlegar')}, ${terminal.nombre}`}
        accessibilityRole="link"
        onPress={abrir}
        style={({ pressed }) => pressed && estilos.presionado}
      >
        <Bloque estiloContenido={estilos.fila} radio="pildora">
          <View style={estilos.texto}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('viajar.terminalEtiqueta')}
            </Text>
            <Text
              numberOfLines={1}
              style={[tipografia.subtitulo, { color: colores.tinta }]}
            >
              {terminal.nombre}
            </Text>
          </View>
          <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
            {t('viajar.comoLlegar')}
          </Text>
          <Loseta tamano={tamanosControl.toqueMinimo} variante="negra">
            <Icono
              color={colores.sobreNegro}
              nombre="siguiente"
              tamano="grande"
            />
          </Loseta>
        </Bloque>
      </Pressable>
      {fallo ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.cancelado }]}
        >
          {t('viajar.mapasNoAbrio')}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingVertical: espacios.doce,
    paddingLeft: 20,
    paddingRight: espacios.doce,
  },
  presionado: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  texto: { flex: 1 },
});
