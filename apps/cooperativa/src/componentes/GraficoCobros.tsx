export interface Cobro {
  cerrado_en: string;
  cobrado: number;
}

/** lo cobrado en cada uno de los últimos siete días, con barras que crecen al aparecer */
export function GraficoCobros({ cobros }: { cobros: readonly Cobro[] }) {
  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() - (6 - i),
    );
    return {
      clave: d.toDateString(),
      etiqueta: d.toLocaleDateString('es-NI', { weekday: 'short' }).slice(0, 3),
      total: 0,
    };
  });
  for (const c of cobros) {
    const dia = dias.find(
      (d) => d.clave === new Date(c.cerrado_en).toDateString(),
    );
    if (dia) dia.total += c.cobrado;
  }
  const maximo = Math.max(1, ...dias.map((d) => d.total));
  return (
    <div
      aria-label="Cobrado por día en la última semana"
      className="grafico"
      role="img"
    >
      {dias.map((d, i) => (
        <div className="grafico-col" key={d.clave}>
          <span className="micro">{d.total > 0 ? `C$ ${d.total}` : ''}</span>
          <div className="grafico-barra">
            <i
              style={{
                animationDelay: `${i * 70}ms`,
                height: `${Math.max(3, (d.total / maximo) * 100)}%`,
              }}
            />
          </div>
          <span className="micro">{d.etiqueta.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}
