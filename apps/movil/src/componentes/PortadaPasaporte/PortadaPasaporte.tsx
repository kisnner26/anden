import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { BrilloQueBarre } from '@/componentes/BrilloQueBarre';
import { conAlfa } from '@/tema/alfa';
import { paletaPasaporte as p } from '@/tema/colores';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { t } from '@/textos/t';

export interface PropiedadesPortadaPasaporte {
  abierta: boolean;
  alAbrir: () => void;
  alto: number;
  ancho: number;
}

/** el emblema de la tapa: un globo con meridianos, el camino que se pierde en el horizonte y el sol saliendo */
function Emblema({ tamano }: { tamano: number }) {
  return (
    <Svg height={tamano} viewBox="0 0 120 120" width={tamano}>
      <G fill="none" stroke={p.oro} strokeLinecap="round">
        <Circle cx={60} cy={60} r={52} strokeWidth={2.4} />
        <Circle cx={60} cy={60} r={46} strokeWidth={0.9} />
        <Ellipse cx={60} cy={60} rx={22} ry={52} strokeWidth={0.8} />
        <Ellipse cx={60} cy={60} rx={40} ry={52} strokeWidth={0.8} />
        <Line strokeWidth={0.8} x1={8} x2={112} y1={60} y2={60} />
        <Path d="M60 66 L40 104 M60 66 L80 104" strokeWidth={2} />
        <Path d="M60 74 L52 104 M60 74 L68 104" strokeWidth={0.9} />
        <Path d="M42 60 A18 18 0 0 1 78 60" strokeWidth={2} />
        <Path
          d="M60 34 V28 M44 40 L40 35 M76 40 L80 35 M34 54 H28 M86 54 H92"
          strokeWidth={1.6}
        />
      </G>
    </Svg>
  );
}

/**
 * la tapa de cuero del pasaporte, con letras doradas y un destello de lámina; al abrirla gira sobre su lomo, a la
 * izquierda, y deja ver la página de datos. Sin movimiento no se dibuja: el pasaporte ya está abierto
 */
export function PortadaPasaporte({
  abierta,
  alAbrir,
  alto,
  ancho,
}: PropiedadesPortadaPasaporte) {
  const reducido = useMovimientoReducido();
  const giro = useRef(new Animated.Value(abierta ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) {
      giro.setValue(abierta ? 1 : 0);
      return;
    }
    Animated.timing(giro, {
      duration: movimiento.aperturaPasaporte,
      toValue: abierta ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [abierta, giro, reducido]);

  if (reducido && abierta) return null;
  return (
    <Animated.View
      pointerEvents={abierta ? 'none' : 'auto'}
      style={[
        estilos.tapa,
        {
          height: alto,
          opacity: giro.interpolate({
            inputRange: [0, 0.5, 0.56, 1],
            outputRange: [1, 1, 0, 0],
          }),
          transform: [
            { perspective: 1400 },
            { translateX: -ancho / 2 },
            {
              rotateY: giro.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-165deg'],
              }),
            },
            { translateX: ancho / 2 },
          ],
          width: ancho,
        },
      ]}
      testID="portada-pasaporte"
    >
      <Pressable
        accessibilityHint={t('pasaporte.portada.abrirAyuda')}
        accessibilityLabel={t('pasaporte.portada.abrir')}
        accessibilityRole="button"
        onPress={alAbrir}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[p.cueroClaro, p.cueroOscuro]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={estilos.cuero}
        >
          <View style={[estilos.marco, { borderColor: conAlfa(p.oro, 0.7) }]} />
          <View
            style={[estilos.marcoFino, { borderColor: conAlfa(p.oro, 0.35) }]}
          />
          <View style={[estilos.lomo, { backgroundColor: p.cueroOscuro }]} />
          <Text style={[estilos.pais, { color: p.oro }]}>
            {t('pasaporte.portada.pais')}
          </Text>
          <Emblema tamano={Math.round(ancho * 0.38)} />
          <View style={estilos.titulares}>
            <Text
              style={[tipografia.display, estilos.titulo, { color: p.oro }]}
            >
              {t('pasaporte.portada.titulo')}
            </Text>
            <Text style={[tipografia.etiqueta, { color: p.oroClaro }]}>
              {t('pasaporte.portada.subtitulo')}
            </Text>
          </View>
          <View style={estilos.pie}>
            <Svg height={26} viewBox="0 0 40 26" width={40}>
              <Rect
                fill="none"
                height={22}
                rx={5}
                stroke={p.oro}
                strokeWidth={1.4}
                width={34}
                x={3}
                y={2}
              />
              <Circle
                cx={20}
                cy={13}
                fill="none"
                r={5}
                stroke={p.oro}
                strokeWidth={1.4}
              />
            </Svg>
            <Text style={[tipografia.etiqueta, { color: p.oroClaro }]}>
              {t('pasaporte.portada.abrir')}
            </Text>
          </View>
          <BrilloQueBarre pausa={2200} retardo={900} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  cuero: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    gap: espacios.veinticuatro,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: espacios.veinticuatro,
  },
  lomo: {
    bottom: 0,
    left: 0,
    opacity: 0.55,
    position: 'absolute',
    top: 0,
    width: 10,
  },
  marco: {
    borderRadius: 12,
    borderWidth: 1.5,
    bottom: 14,
    left: 18,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  marcoFino: {
    borderRadius: 8,
    borderWidth: 1,
    bottom: 22,
    left: 26,
    position: 'absolute',
    right: 22,
    top: 22,
  },
  pais: { ...tipografia.etiqueta, letterSpacing: 4, textAlign: 'center' },
  pie: { alignItems: 'center', gap: espacios.ocho },
  tapa: {
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  titulares: { alignItems: 'center', gap: espacios.ocho },
  titulo: {
    letterSpacing: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
