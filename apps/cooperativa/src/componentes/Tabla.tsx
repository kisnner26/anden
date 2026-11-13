import { useMemo, useState, type ReactNode } from 'react';

import { descargarCsv, aCsv } from '../lib/csv';
import {
  buscar,
  ordenar,
  paginar,
  totalPaginas,
  type Sentido,
} from '../lib/tabla';
import { Vacio } from './Vacio';

export interface Columna<T> {
  clave: string;
  /** lo que se muestra en la celda */
  celda: (fila: T) => ReactNode;
  /** el valor para ordenar y exportar; sin él la columna no se ordena */
  valor?: (fila: T) => unknown;
  ancho?: string;
  /** empieza oculta y se activa desde el menú de columnas */
  oculta?: boolean;
  titulo: string;
}

export interface Filtro<T> {
  clave: string;
  titulo: string;
  prueba: (fila: T) => boolean;
}

/**
 * la tabla de datos de todo el panel: búsqueda, filtros en fichas, orden por columna, columnas que se
 * muestran u ocultan, páginas, selección de filas con acciones en lote y exportación a CSV
 */
export function Tabla<T>({
  accionesEnLote,
  alAbrir,
  columnas,
  filas,
  filtros = [],
  idDe,
  nombreArchivo,
  textoDe,
  vacio,
}: {
  accionesEnLote?: (seleccion: T[], limpiar: () => void) => ReactNode;
  alAbrir?: (fila: T) => void;
  columnas: readonly Columna<T>[];
  filas: readonly T[];
  filtros?: readonly Filtro<T>[];
  idDe: (fila: T) => string;
  nombreArchivo: string;
  textoDe: (fila: T) => string;
  vacio: { detalle: string; titulo: string };
}) {
  const [consulta, establecerConsulta] = useState('');
  const [filtro, establecerFiltro] = useState<string | null>(null);
  const [orden, establecerOrden] = useState<{
    clave: string;
    sentido: Sentido;
  } | null>(null);
  const [ocultas, establecerOcultas] = useState<Set<string>>(
    () => new Set(columnas.filter((c) => c.oculta).map((c) => c.clave)),
  );
  const [menuColumnas, establecerMenuColumnas] = useState(false);
  const [pagina, establecerPagina] = useState(0);
  const [tamano, establecerTamano] = useState(10);
  const [seleccion, establecerSeleccion] = useState<Set<string>>(new Set());

  const visibles = columnas.filter((c) => !ocultas.has(c.clave));
  const procesadas = useMemo(() => {
    let lista = [...filas];
    const activo = filtros.find((f) => f.clave === filtro);
    if (activo) lista = lista.filter(activo.prueba);
    lista = buscar(lista, textoDe, consulta);
    const columna = columnas.find((c) => c.clave === orden?.clave);
    if (columna?.valor && orden)
      lista = ordenar(lista, columna.valor, orden.sentido);
    return lista;
  }, [columnas, consulta, filas, filtro, filtros, orden, textoDe]);

  const paginas = totalPaginas(procesadas.length, tamano);
  const actual = Math.min(pagina, paginas - 1);
  const pagina_ = paginar(procesadas, actual, tamano);
  const elegidas = filas.filter((f) => seleccion.has(idDe(f)));
  const todasEnPagina =
    pagina_.length > 0 && pagina_.every((f) => seleccion.has(idDe(f)));

  function alternar(id: string) {
    establecerSeleccion((previa) => {
      const nueva = new Set(previa);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });
  }

  function exportar() {
    const cols = visibles.filter((c) => c.valor);
    descargarCsv(
      `${nombreArchivo}.csv`,
      aCsv(
        cols.map((c) => c.titulo),
        procesadas.map((f) => cols.map((c) => c.valor?.(f))),
      ),
    );
  }

  return (
    <div className="tabla-marco">
      {elegidas.length > 0 && accionesEnLote ? (
        <div className="lote" role="toolbar">
          <span>
            {elegidas.length}{' '}
            {elegidas.length === 1 ? 'seleccionada' : 'seleccionadas'}
          </span>
          <div className="lote-acciones">
            {accionesEnLote(elegidas, () => establecerSeleccion(new Set()))}
            <button
              className="boton-t"
              onClick={() => establecerSeleccion(new Set())}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="barra-tabla" role="toolbar">
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
              aria-label="Buscar en la tabla"
              onChange={(e) => {
                establecerConsulta(e.target.value);
                establecerPagina(0);
              }}
              placeholder="Buscar"
              value={consulta}
            />
          </label>
          <div className="barra-tabla-acciones">
            <div className="menu-relativo">
              <button
                aria-expanded={menuColumnas}
                className="boton-t"
                onClick={() => establecerMenuColumnas((v) => !v)}
                type="button"
              >
                Columnas
              </button>
              {menuColumnas && (
                <div className="menu" role="menu">
                  {columnas.map((c) => (
                    <label key={c.clave}>
                      <input
                        checked={!ocultas.has(c.clave)}
                        onChange={() =>
                          establecerOcultas((previas) => {
                            const n = new Set(previas);
                            if (n.has(c.clave)) n.delete(c.clave);
                            else n.add(c.clave);
                            return n;
                          })
                        }
                        type="checkbox"
                      />
                      {c.titulo}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button
              className="boton-t"
              disabled={procesadas.length === 0}
              onClick={exportar}
              type="button"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      )}

      {filtros.length > 0 && (
        <div className="fichas" role="group" aria-label="Filtros">
          <button
            aria-pressed={filtro === null}
            className="ficha-f"
            onClick={() => {
              establecerFiltro(null);
              establecerPagina(0);
            }}
            type="button"
          >
            Todo <span>{filas.length}</span>
          </button>
          {filtros.map((f) => (
            <button
              aria-pressed={filtro === f.clave}
              className="ficha-f"
              key={f.clave}
              onClick={() => {
                establecerFiltro(f.clave);
                establecerPagina(0);
              }}
              type="button"
            >
              {f.titulo} <span>{filas.filter(f.prueba).length}</span>
            </button>
          ))}
        </div>
      )}

      {procesadas.length === 0 ? (
        <Vacio
          {...(consulta || filtro
            ? {
                detalle: 'Probá con otra búsqueda o quitá los filtros.',
                titulo: 'Nada coincide',
              }
            : vacio)}
        />
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                {accionesEnLote && (
                  <th className="casilla">
                    <input
                      aria-label="Seleccionar la página"
                      checked={todasEnPagina}
                      onChange={() =>
                        establecerSeleccion((previa) => {
                          const n = new Set(previa);
                          for (const f of pagina_) {
                            if (todasEnPagina) n.delete(idDe(f));
                            else n.add(idDe(f));
                          }
                          return n;
                        })
                      }
                      type="checkbox"
                    />
                  </th>
                )}
                {visibles.map((c) => (
                  <th
                    aria-sort={
                      orden?.clave === c.clave
                        ? orden.sentido === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    key={c.clave}
                    style={{ width: c.ancho }}
                  >
                    {c.valor ? (
                      <button
                        className="orden"
                        onClick={() =>
                          establecerOrden((o) =>
                            o?.clave === c.clave
                              ? o.sentido === 'asc'
                                ? { clave: c.clave, sentido: 'desc' }
                                : null
                              : { clave: c.clave, sentido: 'asc' },
                          )
                        }
                        type="button"
                      >
                        {c.titulo}
                        <svg aria-hidden="true" viewBox="0 0 10 14">
                          <path
                            d="M5 1l3.5 4.5h-7zM5 13L1.5 8.5h7z"
                            fill="currentColor"
                            opacity={orden?.clave === c.clave ? 1 : 0.3}
                          />
                        </svg>
                      </button>
                    ) : (
                      c.titulo
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagina_.map((fila, i) => (
                <tr
                  aria-selected={seleccion.has(idDe(fila))}
                  className={alAbrir ? 'clicable' : undefined}
                  key={idDe(fila)}
                  onClick={() => alAbrir?.(fila)}
                  style={{ animationDelay: `${i * 18}ms` }}
                >
                  {accionesEnLote && (
                    <td
                      className="casilla"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        aria-label="Seleccionar fila"
                        checked={seleccion.has(idDe(fila))}
                        onChange={() => alternar(idDe(fila))}
                        type="checkbox"
                      />
                    </td>
                  )}
                  {visibles.map((c) => (
                    <td key={c.clave}>{c.celda(fila)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="paginacion">
        <label>
          Filas por página
          <select
            onChange={(e) => {
              establecerTamano(Number(e.target.value));
              establecerPagina(0);
            }}
            value={tamano}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span>
          {procesadas.length === 0
            ? '0'
            : `${actual * tamano + 1}–${Math.min(procesadas.length, actual * tamano + tamano)}`}{' '}
          de {procesadas.length}
        </span>
        <div className="paginacion-botones">
          <button
            aria-label="Página anterior"
            className="icono-boton"
            disabled={actual === 0}
            onClick={() => establecerPagina(actual - 1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Página siguiente"
            className="icono-boton"
            disabled={actual >= paginas - 1}
            onClick={() => establecerPagina(actual + 1)}
            type="button"
          >
            ›
          </button>
        </div>
      </footer>
    </div>
  );
}
