/** el bus de Andén visto de costado, dibujado a mano para el panel: carrocería crema, banda de color, vidrios y ruedas que giran */
export function Bus({
  banda = '#ffb21e',
  clase = '',
  ruedas = true,
}: {
  banda?: string;
  clase?: string;
  ruedas?: boolean;
}) {
  return (
    <svg aria-hidden="true" className={`bus ${clase}`} viewBox="0 0 260 110">
      <ellipse cx="130" cy="104" fill="rgba(0,0,0,.35)" rx="118" ry="6" />
      <path
        d="M18 78V30c0-8 6-14 14-14h156c10 0 18 4 24 12l24 26c4 4 6 9 6 14v10c0 4-3 6-6 6H24c-4 0-6-3-6-6z"
        fill="#f4f1ea"
      />
      <path d="M18 62h232v14H24c-4 0-6-3-6-6z" fill={banda} />
      <rect fill="#1d2230" height="26" rx="4" width="30" x="34" y="26" />
      <rect fill="#1d2230" height="26" rx="4" width="30" x="72" y="26" />
      <rect fill="#1d2230" height="26" rx="4" width="30" x="110" y="26" />
      <rect fill="#1d2230" height="26" rx="4" width="30" x="148" y="26" />
      <path d="M186 26h22c6 0 10 3 13 8l12 18h-47z" fill="#1d2230" />
      <path
        d="M40 32l10 0-12 14z M78 32l10 0-12 14z M116 32l10 0-12 14z M154 32l10 0-12 14z"
        fill="#fff"
        opacity=".12"
      />
      <rect fill={banda} height="9" rx="2" width="64" x="198" y="14" />
      <circle cx="245" cy="62" fill="#ffe9a8" r="5" />
      <rect fill="#2a2a2f" height="7" rx="3" width="20" x="236" y="76" />
      {[62, 196].map((x) => (
        <g key={x}>
          <circle cx={x} cy="82" fill="#111" r="20" />
          <circle cx={x} cy="82" fill="#3a3a40" r="11" />
          <g
            className={ruedas ? 'rueda-gira' : undefined}
            style={{ transformOrigin: `${x}px 82px` }}
          >
            <line
              stroke="#9a968c"
              strokeLinecap="round"
              strokeWidth="3"
              x1={x - 9}
              x2={x + 9}
              y1="82"
              y2="82"
            />
            <line
              stroke="#9a968c"
              strokeLinecap="round"
              strokeWidth="3"
              x1={x}
              x2={x}
              y1="73"
              y2="91"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
