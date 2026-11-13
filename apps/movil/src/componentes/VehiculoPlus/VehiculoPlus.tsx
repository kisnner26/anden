import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { EfectosDeVehiculoPlus } from '@/componentes/EfectosVehiculo';
import { paletaVehiculos } from '@/tema/colores';

import { nombreDeVehiculo, type IdVehiculoPlus } from './vehiculos';

const ANCHO_BASE = 520;
const ALTO_BASE = 300;

export interface PropiedadesVehiculoPlus {
  ancho: number;
  /** agrega los efectos que se mueven: estela, humo, rayos, rotor, burbujas, luces */
  animado?: boolean;
  /** lo dibuja mirando a la izquierda, para un vehículo que avanza hacia el oeste */
  espejo?: boolean;
  /** sin etiqueta el dibujo es decorativo y se oculta a los lectores de pantalla */
  etiquetaAccesible?: string;
  id: IdVehiculoPlus;
}

const c = paletaVehiculos.comun;

function Avion() {
  const p = paletaVehiculos.avion;
  return (
    <G>
      <Path d="M70 170 L40 110 L95 110 L135 160 Z" fill={p.acento} />
      <Path d="M150 175 L330 250 L380 250 L300 160 Z" fill={p.sombra} />
      <Path
        d="M70 175 C70 135 150 120 300 120 L420 135 C480 145 495 165 480 180 C465 195 400 200 300 200 L120 200 C85 200 70 190 70 175 Z"
        fill={p.cuerpo}
      />
      <Path
        d="M70 175 C70 190 85 200 120 200 L300 200 C400 200 465 195 480 180 L470 172 C400 182 300 184 120 184 C90 184 72 180 70 175 Z"
        fill={p.acento}
        opacity={0.9}
      />
      <Path d="M330 110 L420 40 L450 40 L400 130 Z" fill={p.cuerpo} />
      <Path d="M330 110 L420 40 L430 40 L360 120 Z" fill={p.sombra} />
      <Path d="M420 135 C450 138 470 150 478 165 L430 160 Z" fill={p.vidrio} />
      {[170, 210, 250, 290, 330].map((x) => (
        <Rect
          fill={p.vidrio}
          height={18}
          key={x}
          rx={9}
          width={24}
          x={x}
          y={146}
        />
      ))}
      <Ellipse cx={265} cy={232} fill={p.vidrio} rx={30} ry={14} />
      <Ellipse cx={265} cy={232} fill={c.llantaClara} rx={22} ry={8} />
    </G>
  );
}

function Nave() {
  const p = paletaVehiculos.nave;
  return (
    <G>
      <Path d="M230 220 C240 270 280 270 290 220 Z" fill={c.llama} />
      <Path d="M242 220 C250 255 270 255 278 220 Z" fill={c.llamaClara} />
      <Ellipse cx={260} cy={185} fill={p.sombra} rx={215} ry={44} />
      <Ellipse cx={260} cy={175} fill={p.cuerpo} rx={215} ry={42} />
      <Path
        d="M170 150 C175 60 345 60 350 150 Z"
        fill={p.vidrio}
        opacity={0.85}
      />
      <Path
        d="M190 140 C195 85 280 70 320 100 C300 100 230 105 190 140 Z"
        fill={c.destello}
        opacity={0.35}
      />
      <Ellipse
        cx={260}
        cy={176}
        fill="none"
        rx={215}
        ry={42}
        stroke={p.acento}
        strokeWidth={6}
      />
      {[90, 150, 210, 260, 310, 370, 430].map((x, i) => (
        <Circle
          cx={x}
          cy={178 + (i % 2 === 0 ? 8 : 4)}
          fill={p.acento}
          key={x}
          r={9}
        />
      ))}
      <Circle cx={260} cy={110} fill={c.destello} opacity={0.6} r={10} />
    </G>
  );
}

function Tractor() {
  const p = paletaVehiculos.tractor;
  return (
    <G>
      <Rect fill={p.sombra} height={40} rx={4} width={14} x={380} y={60} />
      <Path
        d="M300 190 L300 130 L420 130 L450 165 L450 205 L320 205 Z"
        fill={p.cuerpo}
      />
      <Path
        d="M130 110 L130 190 L305 190 L305 100 Q305 90 295 90 L150 90 Q130 90 130 110 Z"
        fill={p.cuerpo}
      />
      <Path
        d="M150 100 L150 160 L295 160 L295 100 Z"
        fill={p.vidrio}
        opacity={0.9}
      />
      <Path
        d="M160 105 L230 105 L190 155 L160 155 Z"
        fill={c.destello}
        opacity={0.25}
      />
      <Rect fill={p.acento} height={14} rx={4} width={340} x={115} y={85} />
      <Circle cx={470} cy={205} fill={p.sombra} r={6} />
      <Circle cx={175} cy={215} fill={c.llanta} r={72} />
      <Circle cx={175} cy={215} fill={c.llantaClara} r={52} />
      <Circle cx={175} cy={215} fill={p.acento} r={26} />
      <Circle cx={380} cy={240} fill={c.llanta} r={42} />
      <Circle cx={380} cy={240} fill={c.llantaClara} r={28} />
      <Circle cx={380} cy={240} fill={p.acento} r={13} />
    </G>
  );
}

