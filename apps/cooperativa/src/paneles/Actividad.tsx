import { useState } from 'react';

import { useDatos } from '../DatosContexto';
import { lineaDeTiempo, type Evento } from '../lib/analitica';
import { buscar } from '../lib/tabla';
import { fechaHora, hace } from '../lib/formato';

const TIPOS: { clave: Evento['tipo']; titulo: string }[] = [
  { clave: 'viaje', titulo: 'Viajes' },
  { clave: 'boleto', titulo: 'Boletos' },
  { clave: 'encomienda', titulo: 'Encomiendas' },
  { clave: 'cierre', titulo: 'Cierres' },
  { clave: 'alerta', titulo: 'Alertas' },
];

export function Actividad() {
  const d = useDatos();
  const [consulta, establecerConsulta] = useState('');
  const [tipos, establecerTipos] = useState<Set<string>>(
    new Set(TIPOS.map((t) => t.clave)),
  );
  const todos = lineaDeTiempo(d, 400);
  const filtrados = buscar(
    todos.filter((e) => tipos.has(e.tipo)),
    (e) => `${e.titulo} ${e.detalle}`,
    consulta,
  ).slice(0, 120);
  return (
    <>
      <div className="barra-tabla">
        <label className="busca">
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <circle
              cx="7"
              cy="7"
              fill="none"
              r="5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M11 11l4 4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          </svg>
          <input
            aria-label="Buscar en la actividad"
            onChange={(e) => establecerConsulta(e.target.value)}
            placeholder="Buscar"
            value={consulta}
          />
        </label>
      </div>
      <div className="fichas" role="group" aria-label="Tipos">
        {TIPOS.map((t) => (
          <button
            aria-pressed={tipos.has(t.clave)}
            className="ficha-f"
            key={t.clave}
            onClick={() =>
              establecerTipos((p) => {
                const n = new Set(p);
                if (n.has(t.clave)) n.delete(t.clave);
                else n.add(t.clave);
                return n;
              })
            }
            type="button"
          >
            <i className={`ev ev-${t.clave}`} /> {t.titulo}{' '}
            <span>{todos.filter((e) => e.tipo === t.clave).length}</span>
          </button>
        ))}
      </div>
      {filtrados.length === 0 ? (
        <p className="micro">Nada coincide.</p>
      ) : (
        <ol className="eventos grande">
          {filtrados.map((e, i) => (
            <li
              key={`${e.hora}-${i}`}
              style={{ animationDelay: `${Math.min(i, 20) * 15}ms` }}
            >
              <i className={`ev ev-${e.tipo}`} />
              <div>
                <p>{e.titulo}</p>
                <p className="micro">{e.detalle}</p>
              </div>
              <span className="micro" title={fechaHora(e.hora)}>
                {hace(e.hora)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
