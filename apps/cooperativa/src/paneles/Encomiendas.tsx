import type { EncomiendaFila } from '../resumen';
import { useLista } from '../useDatos';

const COLUMNAS = [
  { estados: ['solicitada'], titulo: 'SOLICITADAS' },
  { estados: ['aceptada'], titulo: 'ACEPTADAS' },
  { estados: ['recibida'], titulo: 'EN EL BUS' },
  { estados: ['entregada'], titulo: 'ENTREGADAS' },
] as const;

export function Encomiendas() {
  const { cargando, filas } = useLista<EncomiendaFila>(
    'encomiendas',
    'id, chofer_id, estado, motivo, contenido',
    { columna: 'creada_en' },
  );
  const rechazadas = filas.filter(
    (e) => e.estado === 'rechazada' || e.estado === 'cancelada',
  );
  return (
    <div className="pagina">
      <header className="encabezado">
        <p className="micro">05 / ENCOMIENDAS · {filas.length} EN TOTAL</p>
        <h1 className="display">
          <span>PAQUETES</span>
          <em>EN RUTA.</em>
        </h1>
        <p className="lead">
          Cada envío avanza de columna cuando el chofer lo acepta, lo recibe y
          lo entrega.
        </p>
      </header>
      {cargando && <p className="vacio">Cargando…</p>}
      <div className="kanban">
        {COLUMNAS.map((col) => {
          const lista = filas.filter((e) =>
            (col.estados as readonly string[]).includes(e.estado),
          );
          return (
            <section className="columna" key={col.titulo}>
              <h2 className="micro">
                {col.titulo} · {lista.length}
              </h2>
              {lista.map((e, i) => (
                <article
                  className="ficha"
                  key={e.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <p className="micro">{e.contenido.codigo}</p>
                  <p className="destino">
                    {e.contenido.origen} → {e.contenido.destino}
                  </p>
                  <p className="suave">{e.contenido.descripcion}</p>
                  <p className="micro">
                    {e.chofer_id ? e.chofer_id.toUpperCase() : 'SIN CHOFER'}
                  </p>
                </article>
              ))}
              {lista.length === 0 && <p className="vacio chico">Vacío.</p>}
            </section>
          );
        })}
      </div>
      {rechazadas.length > 0 && (
        <section className="bloque">
          <h2 className="titulo-bloque">RECHAZADAS Y CANCELADAS</h2>
          <ul className="lista">
            {rechazadas.map((e) => (
              <li key={e.id}>
                <span>
                  {e.contenido.codigo} · {e.contenido.origen} →{' '}
                  {e.contenido.destino}
                </span>
                <span className="suave">
                  {e.motivo ?? 'Cancelada por quien la envió'}
                </span>
                <span className="chip no">
                  {e.estado === 'rechazada' ? 'RECHAZADA' : 'CANCELADA'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
