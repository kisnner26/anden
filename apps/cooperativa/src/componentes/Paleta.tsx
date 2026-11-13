import { useEffect, useMemo, useRef, useState } from 'react';

import { buscar } from '../lib/tabla';

export interface Comando {
  clave: string;
  grupo: string;
  ejecutar: () => void;
  titulo: string;
}

/** la paleta de comandos (⌘K o Ctrl+K): escribís y saltás a cualquier sección, conductor o viaje, o cambiás el tema sin tocar el ratón */
export function Paleta({
  abierta,
  alCerrar,
  comandos,
}: {
  abierta: boolean;
  alCerrar: () => void;
  comandos: readonly Comando[];
}) {
  const [consulta, establecerConsulta] = useState('');
  const [foco, establecerFoco] = useState(0);
  const entrada = useRef<HTMLInputElement>(null);
  const resultados = useMemo(
    () =>
      buscar(comandos, (c) => `${c.titulo} ${c.grupo}`, consulta).slice(0, 12),
    [comandos, consulta],
  );

  useEffect(() => {
    if (abierta) {
      establecerConsulta('');
      establecerFoco(0);
      window.setTimeout(() => entrada.current?.focus(), 30);
    }
  }, [abierta]);

  if (!abierta) return null;
  const elegir = (c: Comando | undefined) => {
    if (!c) return;
    alCerrar();
    c.ejecutar();
  };
  return (
    <div className="paleta-fondo" onClick={alCerrar} role="presentation">
      <div
        aria-label="Paleta de comandos"
        className="paleta"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <input
          aria-label="Escribí un comando o buscá"
          onChange={(e) => {
            establecerConsulta(e.target.value);
            establecerFoco(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              establecerFoco((f) => Math.min(resultados.length - 1, f + 1));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              establecerFoco((f) => Math.max(0, f - 1));
            }
            if (e.key === 'Enter') elegir(resultados[foco]);
            if (e.key === 'Escape') alCerrar();
          }}
          placeholder="Ir a una sección, buscar un conductor o un viaje…"
          ref={entrada}
          value={consulta}
        />
        <ul role="listbox">
          {resultados.length === 0 && (
            <li className="paleta-vacio">Nada coincide.</li>
          )}
          {resultados.map((c, i) => (
            <li
              aria-selected={i === foco}
              key={c.clave}
              onClick={() => elegir(c)}
              onMouseEnter={() => establecerFoco(i)}
              role="option"
            >
              <span>{c.titulo}</span>
              <span className="micro">{c.grupo}</span>
            </li>
          ))}
        </ul>
        <footer className="micro">
          ↑↓ para moverte · Enter para elegir · Esc para cerrar
        </footer>
      </div>
    </div>
  );
}