function Tren() {
  const p = paletaVehiculos.tren;
  return (
    <G>
      <Rect fill={p.sombra} height={44} rx={5} width={26} x={360} y={50} />
      <Rect fill={p.acento} height={12} rx={6} width={42} x={352} y={44} />
      <Path
        d="M60 220 L60 120 C60 108 70 100 82 100 L250 100 L250 220 Z"
        fill={p.cuerpo}
      />
      <Rect fill={p.acento} height={16} width={190} x={60} y={196} />
      <Rect fill={p.vidrio} height={50} rx={6} width={60} x={90} y={118} />
      <Rect fill={p.vidrio} height={50} rx={6} width={60} x={170} y={118} />
      <Path d="M250 220 L250 130 L430 130 L430 220 Z" fill={p.sombra} />
      <Ellipse cx={430} cy={175} fill={p.cuerpo} rx={36} ry={45} />
      <Circle cx={450} cy={160} fill={c.llamaClara} r={13} />
      <Path d="M440 215 L500 245 L440 245 Z" fill={c.llanta} />
      {[110, 190, 300, 380].map((x, i) => (
        <G key={x}>
          <Circle cx={x} cy={236} fill={c.llanta} r={i % 2 === 0 ? 34 : 28} />
          <Circle
            cx={x}
            cy={236}
            fill={c.llantaClara}
            r={i % 2 === 0 ? 22 : 17}
          />
          <Circle cx={x} cy={236} fill={p.acento} r={7} />
        </G>
      ))}
    </G>
  );
}

function Helicoptero() {
  const p = paletaVehiculos.helicoptero;
  return (
    <G>
      <Rect fill={p.sombra} height={10} rx={5} width={400} x={60} y={42} />
      <Rect fill={p.sombra} height={34} width={12} x={200} y={52} />
      <Path
        d="M290 160 L480 125 L490 135 L470 175 L300 190 Z"
        fill={p.cuerpo}
      />
      <Path d="M470 125 L500 70 L515 75 L492 135 Z" fill={p.acento} />
      <Ellipse cx={190} cy={160} fill={p.cuerpo} rx={130} ry={72} />
      <Path
        d="M80 160 C80 110 150 90 220 98 C250 110 262 140 262 160 Z"
        fill={p.vidrio}
        opacity={0.9}
      />
      <Path
        d="M100 140 C110 115 160 105 200 108 C170 118 130 128 100 150 Z"
        fill={c.destello}
        opacity={0.3}
      />
      <Path
        d="M120 232 L260 232"
        stroke={p.acento}
        strokeLinecap="round"
        strokeWidth={8}
      />
      <Path
        d="M150 218 L140 232 M230 218 L240 232"
        stroke={p.acento}
        strokeWidth={7}
      />
      <Path
        d="M80 185 C100 205 280 205 300 185"
        fill="none"
        stroke={p.acento}
        strokeWidth={8}
      />
    </G>
  );
}

function Submarino() {
  const p = paletaVehiculos.submarino;
  return (
    <G>
      <Rect fill={p.sombra} height={52} rx={4} width={12} x={255} y={40} />
      <Path d="M255 42 L300 42 L300 56 L267 56 Z" fill={p.sombra} />
      <Rect fill={p.cuerpo} height={52} rx={14} width={120} x={190} y={68} />
      <Rect fill={p.vidrio} height={22} rx={8} width={22} x={212} y={82} />
      <Ellipse cx={265} cy={180} fill={p.cuerpo} rx={215} ry={72} />
      <Path
        d="M90 190 C130 235 400 240 450 190 C420 215 130 215 90 190 Z"
        fill={p.sombra}
        opacity={0.65}
      />
      <Path
        d="M30 180 L60 135 L80 140 L66 180 L80 222 L60 228 Z"
        fill={p.acento}
      />
      <Path d="M40 180 L5 150 L5 210 Z" fill={p.sombra} />
      {[170, 250, 330].map((x) => (
        <G key={x}>
          <Circle cx={x} cy={170} fill={p.acento} r={26} />
          <Circle cx={x} cy={170} fill={p.vidrio} r={19} />
          <Circle cx={x - 6} cy={164} fill={c.destello} opacity={0.5} r={5} />
        </G>
      ))}
      <Path
        d="M405 160 C430 160 440 180 440 195 C430 190 410 188 395 188 Z"
        fill={p.vidrio}
        opacity={0.5}
      />
      <Circle cx={460} cy={225} fill={c.destello} opacity={0.5} r={7} />
      <Circle cx={485} cy={205} fill={c.destello} opacity={0.4} r={5} />
    </G>
  );
}

const DIBUJOS: Record<IdVehiculoPlus, () => React.JSX.Element> = {
  avion: Avion,
  helicoptero: Helicoptero,
  nave: Nave,
  submarino: Submarino,
  tractor: Tractor,
  tren: Tren,
};

/** los vehículos de Plus: un dibujo propio para cada uno, para reconocerlos de un vistazo */
export function VehiculoPlus({
  ancho,
  animado = false,
  espejo = false,
  etiquetaAccesible,
  id,
}: PropiedadesVehiculoPlus) {
  const Dibujo = DIBUJOS[id];
  const alto = (ancho * ALTO_BASE) / ANCHO_BASE;
  const comunica = etiquetaAccesible !== undefined;
  return (
    <View
      accessibilityElementsHidden={!comunica}
      accessibilityLabel={etiquetaAccesible ?? nombreDeVehiculo(id)}
      accessibilityRole={comunica ? 'image' : undefined}
      accessible={comunica}
      importantForAccessibility={comunica ? 'yes' : 'no-hide-descendants'}
      style={{
        height: alto,
        transform: espejo ? [{ scaleX: -1 }] : undefined,
        width: ancho,
      }}
    >
      <Svg
        height={alto}
        viewBox={`0 0 ${ANCHO_BASE} ${ALTO_BASE}`}
        width={ancho}
      >
        <Dibujo />
      </Svg>
      {animado && <EfectosDeVehiculoPlus ancho={ancho} id={id} />}
    </View>
  );
}
