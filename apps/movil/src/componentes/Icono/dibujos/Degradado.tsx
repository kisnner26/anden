import { LinearGradient, Stop } from 'react-native-svg';

export type ParadaDegradado = readonly [desplazamiento: number, color: string];

interface PropiedadesDegradado {
  id: string;
  paradas: readonly ParadaDegradado[];
}

/** degradado diagonal que usan todos los íconos ilustrados */
export function Degradado({ id, paradas }: PropiedadesDegradado) {
  return (
    <LinearGradient id={id} x1="0" x2="0.7" y1="0" y2="1">
      {paradas.map(([desplazamiento, color]) => (
        <Stop key={desplazamiento} offset={desplazamiento} stopColor={color} />
      ))}
    </LinearGradient>
  );
}
