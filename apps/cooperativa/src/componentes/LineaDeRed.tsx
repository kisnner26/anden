import {
  corredorDe,
  extremosDeRuta,
  fraccionEnCorredor,
  PUNTOS_DIBUJO,
  puntoEnDibujo,
  TERMINALES,
  type Terminal,
} from '../lib/ruta';
import type { Transmision, Viaje } from '../tipos';

const ESTACIONES: Terminal[] = ['managua', 'boaco', 'juigalpa'];

/** la red de Andén como plano de línea: Managua al centro, Boaco y Juigalpa en los extremos, con los buses moviéndose según su ubicación real */
export function LineaDeRed({
  alto = 360,
  transmisiones,
  viajes,
}: {
  alto?: number;
  transmisiones: readonly Transmision[];
  viajes: readonly Viaje[];
}) {
  const enCamino = transmisiones
    .map((t) => {
      const viaje = viajes.find((v) => v.id === t.viaje_id);
      const ciudad = viaje ? corredorDe(viaje.ruta_id) : null;
      if (!viaje || !ciudad || t.lat === null || t.lng === null) return null;
      return {
        punto: puntoEnDibujo(ciudad, fraccionEnCorredor(t.lat, t.lng, ciudad)),
        viaje,
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);
  const porTerminal = new Map<Terminal, number>();
  for (const v of viajes.filter(
    (x) => x.estado !== 'cancelado' && !x.salio_en,
  )) {
    const origen = extremosDeRuta(v.ruta_id)?.origen;
    if (origen) porTerminal.set(origen, (porTerminal.get(origen) ?? 0) + 1);
  }
  const m = PUNTOS_DIBUJO.managua;
  return (
    <figure className="red">
      <svg
        aria-label="Plano de la red con los buses en camino"
        role="img"
        style={{ maxHeight: alto }}
        viewBox="-20 0 1060 360"
      >
        <defs>
          <linearGradient id="trazo" x1="0" x2="1">
            <stop offset="0" stopColor="#ffb21e" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffb21e" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {(['boaco', 'juigalpa'] as const).map((c) => {
          const f = PUNTOS_DIBUJO[c];
          return (
            <g key={c}>
              <line className="red-base" x1={m.x} x2={f.x} y1={m.y} y2={f.y} />
              <line className="red-flujo" x1={m.x} x2={f.x} y1={m.y} y2={f.y} />
            </g>
          );
        })}
        {ESTACIONES.map((e) => {
          const p = PUNTOS_DIBUJO[e];
          const n = porTerminal.get(e) ?? 0;
          const izq = e === 'managua';
          return (
            <g key={e} transform={`translate(${p.x} ${p.y})`}>
              {n > 0 && <circle className="red-pulso" r="14" />}
              <circle className="red-estacion" r="11" />
              <text
                className="red-nombre"
                textAnchor={izq ? 'end' : 'start'}
                x={izq ? -18 : 18}
                y="7"
              >
                {TERMINALES[e].nombre}
              </text>
              <text
                className="red-mono"
                textAnchor={izq ? 'end' : 'start'}
                x={izq ? -18 : 18}
                y="32"
              >
                {n === 0
                  ? 'sin buses en andén'
                  : `${n} ${n === 1 ? 'bus' : 'buses'} en andén`}
              </text>
            </g>
          );
        })}
        {enCamino.map(({ punto, viaje }) => (
          <g
            className="red-bus"
            key={viaje.id}
            transform={`translate(${punto.x} ${punto.y})`}
          >
            <circle className="red-bus-halo" r="16" />
            <circle className="red-bus-punto" r="6" />
            <text className="red-mono" x="12" y="-12">
              {viaje.placa}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="micro">
        {enCamino.length === 0
          ? '○ Ningún bus en camino ahora'
          : `● ${enCamino.length} ${enCamino.length === 1 ? 'bus en camino' : 'buses en camino'} · posición real`}
      </figcaption>
    </figure>
  );
}
