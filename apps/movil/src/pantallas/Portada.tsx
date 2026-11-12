import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient as DegradadoSvg,
  Path,
  Stop,
  Text as TextoSvg,
} from 'react-native-svg';

import { Autobus } from '@/componentes/Autobus';
import { DeslizarParaEmpezar } from '@/componentes/DeslizarParaEmpezar';
import { HumoEscape } from '@/componentes/HumoEscape';
import { liberarSonidos, reproducirSonido } from '@/datos/sonidos';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesPortada {
  alEmpezar: () => void;
}

/** la primera pantalla: el nombre gigante detrás del bus de personaje */
export function Portada({ alEmpezar }: PropiedadesPortada) {
  const { colores } = useTema();
  const { height, width } = useWindowDimensions();
  const margenes = useSafeAreaInsets();
  const altoMarca = 150;
  const topMarca = height * 0.335;
  const reducirMovimiento = useMovimientoReducido();
  const [saliendo, establecerSaliendo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posicionBus = useSharedValue(reducirMovimiento ? 0 : -(width + 40));
  const vaiven = useSharedValue(0);
  const marcaVisible = useSharedValue(reducirMovimiento ? 1 : 0);
  const escala = width / 520;

  useEffect(() => {
    if (reducirMovimiento) return undefined;
    void reproducirSonido('arranque');
    posicionBus.value = withTiming(0, {
      duration: movimiento.llegadaBus,
      easing: Easing.out(Easing.cubic),
    });
    marcaVisible.value = withDelay(
      movimiento.llegadaBus * 0.35,
      withTiming(1, {
        duration: movimiento.revelarMarca,
        easing: Easing.out(Easing.cubic),
      }),
    );
    vaiven.value = withDelay(
      movimiento.llegadaBus,
      withRepeat(
        withSequence(
          withTiming(1, { duration: movimiento.vaivenBus / 2 }),
          withTiming(0, { duration: movimiento.vaivenBus / 2 }),
        ),
        -1,
        false,
      ),
    );
    return undefined;
  }, [marcaVisible, posicionBus, reducirMovimiento, vaiven]);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
      liberarSonidos();
    },
    [],
  );

  const empezar = () => {
    if (saliendo) return;
    establecerSaliendo(true);
    if (reducirMovimiento) {
      alEmpezar();
      return;
    }
    void reproducirSonido('bocina');
    temporizador.current = setTimeout(() => {
      void reproducirSonido('salida');
      posicionBus.value = withTiming(width + 60, {
        duration: movimiento.salidaBus,
        easing: Easing.in(Easing.cubic),
      });
      temporizador.current = setTimeout(alEmpezar, movimiento.salidaBus * 0.8);
    }, 420);
  };

  const estiloBus = useAnimatedStyle(() => ({
    transform: [
      { translateX: posicionBus.value },
      { translateY: -vaiven.value * 2.5 },
      { rotate: `${vaiven.value * -0.35}deg` },
    ],
  }));
  const estiloMarca = useAnimatedStyle(() => ({
    opacity: marcaVisible.value,
    transform: [{ translateY: (1 - marcaVisible.value) * 28 }],
  }));

  return (
    <View style={estilos.pantalla}>
      <LinearGradient
        colors={[colores.fondo, colores.fondoProfundo]}
        style={StyleSheet.absoluteFill}
      />
      <Svg height={height * 0.4} style={estilos.ruta} width={width}>
        <Path
          d={`M-20 ${height * 0.2} C ${width * 0.18} ${height * 0.1}, ${width * 0.4} ${height * 0.2}, ${width * 0.6} ${height * 0.12} S ${width * 0.9} ${height * 0.05}, ${width * 1.1} ${height * 0.01}`}
          fill="none"
          stroke={colores.linea}
          strokeLinecap="round"
          strokeWidth={3}
          strokeDasharray="1 11"
        />
        {[
          [width * 0.19, height * 0.14],
          [width * 0.59, height * 0.12],
          [width * 0.86, height * 0.07],
        ].map(([x, y]) => (
          <Circle
            cx={x}
            cy={y}
            fill={colores.fondo}
            key={`${x}${y}`}
            r={7}
            stroke={colores.linea}
            strokeWidth={2.5}
          />
        ))}
      </Svg>

      <View style={[estilos.lema, { top: margenes.top + 40 }]}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('portada.lugar')}
        </Text>
        <Text
          style={[
            tipografia.subtitulo,
            tipografia.lema,
            estilos.textoLema,
            { color: colores.tinta },
          ]}
        >
          {t('portada.lema')}
        </Text>
      </View>

      <Animated.View style={[estilos.marca, { top: topMarca }, estiloMarca]}>
        <Svg height={altoMarca} width={width}>
          <Defs>
            <DegradadoSvg id="marca" x1="0" x2="0" y1="0" y2="1">
              <Stop offset={0} stopColor={colores.marcaArriba} />
              <Stop offset={1} stopColor={colores.marcaAbajo} />
            </DegradadoSvg>
          </Defs>
          <TextoSvg
            fill="url(#marca)"
            fontFamily="ArchivoExtraCondensed_800ExtraBold"
            fontSize={altoMarca}
            textAnchor="middle"
            x={width / 2}
            y={altoMarca * 0.86}
          >
            {t('portada.marca')}
          </TextoSvg>
        </Svg>
      </Animated.View>

      <Animated.View style={[estilos.bus, { top: topMarca + 100 }, estiloBus]}>
        <Autobus ancho={width + 8} letrero={t('portada.marca')} />
        {reducirMovimiento ? null : (
          <View
            pointerEvents="none"
            style={{
              left: 34 * escala,
              position: 'absolute',
              top: 226 * escala,
            }}
          >
            <HumoEscape
              arranque={saliendo}
              tamano={Math.max(14, 30 * escala)}
            />
          </View>
        )}
      </Animated.View>

      <View style={[estilos.pie, { bottom: margenes.bottom + 28 }]}>
        <DeslizarParaEmpezar
          alCompletar={empezar}
          ancho={Math.min(width - 56, 340)}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  bus: { left: -4, position: 'absolute' },
  lema: { left: 28, position: 'absolute' },
  marca: { left: 0, position: 'absolute' },
  pantalla: { flex: 1, overflow: 'hidden' },
  pie: { alignItems: 'center', left: 0, position: 'absolute', right: 0 },
  ruta: { left: 0, position: 'absolute', top: 0 },
  textoLema: { marginTop: 6 },
});
