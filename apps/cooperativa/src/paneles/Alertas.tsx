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
  const pendientes = filas.filter((a) => !a.atendida);
  async function atender(a: AlertaFila) {
    await supabase!.from('alertas').update({ atendida: true }).eq('id', a.id);
    await recargar();
  }
  return (
    <div className="pagina">
      <header className="encabezado">
        <p className="micro">
          06 / SEGURIDAD · {pendientes.length} SIN ATENDER
        </p>
        <h1 className="display">
          <span>SI ALGO</span>
          <em>PASA.</em>
        </h1>
        <p className="lead">
          Un teléfono detectó un posible choque y la persona no respondió a
          tiempo. Se actualiza cada 5 segundos.
        </p>
      </header>
      {cargando && <p className="vacio">Cargando…</p>}
      {!cargando && filas.length === 0 && (
        <p className="vacio">No hay alertas. Qué bueno.</p>
      )}
      <div className="cartas">
        {filas.map((a) => (
          <article
            className={`carta${a.atendida ? '' : ' urgente'}`}
            key={a.id}
          >
            {!a.atendida && <span className="punto-rojo" />}
            <p className="micro">
              {new Date(a.creada_en).toLocaleString('es-NI')} · VIAJE{' '}
              {a.viaje_id ?? '—'}
            </p>
            <h3 className="nombre">{a.nombre ?? 'Una persona'}</h3>
            <p className="suave">Posible choque detectado por el teléfono.</p>
            <div className="acciones">
              {a.lat !== null && a.lng !== null && (
                <a
                  className="boton-linea"
                  href={`https://maps.apple.com/?ll=${a.lat},${a.lng}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  VER UBICACIÓN ↗
                </a>
              )}
              {!a.atendida ? (
                <button
                  className="boton-ed"
                  onClick={() => void atender(a)}
                  type="button"
                >
                  MARCAR ATENDIDA
                </button>
              ) : (
                <span className="chip ok">ATENDIDA</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
