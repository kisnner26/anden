import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Humor } from '@/datos/mascota';
import { conAlfa } from '@/tema/alfa';
import { paletaAutobus } from '@/tema/colores';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

const OjoAnimado = Animated.createAnimatedComponent(Ellipse);

export interface PropiedadesMascotaRumbo {
  humor?: Humor;
  /** cada vez que sube este número, la mascota pega un brinco: es la respuesta a que la toquen */
  salto?: number;
  tamano?: number;
}

/** hacia dónde miran las pupilas en cada ánimo */
const MIRADA: Record<Humor, { x: number; y: number }> = {
  alerta: { x: 0, y: -1 },
  celebrando: { x: 0, y: -2 },
  dormido: { x: 0, y: 0 },
  feliz: { x: 0, y: 0 },
  pensando: { x: 3, y: -3 },
  saludando: { x: 2, y: 0 },
};

/** la boca de cada ánimo, dibujada en el frente del bus */
function Boca({ color, humor }: { color: string; humor: Humor }) {
  switch (humor) {
    case 'alerta':
      return <Ellipse cx={60} cy={69} fill={color} rx={5} ry={6} />;
    case 'celebrando':
      return <Path d="M46 63 Q60 82 74 63 Z" fill={color} />;
    case 'dormido':
      return (
        <Line
          stroke={color}
          strokeLinecap="round"
          strokeWidth={3}
          x1={52}
          x2={68}
          y1={68}
          y2={68}
        />
      );
    case 'pensando':
      return (
        <Path
          d="M52 69 Q58 66 68 68"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={3}
        />
      );
    default:
      return (
        <Path
          d="M48 65 Q60 76 72 65"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={3.5}
        />
      );
  }
}

/**
 * Rumbo, la mascota de Andén: un microbús ámbar con la cara en el parabrisas. Respira, parpadea, y según su
 * ánimo cambia la boca, la mirada y el movimiento: saluda moviéndose de lado, celebra saltando, se duerme
 */
