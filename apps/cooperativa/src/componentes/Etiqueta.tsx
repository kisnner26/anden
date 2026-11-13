import type { ReactNode } from 'react';

export type Tono = 'aviso' | 'azul' | 'error' | 'neutro' | 'ok';

/** una etiqueta redonda pequeña con punto de color: el estado de una fila de un vistazo */
export function Etiqueta({
  children,
  tono = 'neutro',
}: {
  children: ReactNode;
  tono?: Tono;
}) {
  return (
    <span className={`etiqueta et-${tono}`}>
      <i />
      {children}
    </span>
  );
}
