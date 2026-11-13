import type { AlertaFila } from '../resumen';
import { supabase } from '../supabase';
import { useLista } from '../useDatos';

export function Alertas() {
  const { cargando, filas, recargar } = useLista<AlertaFila>(
    'alertas',
    'id, viaje_id, tipo, lat, lng, nombre, atendida, creada_en',
    { columna: 'creada_en' },
    5000,
  );
  async function atender(a: AlertaFila) {
    await supabase!.from('alertas').update({ atendida: true }).eq('id', a.id);
    await recargar();
  }
  return (
    <section>
      <h1>Alertas de seguridad</h1>
      <p className="suave">
        Un pasajero o conductor no respondió después de un posible choque. Se
        actualiza cada 5 segundos.
      </p>
      {cargando && <p className="suave">Cargando…</p>}
      {!cargando && filas.length === 0 && (
        <p className="suave">No hay alertas.</p>
      )}
      {filas.map((a) => (
        <article className={`tarjeta${a.atendida ? '' : ' alerta'}`} key={a.id}>
          <h3>{a.nombre ?? 'Una persona'} · posible choque</h3>
          <p className="suave">
            {new Date(a.creada_en).toLocaleString('es-NI')} · Viaje{' '}
            {a.viaje_id ?? '—'}
          </p>
          <div className="fila">
            {a.lat !== null && a.lng !== null && (
              <a
                href={`https://maps.apple.com/?ll=${a.lat},${a.lng}`}
                rel="noreferrer"
                target="_blank"
              >
                Ver en el mapa
              </a>
            )}
            {!a.atendida ? (
              <button
                className="primario"
                onClick={() => void atender(a)}
                type="button"
              >
                Marcar como atendida
              </button>
            ) : (
              <span className="suave">Atendida</span>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
