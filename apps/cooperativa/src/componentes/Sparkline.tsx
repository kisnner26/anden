/** una línea mínima con área, para ver la tendencia de una cifra de un vistazo */
export function Sparkline({
  valores,
  etiqueta,
}: {
  etiqueta: string;
  valores: readonly number[];
}) {
  const maximo = Math.max(1, ...valores);
  const ancho = 120;
  const alto = 32;
  const paso = valores.length > 1 ? ancho / (valores.length - 1) : ancho;
  const puntos = valores.map(
    (v, i) =>
      `${(i * paso).toFixed(1)},${(alto - 3 - (v / maximo) * (alto - 8)).toFixed(1)}`,
  );
  const linea = puntos.join(' ');
  return (
    <svg
      aria-label={etiqueta}
      className="spark"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${ancho} ${alto}`}
    >
      <polygon
        fill="var(--acc)"
        opacity="0.14"
        points={`0,${alto} ${linea} ${ancho},${alto}`}
      />
      <polyline
        className="spark-linea"
        fill="none"
        pathLength="1"
        points={linea}
        stroke="var(--acc)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
