import { useEffect, type ReactNode } from 'react';

/** un panel lateral que se desliza desde la derecha con el detalle de una fila; se cierra con Escape o tocando afuera */
export function Cajon({
  abierto,
  alCerrar,
  children,
  titulo,
}: {
  abierto: boolean;
  alCerrar: () => void;
  children: ReactNode;
  titulo: string;
}) {
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto, alCerrar]);
  if (!abierto) return null;
  return (
    <div className="cajon-fondo" onClick={alCerrar} role="presentation">
      <aside
        aria-label={titulo}
        className="cajon"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cajon-cabeza">
          <h2>{titulo}</h2>
          <button
            aria-label="Cerrar"
            className="icono-boton"
            onClick={alCerrar}
            type="button"
          >
            ×
          </button>
        </header>
        <div className="cajon-cuerpo">{children}</div>
      </aside>
    </div>
  );
}
