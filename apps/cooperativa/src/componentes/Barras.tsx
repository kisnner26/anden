import { useState } from 'react';

/** barras SVG que crecen al aparecer; al pasar el cursor por una se ve su valor */
export function Barras({
  datos,
  formato,
  unidad,
}: {
  datos: readonly { etiqueta: string; valor: number }[];
  formato: (n: number) => string;
  unidad: string;
}) {
  const [foco, establecerFoco] = useState<number | null>(null);
  const maximo = Math.max(1, ...datos.map((d) => d.valor));
  const ancho = 640;
  const alto = 180;
  const paso = ancho / Math.max(1, datos.length);
  return (
    <figure className="barras">
      <svg
        aria-label={`Gráfico de ${unidad}`}
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${ancho} ${alto + 24}`}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            className="barras-guia"
            key={f}
            x1="0"
            x2={ancho}
            y1={alto - alto * f}
            y2={alto - alto * f}
          />
        ))}
        {datos.map((d, i) => {
          const h = Math.max(2, (d.valor / maximo) * (alto - 14));
          return (
            <g
              key={`${d.etiqueta}-${i}`}
              onMouseEnter={() => establecerFoco(i)}
              onMouseLeave={() => establecerFoco(null)}
            >
              <rect
                className="barras-fondo"
                height={alto}
                width={paso}
                x={i * paso}
                y="0"
              />
              <rect
                className={`barras-barra${foco === i ? ' foco' : ''}`}
                height={h}
                rx="2"
                style={{ animationDelay: `${i * 30}ms` }}
                width={Math.max(4, paso - 8)}
                x={i * paso + 4}
                y={alto - h}
              />
              <text
                className="barras-et"
                textAnchor="middle"
                x={i * paso + paso / 2}
                y={alto + 16}
              >
                {datos.length > 16 && i % 2 === 1 ? '' : d.etiqueta}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="micro">
        {foco !== null && datos[foco]
          ? `${datos[foco]?.etiqueta}: ${formato(datos[foco]?.valor ?? 0)}`
          : `Pasá el cursor sobre una barra`}
      </figcaption>
    </figure>
  );
}
