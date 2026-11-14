import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { conAlfa } from '@/tema/alfa';
import { useTema } from '@/tema/useTema';

export type TipoAtajo = 'boletos' | 'horarios' | 'rutas';

export interface PropiedadesIlustracionAtajo {
  alto?: number;
  tipo: TipoAtajo;
}

/** el degradado ámbar que usan los tres dibujos, para que se vean de la misma familia */
function DegradadoAmbar({ id }: { id: string }) {
  const { colores } = useTema();
  return (
    <LinearGradient id={id} x1="0" x2="1" y1="0" y2="1">
      <Stop offset="0" stopColor={colores.ambar} />
      <Stop offset="1" stopColor={colores.ambarProfundo} />
    </LinearGradient>
  );
}

/** dos boletos apilados y ladeados: el de adelante con muescas, línea de corte, código de barras y la ruta */
function Boletos() {
  const { colores } = useTema();
  const barras = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <>
      <Defs>
        <DegradadoAmbar id="boletoFrente" />
      </Defs>
      <G rotation={9} origin="60, 44">
        <Rect
          fill={conAlfa(colores.tinta, 0.14)}
          height={46}
          rx={10}
          width={86}
          x={22}
          y={14}
        />
      </G>
      <G rotation={-8} origin="60, 44">
        <Path
          d="M16 22 h88 a8 8 0 0 1 8 8 v8 a6 6 0 0 0 0 12 v8 a8 8 0 0 1 -8 8 h-88 a8 8 0 0 1 -8 -8 v-8 a6 6 0 0 0 0 -12 v-8 a8 8 0 0 1 8 -8 z"
          fill="url(#boletoFrente)"
          stroke={colores.ambarProfundo}
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
        <Line
          stroke={conAlfa(colores.bloqueNegro, 0.35)}
          strokeDasharray="2.5 3.5"
          strokeLinecap="round"
          strokeWidth={1.6}
          x1={80}
          x2={80}
          y1={26}
          y2={70}
        />
        <Circle cx={26} cy={34} fill={colores.bloqueNegro} r={3.2} />
        <Path
          d="M31 34 H54"
          stroke={conAlfa(colores.bloqueNegro, 0.55)}
          strokeDasharray="1 4"
          strokeLinecap="round"
          strokeWidth={2}
        />
        <Path d="M58 30 l5 4 l-5 4 z" fill={colores.bloqueNegro} />
        <Rect
          fill={conAlfa(colores.bloqueNegro, 0.78)}
          height={5}
          rx={2.5}
          width={44}
          x={22}
          y={46}
        />
        <Rect
          fill={conAlfa(colores.bloqueNegro, 0.4)}
          height={5}
          rx={2.5}
          width={28}
          x={22}
          y={56}
        />
        {barras.map((i) => (
          <Rect
            fill={colores.bloqueNegro}
            height={i % 4 === 0 ? 24 : 20}
            key={i}
            rx={0.4}
            width={i % 3 === 0 ? 1.8 : 1}
            x={86 + i * 2.1}
            y={i % 4 === 0 ? 34 : 36}
          />
        ))}
      </G>
    </>
  );
}

/** un tablero de salidas con fichas que giran y un reloj grande encima, como el de la terminal */
function Horarios() {
  const { colores } = useTema();
  const filas = [
    ['0', '8', '3', '0'],
    ['1', '0', '1', '5'],
    ['1', '1', '4', '5'],
  ];
  return (
    <>
      <Defs>
        <DegradadoAmbar id="horaReloj" />
      </Defs>
      <Rect
        fill={colores.bloqueNegro}
        height={62}
        rx={10}
        stroke={conAlfa(colores.ambar, 0.35)}
        strokeWidth={1.5}
        width={92}
        x={8}
        y={10}
      />
      {filas.map((fila, r) =>
        fila.map((digito, c) => (
          <G key={`${r}-${c}`}>
            <Rect
              fill={colores.bloqueNegroClaro}
              height={12}
              rx={2}
              width={10}
              x={16 + c * 12 + (c > 1 ? 4 : 0)}
              y={17 + r * 17}
            />
            <Line
              stroke={colores.bloqueNegro}
              strokeWidth={0.8}
              x1={16 + c * 12 + (c > 1 ? 4 : 0)}
              x2={26 + c * 12 + (c > 1 ? 4 : 0)}
              y1={23 + r * 17}
              y2={23 + r * 17}
            />
            <Rect
              fill={r === 0 ? colores.ambar : colores.sobreNegroSuave}
              height={4}
              opacity={digito === '0' ? 0.9 : 0.75}
              rx={1}
              width={5 + ((c * 3 + r) % 3)}
              x={18.5 + c * 12 + (c > 1 ? 4 : 0)}
              y={21 + r * 17}
            />
          </G>
        )),
      )}
      <Circle
        cx={90}
        cy={58}
        fill="url(#horaReloj)"
        r={22}
        stroke={colores.bloqueNegro}
        strokeWidth={3}
      />
      <Circle cx={90} cy={58} fill={colores.fondo} r={17} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const a = (i * Math.PI) / 6;
        const largo = i % 3 === 0 ? 4 : 2;
        return (
          <Line
            key={i}
            stroke={colores.tinta}
            strokeLinecap="round"
            strokeWidth={i % 3 === 0 ? 1.6 : 1}
            x1={90 + Math.sin(a) * (15 - largo)}
            x2={90 + Math.sin(a) * 15}
            y1={58 - Math.cos(a) * (15 - largo)}
            y2={58 - Math.cos(a) * 15}
          />
        );
      })}
      <Line
        stroke={colores.tinta}
        strokeLinecap="round"
        strokeWidth={2.4}
        x1={90}
        x2={90}
        y1={58}
        y2={48}
      />
      <Line
        stroke={colores.ambarProfundo}
        strokeLinecap="round"
        strokeWidth={2.4}
        x1={90}
        x2={98}
        y1={58}
        y2={62}
      />
      <Circle cx={90} cy={58} fill={colores.ambarProfundo} r={2} />
    </>
  );
}

