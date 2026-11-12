import { useId } from 'react';
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

import { paletaAutobus, paletasAutobus } from '@/tema/colores';

import { FORMAS } from './formas';
import {
  buscarVariante,
  VARIANTE_POR_DEFECTO,
  type IdVarianteBus,
} from './variantes';

const ANCHO_BASE = 520;
const ALTO_BASE = 300;
const MAXIMO_LETRERO = 8;

export interface PropiedadesAutobus {
  ancho: number;
  /** sin etiqueta el bus es decorativo y se oculta a los lectores de pantalla */
  etiquetaAccesible?: string;
  /** destino que muestra el letrero ámbar del frente */
  letrero?: string;
  /** silueta y color del bus; sin indicar es el clásico ámbar */
  variante?: IdVarianteBus;
}

/** el bus de personaje de Andén: carrocería crema con banda ámbar, vidrios oscuros, faro cálido y letrero */
export function Autobus({
  ancho,
  etiquetaAccesible,
  letrero = 'ANDÉN',
  variante = VARIANTE_POR_DEFECTO,
}: PropiedadesAutobus) {
  const { forma: nombreForma, paleta: nombrePaleta } = buscarVariante(variante);
  const forma = FORMAS[nombreForma];
  const p = { ...paletaAutobus, ...paletasAutobus[nombrePaleta] };
  // los ids de los degradados son únicos por dibujo: dos buses en una pantalla no se pisan
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (nombre: string) => `${nombre}${uid}`;
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
          <LinearGradient id={id('busCarro')} x1="0" x2="0.35" y1="0" y2="1">
            <Stop offset={0} stopColor={p.carroceriaClara} />
            <Stop offset={0.55} stopColor={p.carroceriaMedia} />
            <Stop offset={1} stopColor={p.carroceriaOscura} />
          </LinearGradient>
          <LinearGradient id={id('busBanda')} x1="0" x2="0" y1="0" y2="1">
            <Stop offset={0} stopColor={p.bandaClara} />
            <Stop offset={0.5} stopColor={p.banda} />
            <Stop offset={1} stopColor={p.bandaOscura} />
          </LinearGradient>
          <LinearGradient id={id('busVidrio')} x1="0" x2="1" y1="0" y2="1">
            <Stop offset={0} stopColor={p.vidrioClaro} />
            <Stop offset={1} stopColor={p.vidrioOscuro} />
          </LinearGradient>
          <LinearGradient id={id('busFalda')} x1="0" x2="0" y1="0" y2="1">
            <Stop offset={0} stopColor={p.sombraSuelo} stopOpacity={0} />
            <Stop offset={1} stopColor={p.sombraSuelo} stopOpacity={0.28} />
          </LinearGradient>
          <LinearGradient id={id('busLlanta')} x1="0" x2="1" y1="0" y2="1">
            <Stop offset={0} stopColor={p.llantaClara} />
            <Stop offset={1} stopColor={p.llantaOscura} />
          </LinearGradient>
          <RadialGradient cx="30%" cy="25%" id={id('busBrillo')} r="60%">
            <Stop offset={0} stopColor={p.llantaClara} stopOpacity={0.75} />
            <Stop offset={1} stopColor={p.llantaClara} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="50%" id={id('busSuelo')} r="50%">
            <Stop offset={0} stopColor={p.sombraSuelo} stopOpacity={0.4} />
            <Stop offset={1} stopColor={p.sombraSuelo} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="40%" cy="40%" id={id('busFaro')} r="70%">
            <Stop offset={0} stopColor={p.llantaClara} />
            <Stop offset={0.45} stopColor={p.faro} />
            <Stop offset={1} stopColor={p.faroBrillo} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="50%" id={id('busFaroHalo')} r="50%">
            <Stop offset={0} stopColor={p.faroBrillo} stopOpacity={0.5} />
            <Stop offset={1} stopColor={p.faroBrillo} stopOpacity={0} />
          </RadialGradient>
          <ClipPath id={id('busCarroceria')}>
            <Path d={forma.carroceria} />
          </ClipPath>
        </Defs>

        <Ellipse
          cx={268}
          cy={272}
          fill={`url(#${id('busSuelo')})`}
          rx={240}
          ry={18}
        />

        <G transform={`translate(${forma.dx} 0)`}>
          <G clipPath={`url(#${id('busCarroceria')})`}>
            <Rect
              fill={`url(#${id('busCarro')})`}
              height={240}
              width={500}
              x={10}
              y={10}
            />
            <Rect
              fill={`url(#${id('busBanda')})`}
              height={forma.banda.alto}
              width={500}
              x={10}
              y={forma.banda.y}
            />
            <Rect
              fill={p.llantaClara}
              height={5}
              opacity={0.45}
              width={500}
              x={10}
              y={forma.banda.y}
            />
            <Rect
              fill={`url(#${id('busFalda')})`}
              height={50}
              width={500}
              x={10}
              y={208}
            />
            <Ellipse
              cx={170}
              cy={forma.ventanas[0]?.y ?? 80}
              fill={`url(#${id('busBrillo')})`}
              rx={150}
              ry={22}
            />
          </G>
          <Path
            d={forma.carroceria}
            fill="none"
            stroke={p.borde}
            strokeOpacity={0.18}
            strokeWidth={2}
          />

          {forma.ventanas.map((ventana) => (
            <Rect
              fill={`url(#${id('busVidrio')})`}
              height={ventana.alto}
              key={`${ventana.x}-${ventana.y}`}
              rx={ventana.rx}
              width={ventana.ancho}
              x={ventana.x}
              y={ventana.y}
            />
          ))}
          <Path d={forma.frente} fill={`url(#${id('busVidrio')})`} />
          {forma.frenteAlto && (
            <Path d={forma.frenteAlto} fill={`url(#${id('busVidrio')})`} />
          )}
          {forma.destello &&
            forma.ventanas.map((ventana) => {
              const { alto, ancho, x, y } = ventana;
              return (
                <Path
                  d={`M${x + 8},${y + 6} L${x + 8 + ancho * 0.46},${y + 6} L${x + 16},${y + alto - 6} L${x + 8},${y + alto - 6} Z`}
                  fill={p.llantaClara}
                  key={`d${x}-${y}`}
                  opacity={0.1}
                />
              );
            })}

          <Rect
            fill={p.rueda}
            height={forma.letrero.alto}
            rx={6}
            width={forma.letrero.ancho}
            x={forma.letrero.x}
            y={forma.letrero.y}
          />
          <TextoSvg
            fill={p.banda}
            fontFamily="JetBrainsMono_600SemiBold"
            fontSize={tamanoLetrero}
            letterSpacing={1}
            textAnchor="middle"
            x={forma.letrero.x + forma.letrero.ancho / 2}
            y={forma.letrero.y + forma.letrero.alto - 5}
          >
            {letrero}
          </TextoSvg>

          <Circle
            cx={486}
            cy={206}
            fill={`url(#${id('busFaroHalo')})`}
            r={28}
          />
          <Circle
            cx={486}
            cy={206}
            fill={`url(#${id('busFaro')})`}
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

          {forma.ruedas.map((x) => (
            <G key={x}>
              <Circle cx={x} cy={248} fill={p.ruedaArco} r={45} />
              <Circle cx={x} cy={248} fill={p.rueda} r={37} />
              <Circle
                cx={x}
                cy={248}
                fill={`url(#${id('busLlanta')})`}
                r={23}
              />
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
        </G>
      </Svg>
    </View>
  );
}
