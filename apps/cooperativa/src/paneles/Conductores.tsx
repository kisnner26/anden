import { useLista } from '../useDatos';

interface Conductor {
  chofer_id: string | null;
  creado_en: string;
  nombre: string;
  usuario: string | null;
}
interface Publico {
  chofer_id: string;
  foto_url: string | null;
  nombre: string;
}

export function Conductores() {
  const perfiles = useLista<Conductor & { rol: string }>(
    'perfiles',
    'nombre, usuario, chofer_id, rol, creado_en',
    { columna: 'creado_en' },
  );
  const publicos = useLista<Publico>(
    'perfiles_chofer',
    'chofer_id, nombre, foto_url',
  );
  const conductores = perfiles.filas.filter((p) => p.rol === 'conductor');
  return (
    <section>
      <h1>Conductores</h1>
      <p className="suave">{conductores.length} conductores activos.</p>
      <div className="rejilla">
        {conductores.map((c) => {
          const publico = publicos.filas.find(
            (p) => p.chofer_id === c.chofer_id,
          );
          return (
            <article className="tarjeta" key={c.chofer_id ?? c.usuario}>
              {publico?.foto_url ? (
                <img alt={c.nombre} className="avatar" src={publico.foto_url} />
              ) : (
                <div className="avatar vacio">{c.nombre.slice(0, 1)}</div>
              )}
              <h3>{publico?.nombre ?? c.nombre}</h3>
              <p className="suave">
                Usuario {c.usuario ?? '—'} · Código {c.chofer_id ?? '—'}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
