import { StyleSheet, View } from 'react-native';

import type { IdVehiculoPlus } from '@/componentes/VehiculoPlus';
import { coloresEfectos } from '@/tema/colores';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { Estela, Humo, Rayos, Resplandor, Rotor, Rueda } from './primitivas';

const ANCHO_BASE = 520;
const ALTO_BASE = 300;

function Capa({
  ancho,
  children,
  espejo = false,
}: {
  ancho: number;
  children: React.ReactNode;
  espejo?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        estilos.capa,
        {
          height: (ancho * ALTO_BASE) / ANCHO_BASE,
          transform: espejo ? [{ scaleX: -1 }] : undefined,
          width: ancho,
        },
      ]}
    >
      {children}
    </View>
  );
}

/** lo que se mueve en un bus: ruedas que giran, humo del escape y faros que se encienden y apagan */
export function EfectosDeBus({
  ancho,
  dx,
  espejo,
  ruedas,
}: {
  ancho: number;
  dx: number;
  espejo: boolean;
  ruedas: readonly number[];
}) {
  const reducir = useMovimientoReducido();
  if (reducir) return null;
  const k = ancho / ANCHO_BASE;
  return (
    <Capa ancho={ancho} espejo={espejo}>
      {ruedas.map((x) => (
        <Rueda cx={x + dx} cy={248} k={k} key={x} r={21} />
      ))}
      <Humo k={k} tamano={12} x={(ruedas[0] ?? 128) + dx - 64} y={236} />
      <Resplandor k={k} r={22} x={486 + dx} y={206} />
      <Resplandor
        color={coloresEfectos.luzRoja}
        demora={500}
        k={k}
        minimo={0.25}
        r={8}
        ritmo={1600}
        x={22 + dx}
        y={196}
      />
    </Capa>
  );
}

/** lo que se mueve en cada vehículo de Plus: avión con estela, nave con rayos, helicóptero con rotor, submarino con burbujas */
export function EfectosDeVehiculoPlus({
  ancho,
  id,
}: {
  ancho: number;
  id: IdVehiculoPlus;
}) {
  const reducir = useMovimientoReducido();
  if (reducir) return null;
  const k = ancho / ANCHO_BASE;
  switch (id) {
    case 'avion':
      return (
        <Capa ancho={ancho}>
          <Estela k={k} largo={170} x={70} y={168} />
          <Resplandor
            color={coloresEfectos.luzRoja}
            k={k}
            r={7}
            ritmo={1200}
            x={42}
            y={112}
          />
          <Resplandor
            color={coloresEfectos.luzVerde}
            demora={600}
            k={k}
            r={7}
            ritmo={1200}
            x={355}
            y={248}
          />
          <Resplandor k={k} r={16} x={486} y={170} />
          <Humo
            color={coloresEfectos.humoClaro}
            deriva={-40}
            k={k}
            sube={8}
            tamano={12}
            x={72}
            y={176}
          />
        </Capa>
      );
    case 'nave':
      return (
        <Capa ancho={ancho}>
          <Resplandor
            color="rgba(255,159,10,0.95)"
            k={k}
            minimo={0.5}
            r={30}
            ritmo={380}
            x={260}
            y={236}
          />
          <Humo
            color="rgba(255,200,90,0.8)"
            deriva={0}
            k={k}
            sube={-42}
            tamano={16}
            x={260}
            y={232}
          />
          <Rayos
            k={k}
            puntos={[
              { d: 'M60 120 L90 140 L72 152 L108 176' },
              {
                color: coloresEfectos.rayoViolenta,
                d: 'M455 118 L430 142 L448 150 L412 176',
              },
              { d: 'M150 40 L172 66 L158 74 L190 96' },
              {
                color: coloresEfectos.rayoViolenta,
                d: 'M370 38 L350 64 L364 72 L334 98',
              },
            ]}
          />
          {[90, 150, 210, 310, 370, 430].map((x, i) => (
            <Resplandor
              color={
                i % 2 === 0 ? coloresEfectos.rayo : coloresEfectos.rayoViolenta
              }
              demora={i * 140}
              k={k}
              key={x}
              minimo={0.3}
              r={9}
              ritmo={900}
              x={x}
              y={180 + (i % 2 === 0 ? 8 : 4)}
            />
          ))}
        </Capa>
      );
    case 'tractor':
      return (
        <Capa ancho={ancho}>
          <Rueda cx={175} cy={215} k={k} r={46} velocidad={0.6} />
          <Rueda cx={380} cy={240} k={k} r={26} velocidad={0.9} />
          <Humo k={k} deriva={-18} sube={52} tamano={16} x={387} y={54} />
          <Resplandor k={k} r={20} x={452} y={172} />
        </Capa>
      );
    case 'tren':
      return (
        <Capa ancho={ancho}>
          {[110, 190, 300, 380].map((x, i) => (
            <Rueda
              cx={x}
              cy={236}
              k={k}
              key={x}
              r={i % 2 === 0 ? 20 : 16}
              velocidad={1.2}
            />
          ))}
          <Humo
            cantidad={5}
            color={coloresEfectos.humoClaro}
            deriva={-30}
            k={k}
            sube={64}
            tamano={20}
            x={371}
            y={42}
          />
          <Resplandor k={k} r={26} x={450} y={160} />
        </Capa>
      );
    case 'helicoptero':
      return (
        <Capa ancho={ancho}>
          <Rotor
            ancho={430}
            color="rgba(40,40,48,0.5)"
            grosor={7}
            k={k}
            x={260}
            y={47}
          />
          <Rotor
            ancho={58}
            color="rgba(40,40,48,0.55)"
            grosor={5}
            k={k}
            vertical
            x={508}
            y={102}
          />
          <Resplandor
            color={coloresEfectos.luzRoja}
            k={k}
            r={7}
            ritmo={1000}
            x={500}
            y={86}
          />
          <Resplandor
            color={coloresEfectos.luzVerde}
            demora={500}
            k={k}
            r={6}
            ritmo={1000}
            x={96}
            y={176}
          />
          <Humo
            color={coloresEfectos.humoClaro}
            deriva={-34}
            k={k}
            sube={14}
            tamano={10}
            x={296}
            y={160}
          />
        </Capa>
      );
    case 'submarino':
      return (
        <Capa ancho={ancho}>
          <Humo
            cantidad={6}
            color={coloresEfectos.burbuja}
            deriva={-26}
            k={k}
            sube={90}
            tamano={9}
            x={22}
            y={186}
          />
          <Humo
            cantidad={4}
            color={coloresEfectos.burbuja}
            deriva={10}
            k={k}
            sube={70}
            tamano={7}
            x={268}
            y={42}
          />
          {[170, 250, 330].map((x, i) => (
            <Resplandor
              color={coloresEfectos.faro}
              demora={i * 300}
              k={k}
              key={x}
              minimo={0.2}
              r={13}
              ritmo={1500}
              x={x}
              y={170}
            />
          ))}
          <Rotor
            ancho={50}
            color="rgba(70,40,10,0.55)"
            grosor={7}
            k={k}
            vertical
            x={46}
            y={180}
          />
        </Capa>
      );
  }
}

const estilos = StyleSheet.create({
  capa: { left: 0, position: 'absolute', top: 0 },
});
