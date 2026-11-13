import type { EncomiendaFila } from '../resumen';
import { useLista } from '../useDatos';

const NOMBRES: Record<string, string> = {
  aceptada: 'Aceptada',
  cancelada: 'Cancelada',
  entregada: 'Entregada',
  recibida: 'En el bus',
  rechazada: 'Rechazada',
  solicitada: 'Solicitada',
};

export function Encomiendas() {
  const { cargando, filas } = useLista<EncomiendaFila>(
    'encomiendas',
    'id, chofer_id, estado, motivo, contenido',
    { columna: 'creada_en' },
  );
  return (
    <section>
      <h1>Encomiendas</h1>
      <p className="suave">
        Lo que envían los pasajeros y lo que responden los choferes, en tiempo
        real.
      </p>
      {cargando && <p className="suave">Cargando…</p>}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Trayecto</th>
            <th>Qué lleva</th>
            <th>Chofer</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((e) => (
            <tr key={e.id}>
              <td>{e.contenido.codigo}</td>
              <td>
                {e.contenido.origen} → {e.contenido.destino}
              </td>
              <td>{e.contenido.descripcion}</td>
              <td>{e.chofer_id ?? '—'}</td>
              <td>
                {NOMBRES[e.estado] ?? e.estado}
                {e.motivo ? ` · ${e.motivo}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