export function MascotaRumbo({
  humor = 'feliz',
  salto = 0,
  tamano = 96,
}: PropiedadesMascotaRumbo) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const flote = useRef(new Animated.Value(0)).current;
  const parpadeo = useRef(new Animated.Value(1)).current;
  const gesto = useRef(new Animated.Value(0)).current;
  const brinco = useRef(new Animated.Value(0)).current;
  const primerSalto = useRef(salto);
  // a dónde mira cuando está tranquila: mueve los ojos de un lado a otro como quien curiosea
  const [curioseo, establecerCurioseo] = useState({ x: 0, y: 0 });

  // respira siempre, un poco arriba y un poco abajo
  useEffect(() => {
    if (reducido) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(flote, {
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(flote, {
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [flote, reducido]);

  // parpadea cada tanto, salvo dormido
  useEffect(() => {
    if (reducido || humor === 'dormido') {
      parpadeo.setValue(humor === 'dormido' ? 0.08 : 1);
      return;
    }
    parpadeo.setValue(1);
    let activo = true;
    let espera: ReturnType<typeof setTimeout>;
    // parpadea sin ritmo fijo, y a veces dos veces seguidas, como hace uno de verdad
    const parpadear = () => {
      const cierre = Animated.sequence([
        Animated.timing(parpadeo, {
          duration: 80,
          toValue: 0.08,
          useNativeDriver: false,
        }),
        Animated.timing(parpadeo, {
          duration: 110,
          toValue: 1,
          useNativeDriver: false,
        }),
      ]);
      cierre.start(() => {
        if (!activo) return;
        const doble = Math.random() < 0.25;
        espera = setTimeout(
          parpadear,
          doble ? 160 : 1800 + Math.random() * 3200,
        );
      });
    };
    espera = setTimeout(parpadear, 1200 + Math.random() * 2000);
    return () => {
      activo = false;
      clearTimeout(espera);
    };
  }, [humor, parpadeo, reducido]);

  // mira a los lados cada tanto cuando está de buen humor
  useEffect(() => {
    if (reducido || humor !== 'feliz') {
      establecerCurioseo({ x: 0, y: 0 });
      return;
    }
    const puntos = [
      { x: -3, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: -2 },
      { x: 3, y: -2 },
      { x: -3, y: 1 },
      { x: 0, y: 0 },
    ];
    let activo = true;
    let espera: ReturnType<typeof setTimeout>;
    const mirar = () => {
      establecerCurioseo(puntos[Math.floor(Math.random() * puntos.length)]!);
      if (activo) espera = setTimeout(mirar, 1500 + Math.random() * 3000);
    };
    espera = setTimeout(mirar, 1500);
    return () => {
      activo = false;
      clearTimeout(espera);
    };
  }, [humor, reducido]);

  // el brinco cuando la tocan: sube rápido, se estira, cae y rebota
  useEffect(() => {
    if (salto === primerSalto.current || reducido) return;
    primerSalto.current = salto;
    brinco.setValue(0);
    Animated.sequence([
      Animated.timing(brinco, {
        duration: 150,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(brinco, {
        friction: 3,
        tension: 200,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [brinco, reducido, salto]);

  // el gesto propio de cada ánimo: saludar de lado, saltar de alegría, un respingo de alerta
  useEffect(() => {
    gesto.setValue(0);
    if (
      reducido ||
      humor === 'feliz' ||
      humor === 'dormido' ||
      humor === 'pensando'
    )
      return;
    const duracion = humor === 'celebrando' ? 380 : 260;
    const repeticiones = humor === 'alerta' ? 6 : 14;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(gesto, {
          duration: duracion,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(gesto, {
          duration: duracion,
          easing: Easing.inOut(Easing.quad),
          toValue: -1,
          useNativeDriver: true,
        }),
      ]),
      { iterations: repeticiones },
    );
    bucle.start(() => gesto.setValue(0));
    return () => bucle.stop();
  }, [gesto, humor, reducido]);

  const cuerpo = paletaAutobus;
  const base = MIRADA[humor];
  const mirada =
    humor === 'feliz'
      ? { x: base.x + curioseo.x, y: base.y + curioseo.y }
      : base;
  const ojoAbierto = humor === 'celebrando' ? 7 : 9;
  const tinta = colores.bloqueNegro;
  const dormido = humor === 'dormido';

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        height: tamano * 0.86,
        transform: [
          {
            translateY: flote.interpolate({
              inputRange: [0, 1],
              outputRange: [2, -3],
            }),
          },
          {
            translateY: brinco.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -tamano * 0.3],
            }),
          },
          {
            scaleY: brinco.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          },
          {
            translateY: gesto.interpolate({
              inputRange: [-1, 0, 1],
              outputRange:
                humor === 'celebrando' ? [0, 0, -tamano * 0.14] : [0, 0, 0],
            }),
          },
          {
            rotate: gesto.interpolate({
              inputRange: [-1, 1],
              outputRange:
                humor === 'saludando'
                  ? ['-9deg', '9deg']
                  : humor === 'alerta'
                    ? ['-4deg', '4deg']
                    : ['-3deg', '3deg'],
            }),
          },
        ],
        width: tamano,
      }}
      testID={`mascota-rumbo-${humor}`}
    >
      <Svg height={tamano * 0.86} viewBox="0 0 120 103" width={tamano}>
        <Ellipse cx={60} cy={99} fill={conAlfa(tinta, 0.16)} rx={44} ry={4} />
        {/* la bocina de arriba, que da nombre a Rumbo */}
        <Rect
          fill={colores.ambarProfundo}
          height={7}
          rx={3}
          width={22}
          x={49}
          y={8}
        />
        <Path d="M71 11 L82 6 L82 18 L71 15 Z" fill={tinta} />
        {humor === 'alerta' && (
          <G
            stroke={colores.ambarProfundo}
            strokeLinecap="round"
            strokeWidth={3}
          >
            <Line x1={88} x2={97} y1={8} y2={4} />
            <Line x1={89} x2={100} y1={13} y2={13} />
            <Line x1={88} x2={97} y1={18} y2={22} />
          </G>
        )}
        {/* el cuerpo */}
        <Rect
          fill={colores.ambar}
          height={66}
          rx={18}
          stroke={colores.ambarProfundo}
          strokeWidth={3}
          width={104}
          x={8}
          y={14}
        />
        <Rect
          fill={colores.ambarProfundo}
          height={5}
          opacity={0.55}
          rx={2.5}
          width={88}
          x={16}
          y={60}
        />
        {/* el parabrisas con la cara */}
        <Rect fill={tinta} height={34} rx={12} width={86} x={17} y={22} />
        <Rect
          fill={conAlfa(colores.sobreNegro, 0.14)}
          height={5}
          rx={2.5}
          width={34}
          x={24}
          y={26}
        />
        {/* ojos */}
        <Circle cx={44} cy={39} fill={colores.sobreNegro} r={ojoAbierto} />
        <Circle cx={76} cy={39} fill={colores.sobreNegro} r={ojoAbierto} />
        {!dormido && (
          <>
            <OjoAnimado
              cx={44 + mirada.x}
              cy={39 + mirada.y}
              fill={tinta}
              rx={4.2}
              ry={parpadeo.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 4.8],
              })}
            />
            <OjoAnimado
              cx={76 + mirada.x}
              cy={39 + mirada.y}
              fill={tinta}
              rx={4.2}
              ry={parpadeo.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 4.8],
              })}
            />
          </>
        )}
        {dormido && (
          <G stroke={tinta} strokeLinecap="round" strokeWidth={3}>
            <Line x1={37} x2={51} y1={39} y2={39} />
            <Line x1={69} x2={83} y1={39} y2={39} />
          </G>
        )}
        {humor === 'alerta' && (
          <G stroke={colores.sobreNegro} strokeLinecap="round" strokeWidth={3}>
            <Line x1={36} x2={50} y1={27} y2={31} />
            <Line x1={84} x2={70} y1={27} y2={31} />
          </G>
        )}
        {humor === 'pensando' && (
          <Line
            stroke={colores.sobreNegro}
            strokeLinecap="round"
            strokeWidth={3}
            x1={68}
            x2={84}
            y1={26}
            y2={23}
          />
        )}
        {/* mejillas, boca y luces */}
        <Circle cx={28} cy={60} fill={conAlfa(colores.cancelado, 0.45)} r={5} />
        <Circle cx={92} cy={60} fill={conAlfa(colores.cancelado, 0.45)} r={5} />
        <Boca color={tinta} humor={humor} />
        <Circle
          cx={22}
          cy={71}
          fill={cuerpo.faro}
          r={5}
          stroke={cuerpo.faroBorde}
          strokeWidth={1.5}
        />
        <Circle
          cx={98}
          cy={71}
          fill={cuerpo.faro}
          r={5}
          stroke={cuerpo.faroBorde}
          strokeWidth={1.5}
        />
        {/* las ruedas */}
        <Circle cx={34} cy={82} fill={cuerpo.rueda} r={11} />
        <Circle cx={34} cy={82} fill={cuerpo.ruedaCentro} r={4.5} />
        <Circle cx={86} cy={82} fill={cuerpo.rueda} r={11} />
        <Circle cx={86} cy={82} fill={cuerpo.ruedaCentro} r={4.5} />
      </Svg>
    </Animated.View>
  );
}
