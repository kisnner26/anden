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

function km(a: Terminal, b: Terminal): number {
  const A = TERMINALES[a];
  const B = TERMINALES[b];
  const r = (g: number) => (g * Math.PI) / 180;
  const h =
    Math.sin(r(B.lat - A.lat) / 2) ** 2 +
    Math.cos(r(A.lat)) *
      Math.cos(r(B.lat)) *
      Math.sin(r(B.lng - A.lng) / 2) ** 2;
  // línea recta multiplicada por 1.25: lo que suele sobrar de curvas en la carretera
  return Math.round(12742 * Math.asin(Math.sqrt(h)) * 1.25);
}

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
  const destinos = ['boaco', 'juigalpa'] as const;
  return (
    <figure className="red">
      <svg
        aria-label="Plano de la red con los buses en camino"
        role="img"
        style={{ maxHeight: alto }}
        viewBox="0 0 900 360"
      >
        <defs>
          <pattern
            height="30"
            id="rejilla"
            patternUnits="userSpaceOnUse"
            width="30"
          >
            <path className="red-rejilla" d="M30 0H0V30" />
          </pattern>
        </defs>
        <rect fill="url(#rejilla)" height="360" width="900" />
        {destinos.map((c) => {
          const f = PUNTOS_DIBUJO[c];
          const mx = (m.x + f.x) / 2;
          const my = (m.y + f.y) / 2;
          return (
            <g key={c}>
              <line
                className="red-orilla"
                x1={m.x}
                x2={f.x}
                y1={m.y}
                y2={f.y}
              />
              <line
                className="red-asfalto"
                x1={m.x}
                x2={f.x}
                y1={m.y}
                y2={f.y}
              />
              <line className="red-flujo" x1={m.x} x2={f.x} y1={m.y} y2={f.y} />
              <g transform={`translate(${mx} ${my})`}>
                <rect
                  className="red-km"
                  height="26"
                  rx="13"
                  width="86"
                  x="-43"
                  y="-13"
                />
                <text className="red-mono" textAnchor="middle" y="5">
                  {`≈ ${km('managua', c)} km`}
                </text>
              </g>
            </g>
          );
        })}
        {ESTACIONES.map((e) => {
          const p = PUNTOS_DIBUJO[e];
          const n = porTerminal.get(e) ?? 0;
          return (
            <g key={e} transform={`translate(${p.x} ${p.y})`}>
              {n > 0 && <circle className="red-pulso" r="40" />}
              <rect
                className={`red-tarjeta${n > 0 ? ' activa' : ''}`}
                height="58"
                rx="10"
                width="164"
                x="-82"
                y="-29"
              />
              <text className="red-nombre" textAnchor="middle" y="-4">
                {TERMINALES[e].nombre}
              </text>
              <text className="red-mono" textAnchor="middle" y="16">
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
            <circle className="red-bus-halo" r="22" />
            <circle className="red-bus-punto" r="9" />
            <rect
              className="red-placa"
              height="22"
              rx="6"
              width="92"
              x="-46"
              y="-44"
            />
            <text className="red-placa-t" textAnchor="middle" y="-29">
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
