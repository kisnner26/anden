const TRAZOS: Record<string, string> = {
  actividad: 'M2 12h4l3-8 4 16 3-8h6',
  alertas: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  conductores: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c1-5 5-7 8-7s7 2 8 7',
  encomiendas: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',
  envivo:
    'M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M7 7a7 7 0 000 10M17 7a7 7 0 010 10M4 4a11 11 0 000 16M20 4a11 11 0 010 16',
  finanzas: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  pasajeros:
    'M8 11a3 3 0 100-6 3 3 0 000 6zM2 20c.5-4 3-6 6-6s5.5 2 6 6M16 11a3 3 0 100-6M18 14c2 .7 3.5 2.5 4 6',
  solicitudes: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  tablero: 'M3 3h8v8H3zM13 3h8v5h-8zM13 11h8v10h-8zM3 14h8v7H3z',
  viajes:
    'M3 17V7a2 2 0 012-2h10l5 5v7zM3 17h18M7 20a1.5 1.5 0 100-3M17 20a1.5 1.5 0 100-3',
};

/** los íconos del menú: trazos finos de una sola línea, del mismo grosor que el resto del panel */
export function IconoNav({ nombre }: { nombre: string }) {
  return (
    <svg
      aria-hidden="true"
      className="icono-nav"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path d={TRAZOS[nombre] ?? TRAZOS.tablero} />
    </svg>
  );
}
