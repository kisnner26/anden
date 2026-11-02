import { View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as TextoSvg,
} from 'react-native-svg';

import { paletaAutobus as p } from '@/tema/colores';

const ANCHO_BASE = 520;
const ALTO_BASE = 300;

const CARROCERIA =
  'M76,52 H398 C430,52 448,64 460,90 L494,170 C500,184 502,194 502,208 V230 C502,242 494,248 482,248 H54 C40,248 32,240 32,228 V94 C32,70 48,52 76,52 Z';
const VENTANAS_X = [62, 148, 234, 320] as const;
const RUEDAS_X = [128, 396] as const;
const MAXIMO_LETRERO = 8;

export interface PropiedadesAutobus {
  ancho: number;
  /** sin etiqueta el bus es decorativo y se oculta a los lectores de pantalla */
  etiquetaAccesible?: string;
  /** destino que muestra el letrero ámbar del frente */
  letrero?: string;
}

/** el bus de personaje de Andén: carrocería crema con banda ámbar, vidrios oscuros, faro cálido y letrero */
export function Autobus({
  ancho,
  etiquetaAccesible,
  letrero = 'ANDÉN',
}: PropiedadesAutobus) {
  const alto = (ancho * ALTO_BASE) / ANCHO_BASE;
  const comunica = etiquetaAccesible !== undefined;
  const tamanoLetrero = 10.5 * Math.min(1, MAXIMO_LETRERO / letrero.length);

  return (
    <View
      accessibilityElementsHidden={!comunica}
      accessibilityLabel={etiquetaAccesible}
      accessibilityRole={comunica ? 'image' : undefined}
      accessible={comunica}
      importantForAccessibility={comunica ? 'yes' : 'no-hide-descendants'}
      style={{ height: alto, width: ancho }}
    >
      <Svg
        height={alto}
        viewBox={`0 0 ${ANCHO_BASE} ${ALTO_BASE}`}
        width={ancho}
      >
        <Defs>
          <LinearGradient id="busCarro" x1="0" x2="0.35" y1="0" y2="1">
            <Stop offset={0} stopColor={p.carroceriaClara} />
            <Stop offset={0.55} stopColor={p.carroceriaMedia} />
            <Stop offset={1} stopColor={p.carroceriaOscura} />
          </LinearGradient>
          <LinearGradient id="busBanda" x1="0" x2="0" y1="0" y2="1">
            <Stop offset={0} stopColor={p.bandaClara} />
            <Stop offset={0.5} stopColor={p.banda} />
            <Stop offset={1} stopColor={p.bandaOscura} />
          </LinearGradient>
          <LinearGradient id="busVidrio" x1="0" x2="1" y1="0" y2="1">
            <Stop offset={0} stopColor={p.vidrioClaro} />
            <Stop offset={1} stopColor={p.vidrioOscuro} />
          </LinearGradient>
          <LinearGradient id="busFalda" x1="0" x2="0" y1="0" y2="1">
            <Stop offset={0} stopColor={p.sombraSuelo} stopOpacity={0} />
            <Stop offset={1} stopColor={p.sombraSuelo} stopOpacity={0.28} />
          </LinearGradient>
          <LinearGradient id="busLlanta" x1="0" x2="1" y1="0" y2="1">
            <Stop offset={0} stopColor={p.llantaClara} />
            <Stop offset={1} stopColor={p.llantaOscura} />
          </LinearGradient>
          <RadialGradient cx="30%" cy="25%" id="busBrillo" r="60%">
            <Stop offset={0} stopColor={p.llantaClara} stopOpacity={0.75} />
            <Stop offset={1} stopColor={p.llantaClara} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="50%" id="busSuelo" r="50%">
            <Stop offset={0} stopColor={p.sombraSuelo} stopOpacity={0.4} />
            <Stop offset={1} stopColor={p.sombraSuelo} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="40%" cy="40%" id="busFaro" r="70%">
            <Stop offset={0} stopColor={p.llantaClara} />
            <Stop offset={0.45} stopColor={p.faro} />
            <Stop offset={1} stopColor={p.faroBrillo} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="50%" id="busFaroHalo" r="50%">
            <Stop offset={0} stopColor={p.faroBrillo} stopOpacity={0.5} />
            <Stop offset={1} stopColor={p.faroBrillo} stopOpacity={0} />
          </RadialGradient>
          <ClipPath id="busCarroceria">
            <Path d={CARROCERIA} />
          </ClipPath>
        </Defs>

        <Ellipse cx={268} cy={272} fill="url(#busSuelo)" rx={240} ry={18} />

        <G clipPath="url(#busCarroceria)">
          <Rect fill="url(#busCarro)" height={220} width={500} x={20} y={40} />
          <Rect fill="url(#busBanda)" height={36} width={500} x={20} y={172} />
          <Rect
            fill={p.llantaClara}
            height={5}
            opacity={0.45}
            width={500}
            x={20}
            y={172}
          />
          <Rect fill="url(#busFalda)" height={50} width={500} x={20} y={208} />
          <Ellipse cx={170} cy={76} fill="url(#busBrillo)" rx={150} ry={22} />
        </G>
        <Path
          d={CARROCERIA}
          fill="none"
          stroke={p.borde}
          strokeOpacity={0.18}
          strokeWidth={2}
        />

        {VENTANAS_X.map((x) => (
          <Rect
            fill="url(#busVidrio)"
            height={66}
            key={x}
            rx={16}
            width={74}
            x={x}
            y={86}
          />
        ))}
        <Path
          d="M408,86 H438 C450,86 458,94 464,108 L482,152 H408 Z"
          fill="url(#busVidrio)"
        />
        <Path
          d="M70,92 L104,92 L78,146 L70,146 Z M156,92 L190,92 L164,146 L156,146 Z M242,92 L276,92 L250,146 L242,146 Z M328,92 L362,92 L336,146 L328,146 Z"
          fill={p.llantaClara}
          opacity={0.1}
        />

        <Rect fill={p.rueda} height={19} rx={6} width={58} x={410} y={60} />
        <TextoSvg
          fill={p.banda}
          fontFamily="JetBrainsMono_600SemiBold"
          fontSize={tamanoLetrero}
          letterSpacing={1}
          textAnchor="middle"
          x={439}
          y={74}
        >
          {letrero}
        </TextoSvg>

        <Circle cx={486} cy={206} fill="url(#busFaroHalo)" r={28} />
        <Circle
          cx={486}
          cy={206}
          fill="url(#busFaro)"
          r={13}
          stroke={p.faroBorde}
          strokeWidth={2}
        />
        <Rect
          fill={p.paragolpes}
          height={14}
          rx={7}
          width={40}
          x={466}
          y={224}
        />

        {RUEDAS_X.map((x) => (
          <G key={x}>
            <Circle cx={x} cy={248} fill={p.ruedaArco} r={45} />
            <Circle cx={x} cy={248} fill={p.rueda} r={37} />
            <Circle cx={x} cy={248} fill="url(#busLlanta)" r={23} />
            <Circle cx={x} cy={248} fill={p.ruedaCentro} r={9} />
            <Path
              d={`M${x - 21},236 A25,25 0 0 1 ${x + 2},224`}
              fill="none"
              stroke={p.llantaClara}
              strokeLinecap="round"
              strokeOpacity={0.7}
              strokeWidth={3}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}
