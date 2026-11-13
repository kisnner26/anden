/** los dibujos propios del panel: placa de andén, reloj de estación, paquetes, sirena y subrayado a mano */

export function PlacaAnden({
  numero,
  clase = '',
}: {
  clase?: string;
  numero: number | string;
}) {
  return (
    <svg
      aria-label={`Andén ${numero}`}
      className={`placa ${clase}`}
      role="img"
      viewBox="0 0 64 64"
    >
      <circle cx="32" cy="32" fill="#ffc21a" r="30" />
      <circle
        cx="32"
        cy="32"
        fill="none"
        r="25"
        stroke="#0b0b0c"
        strokeWidth="2"
      />
      <text
        fill="#0b0b0c"
        fontFamily="Unbounded, sans-serif"
        fontSize="26"
        fontWeight="700"
        textAnchor="middle"
        x="32"
        y="42"
      >
        {numero}
      </text>
    </svg>
  );
}

export function RelojEstacion({ ahora }: { ahora: Date }) {
  const horas = ((ahora.getHours() % 12) + ahora.getMinutes() / 60) * 30;
  const minutos = (ahora.getMinutes() + ahora.getSeconds() / 60) * 6;
  const segundos = ahora.getSeconds() * 6;
  return (
    <svg aria-hidden="true" className="reloj" viewBox="0 0 120 120">
      <circle cx="60" cy="60" fill="#f4f1ea" r="56" />
      <circle
        cx="60"
        cy="60"
        fill="none"
        r="50"
        stroke="#0b0b0c"
        strokeWidth="1.5"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          stroke="#0b0b0c"
          strokeLinecap="round"
          strokeWidth={i % 3 === 0 ? 4 : 1.5}
          transform={`rotate(${i * 30} 60 60)`}
          x1="60"
          x2="60"
          y1="12"
          y2={i % 3 === 0 ? 24 : 19}
        />
      ))}
      <line
        stroke="#0b0b0c"
        strokeLinecap="round"
        strokeWidth="5"
        transform={`rotate(${horas} 60 60)`}
        x1="60"
        x2="60"
        y1="60"
        y2="32"
      />
      <line
        stroke="#0b0b0c"
        strokeLinecap="round"
        strokeWidth="3.5"
        transform={`rotate(${minutos} 60 60)`}
        x1="60"
        x2="60"
        y1="60"
        y2="20"
      />
      <line
        stroke="#e4402d"
        strokeLinecap="round"
        strokeWidth="1.8"
        transform={`rotate(${segundos} 60 60)`}
        x1="60"
        x2="60"
        y1="70"
        y2="16"
      />
      <circle cx="60" cy="60" fill="#e4402d" r="4" />
    </svg>
  );
}

export function Paquete({ tamano }: { tamano: string }) {
  const caja =
    tamano === 'grande'
      ? { h: 34, w: 42, x: 11, y: 20 }
      : tamano === 'sobre'
        ? { h: 22, w: 44, x: 10, y: 28 }
        : { h: 28, w: 34, x: 15, y: 24 };
  return (
    <svg aria-hidden="true" className="paquete" viewBox="0 0 64 64">
      <rect
        fill="#c9a26a"
        height={caja.h}
        rx="3"
        width={caja.w}
        x={caja.x}
        y={caja.y}
      />
      {tamano === 'sobre' ? (
        <path
          d={`M${caja.x} ${caja.y + 2} L${caja.x + caja.w / 2} ${caja.y + caja.h / 2 + 2} L${caja.x + caja.w} ${caja.y + 2}`}
          fill="none"
          stroke="#8a6a3a"
          strokeWidth="2"
        />
      ) : (
        <>
          <rect
            fill="#ffb21e"
            height={caja.h}
            width="7"
            x={caja.x + caja.w / 2 - 3.5}
            y={caja.y}
          />
          <rect
            fill="#8a6a3a"
            height="4"
            opacity=".45"
            width={caja.w}
            x={caja.x}
            y={caja.y}
          />
        </>
      )}
    </svg>
  );
}

export function Sirena({ activa }: { activa: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`sirena${activa ? ' activa' : ''}`}
      viewBox="0 0 64 64"
    >
      <path
        className="sirena-rayos"
        d="M8 30 L2 28 M10 18 L5 14 M22 8 L20 2 M42 8 L44 2 M54 18 L59 14 M56 30 L62 28"
        fill="none"
        stroke="#e4402d"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M16 44c0-10 6-18 16-18s16 8 16 18z"
        fill={activa ? '#e4402d' : '#6b6f78'}
      />
      <rect fill="#2a2a2f" height="8" rx="2" width="40" x="12" y="44" />
      <rect fill="#1b1b1f" height="5" rx="2" width="48" x="8" y="52" />
    </svg>
  );
}

/** una línea ondulada dibujada a mano que se traza sola debajo de una palabra del titular */
export function Subrayado() {
  return (
    <svg
      aria-hidden="true"
      className="subrayado"
      preserveAspectRatio="none"
      viewBox="0 0 300 18"
    >
      <path
        d="M3 11 C 30 2, 50 17, 80 9 S 130 3, 160 10 S 215 16, 240 8 S 280 5, 297 10"
        fill="none"
        pathLength="1"
        stroke="#ffb21e"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export function Asiento({ vendido }: { vendido: boolean }) {
  return <i className={`asiento${vendido ? ' vendido' : ''}`} />;
}
