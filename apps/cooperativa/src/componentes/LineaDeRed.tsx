import type { ViajeFila } from '../resumen';
import {
  corredorDe,
  extremosDeRuta,
  fraccionEnCorredor,
  PUNTOS_DIBUJO,
  puntoEnDibujo,
  TERMINALES,
  type Terminal,
} from '../lib/ruta';

export interface Transmision {
  lat: number | null;
  lng: number | null;
  viaje_id: string;
}

const ESTACIONES: Terminal[] = ['managua', 'boaco', 'juigalpa'];

/**
 * la red de Andén dibujada como un plano de línea: Managua al centro, Boaco y Juigalpa en los
 * extremos. Los buses en camino se mueven sobre el trazo según su ubicación real; los que
 * esperan pasajeros se ven como luces junto a su terminal.
 */
export function LineaDeRed({
  transmisiones,
  viajes,
}: {
  transmisiones: readonly Transmision[];
  viajes: readonly ViajeFila[];
}) {
  const enCamino = transmisiones
    .map((t) => {
      const viaje = viajes.find((v) => v.id === t.viaje_id);
      const ciudad = viaje ? corredorDe(viaje.ruta_id) : null;
      if (!viaje || !ciudad || t.lat === null || t.lng === null) return null;
      return {
        ciudad,
        punto: puntoEnDibujo(ciudad, fraccionEnCorredor(t.lat, t.lng, ciudad)),
        viaje,
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  const esperando = viajes.filter(
    (v) => v.estado !== 'cancelado' && !v.salio_en,
  );
  const porTerminal = new Map<Terminal, number>();
  for (const v of esperando) {
    const origen = extremosDeRuta(v.ruta_id)?.origen;
    if (origen) porTerminal.set(origen, (porTerminal.get(origen) ?? 0) + 1);
  }

  const m = PUNTOS_DIBUJO.managua;
  return (
    <figure className="red">
      <svg
        aria-label="Plano de la red de Andén con los buses en camino"
        role="img"
        viewBox="0 0 900 360"
      >
        <defs>
          <linearGradient id="trazo" x1="0" x2="1">
            <stop offset="0" stopColor="#ffb21e" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffb21e" stopOpacity="0.9" />
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
          return (
            <g key={e} transform={`translate(${p.x} ${p.y})`}>
              {n > 0 && <circle className="red-pulso" r="14" />}
              <circle className="red-estacion" r="9" />
              <text
                className="red-nombre"
                x={e === 'managua' ? -18 : 18}
                y="5"
                textAnchor={e === 'managua' ? 'end' : 'start'}
              >
                {TERMINALES[e].nombre.toUpperCase()}
              </text>
              <text
                className="red-mono"
                x={e === 'managua' ? -18 : 18}
                y="24"
                textAnchor={e === 'managua' ? 'end' : 'start'}
              >
                {n === 0
                  ? 'SIN BUSES EN ANDÉN'
                  : `${n} ${n === 1 ? 'BUS' : 'BUSES'} EN ANDÉN`}
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
          ? '○ NINGÚN BUS EN CAMINO AHORA'
          : `● ${enCamino.length} ${enCamino.length === 1 ? 'BUS EN CAMINO' : 'BUSES EN CAMINO'} · POSICIÓN REAL`}
      </figcaption>
    </figure>
  );
}