/** un mapa con cuadrícula, un camino que serpentea de un punto de salida a un destino y un bus en el trayecto */
function Rutas() {
  const { colores } = useTema();
  return (
    <>
      <Defs>
        <DegradadoAmbar id="pinDestino" />
      </Defs>
      <Rect
        fill={conAlfa(colores.tinta, 0.07)}
        height={64}
        rx={12}
        stroke={conAlfa(colores.tinta, 0.14)}
        strokeWidth={1.5}
        width={104}
        x={8}
        y={10}
      />
      {[26, 44, 62, 80, 98].map((x) => (
        <Line
          key={`v${x}`}
          stroke={conAlfa(colores.tinta, 0.08)}
          strokeWidth={1}
          x1={x}
          x2={x}
          y1={12}
          y2={72}
        />
      ))}
      {[28, 46, 64].map((y) => (
        <Line
          key={`h${y}`}
          stroke={conAlfa(colores.tinta, 0.08)}
          strokeWidth={1}
          x1={10}
          x2={110}
          y1={y}
          y2={y}
        />
      ))}
      <Path
        d="M22 62 C 36 62, 36 40, 52 44 S 70 62, 82 46 S 90 28, 98 26"
        fill="none"
        stroke={conAlfa(colores.bloqueNegro, 0.85)}
        strokeLinecap="round"
        strokeWidth={5}
      />
      <Path
        d="M22 62 C 36 62, 36 40, 52 44 S 70 62, 82 46 S 90 28, 98 26"
        fill="none"
        stroke={colores.ambar}
        strokeDasharray="1 7"
        strokeLinecap="round"
        strokeWidth={2.4}
      />
      <Circle
        cx={22}
        cy={62}
        fill={colores.fondo}
        r={6}
        stroke={colores.bloqueNegro}
        strokeWidth={3}
      />
      <G rotation={-14} origin="68, 48">
        <Rect
          fill={colores.ambar}
          height={12}
          rx={3.5}
          stroke={colores.bloqueNegro}
          strokeWidth={1.6}
          width={21}
          x={57}
          y={37}
        />
        <Rect
          fill={colores.bloqueNegro}
          height={4}
          rx={1.2}
          width={16}
          x={59.5}
          y={39.5}
        />
        <Circle cx={63} cy={50} fill={colores.bloqueNegro} r={2.4} />
        <Circle cx={73} cy={50} fill={colores.bloqueNegro} r={2.4} />
      </G>
      <Path
        d="M98 12 c-7 0 -12 5 -12 11.5 c0 8.5 12 20 12 20 s12 -11.5 12 -20 c0 -6.5 -5 -11.5 -12 -11.5 z"
        fill="url(#pinDestino)"
        stroke={colores.bloqueNegro}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Circle cx={98} cy={23.5} fill={colores.bloqueNegro} r={4.4} />
    </>
  );
}

/**
 * el dibujo de cada atajo de Viajar en lugar de una foto: un boleto con muescas y código de barras, un tablero de salidas
 * con su reloj y un mapa con el camino de un bus. Todo vectorial y con los colores del tema
 */
export function IlustracionAtajo({
  alto = 74,
  tipo,
}: PropiedadesIlustracionAtajo) {
  return (
    <Svg
      accessibilityElementsHidden
      height={alto}
      importantForAccessibility="no-hide-descendants"
      testID={`ilustracion-${tipo}`}
      viewBox="0 0 120 84"
      width={(alto * 120) / 84}
    >
      {tipo === 'boletos' ? <Boletos /> : null}
      {tipo === 'horarios' ? <Horarios /> : null}
      {tipo === 'rutas' ? <Rutas /> : null}
    </Svg>
  );
}
