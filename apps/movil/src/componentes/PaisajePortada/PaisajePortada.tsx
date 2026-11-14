import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { conAlfa } from '@/tema/alfa';
import { useTema } from '@/tema/useTema';

export interface PropiedadesPaisajePortada {
  alto: number;
  ancho: number;
  /** con el inicio automático todo ocurre más rápido */
  rapido?: boolean;
  reducido?: boolean;
  /** dónde queda el nombre gigante: de ahí cuelgan el sol y el camino */
  yMarca: number;
}

/** una nube que cruza despacio la pantalla de lado a lado y vuelve a entrar por el otro */
function Nube({
  ancho,
  demora,
  duracion,
  reducido,
  tamano,
  y,
}: {
  ancho: number;
  demora: number;
  duracion: number;
  reducido: boolean;
  tamano: number;
  y: number;
}) {
  const { colores } = useTema();
  const avance = useSharedValue(reducido ? 0.4 : 0);
  useEffect(() => {
    if (reducido) return;
    avance.value = withDelay(
      demora,
      withRepeat(
        withTiming(1, { duration: duracion, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [avance, demora, duracion, reducido]);
  const estilo = useAnimatedStyle(() => ({
    transform: [
      { translateX: -tamano * 2 + avance.value * (ancho + tamano * 4) },
    ],
  }));
  return (
    <Animated.View style={[estilos.nube, { top: y }, estilo]}>
      <Svg height={tamano * 0.7} width={tamano * 2}>
        <Ellipse
          cx={tamano}
          cy={tamano * 0.46}
          fill={conAlfa(colores.tintaSuave, 0.13)}
          rx={tamano * 0.95}
          ry={tamano * 0.22}
        />
        <Ellipse
          cx={tamano * 0.8}
          cy={tamano * 0.3}
          fill={conAlfa(colores.tintaSuave, 0.13)}
          rx={tamano * 0.42}
          ry={tamano * 0.26}
        />
        <Ellipse
          cx={tamano * 1.2}
          cy={tamano * 0.34}
          fill={conAlfa(colores.tintaSuave, 0.13)}
          rx={tamano * 0.36}
          ry={tamano * 0.22}
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * el paisaje de la portada: un sol que sale detrás del nombre, dos capas de colinas, nubes que pasan y un camino con
 * rayas que corren, como si el bus ya estuviera andando. Todo con los colores del tema
 */
export function PaisajePortada({
  alto,
  ancho,
  rapido = false,
  reducido = false,
  yMarca,
}: PropiedadesPaisajePortada) {
  const { colores } = useTema();
  const sol = useSharedValue(reducido ? 1 : 0);
  const camino = useSharedValue(0);
  const yCamino = yMarca + 100 + (ancho / 520) * 268;

  useEffect(() => {
    if (reducido) return;
    sol.value = withDelay(
      rapido ? 50 : 250,
      withTiming(1, {
        duration: rapido ? 500 : 1100,
        easing: Easing.out(Easing.cubic),
      }),
    );
    camino.value = withRepeat(
      withTiming(1, { duration: rapido ? 500 : 900, easing: Easing.linear }),
      -1,
      false,
    );
  }, [camino, rapido, reducido, sol]);

  const estiloSol = useAnimatedStyle(() => ({
    opacity: sol.value,
    transform: [
      { translateY: (1 - sol.value) * 70 },
      { scale: 0.85 + sol.value * 0.15 },
    ],
  }));
  const estiloRayas = useAnimatedStyle(() => ({
    transform: [{ translateX: -camino.value * 56 }],
  }));

  const radioSol = ancho * 0.3;
  const cimaColinaLejana = yMarca + 118;
  const cimaColinaCercana = yMarca + 160;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          estilos.sol,
          {
            height: radioSol * 2,
            left: ancho * 0.74 - radioSol,
            top: yMarca - radioSol * 0.35,
            width: radioSol * 2,
          },
          estiloSol,
        ]}
      >
        <Svg height={radioSol * 2} width={radioSol * 2}>
          <Defs>
            <RadialGradient cx="50%" cy="50%" id="sol" r="50%">
              <Stop offset="0" stopColor={colores.ambar} stopOpacity={0.5} />
              <Stop
                offset="0.55"
                stopColor={colores.ambar}
                stopOpacity={0.16}
              />
              <Stop offset="1" stopColor={colores.ambar} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={radioSol} cy={radioSol} fill="url(#sol)" r={radioSol} />
          <Circle
            cx={radioSol}
            cy={radioSol}
            fill={conAlfa(colores.ambar, 0.55)}
            r={radioSol * 0.2}
          />
        </Svg>
      </Animated.View>

      <Nube
        ancho={ancho}
        demora={0}
        duracion={46_000}
        reducido={reducido}
        tamano={70}
        y={yMarca - 70}
      />
      <Nube
        ancho={ancho}
        demora={9_000}
        duracion={62_000}
        reducido={reducido}
        tamano={48}
        y={yMarca + 6}
      />

      <Svg height={alto} style={StyleSheet.absoluteFill} width={ancho}>
        <Path
          d={`M0 ${cimaColinaLejana + 26} C ${ancho * 0.18} ${cimaColinaLejana - 30}, ${ancho * 0.38} ${cimaColinaLejana + 6}, ${ancho * 0.58} ${cimaColinaLejana - 22} S ${ancho * 0.92} ${cimaColinaLejana - 36}, ${ancho} ${cimaColinaLejana + 2} L ${ancho} ${alto} L 0 ${alto} Z`}
          fill={conAlfa(colores.linea, 0.45)}
        />
        <Path
          d={`M0 ${cimaColinaCercana} C ${ancho * 0.22} ${cimaColinaCercana - 34}, ${ancho * 0.46} ${cimaColinaCercana + 16}, ${ancho * 0.7} ${cimaColinaCercana - 14} S ${ancho * 0.95} ${cimaColinaCercana - 28}, ${ancho} ${cimaColinaCercana - 8} L ${ancho} ${alto} L 0 ${alto} Z`}
          fill={conAlfa(colores.linea, 0.8)}
        />
        <Rect
          fill={conAlfa(colores.tinta, 0.1)}
          height={46}
          width={ancho}
          x={0}
          y={yCamino}
        />
      </Svg>

      <View style={[estilos.camino, { top: yCamino + 21 }]}>
        <Animated.View style={[estilos.rayas, estiloRayas]}>
          {Array.from({ length: Math.ceil(ancho / 56) + 3 }, (_, i) => (
            <View
              key={i}
              style={[
                estilos.raya,
                { backgroundColor: conAlfa(colores.tintaSuave, 0.5) },
              ]}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  camino: {
    height: 4,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  nube: { left: 0, position: 'absolute' },
  raya: { borderRadius: 2, height: 4, marginRight: 32, width: 24 },
  rayas: { flexDirection: 'row' },
  sol: { position: 'absolute' },
});
